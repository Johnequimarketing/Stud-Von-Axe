<?php
/**
 * Proves the mapping without a WordPress install.
 *
 * WordPress and ACF are stubbed just far enough that the importer and the
 * structure class can run for real. Every write is recorded instead of saved,
 * then checked. This will not catch a host problem, but it does catch the class
 * of mistake that would otherwise only show up on staging: a field that is never
 * written, an image that is never attached, or content sneaking into post_content.
 *
 * Run: php sva-importer/tests/test-mapping.php
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'SVA_IMP_DIR', dirname( __DIR__ ) . '/' );
define( 'WP_CONTENT_DIR', __DIR__ . '/wp-content' );

$GLOBALS['posts']  = array();
$GLOBALS['meta']   = array();
$GLOBALS['fields'] = array();
$GLOBALS['thumbs'] = array();
$GLOBALS['acf']    = array( 'post_types' => array(), 'groups' => array(), 'taxonomies' => array() );
$GLOBALS['terms']  = array();
$GLOBALS['assigned'] = array();
$GLOBALS['next_id'] = 100;

/** ------------------------------------------------- WordPress, stubbed */
function __( $t, $d = null ) { return $t; }
function esc_html__( $t, $d = null ) { return $t; }
function sanitize_key( $k ) { return strtolower( preg_replace( '/[^a-z0-9_]/i', '', $k ) ); }
function wp_json_encode( $v ) { return json_encode( $v ); }
function current_time() { return '2026-09-03 12:00:00'; }
function update_option( $k, $v ) { return true; }
function get_option( $k, $d = false ) { return $d; }
function is_wp_error( $t ) { return $t instanceof WP_Error; }
class WP_Error { public function get_error_message() { return 'error'; } }

function wp_insert_post( $args, $strict = false ) {
	$id = isset( $args['ID'] ) ? $args['ID'] : $GLOBALS['next_id']++;
	$GLOBALS['posts'][ $id ] = $args;
	return $id;
}
function update_post_meta( $id, $k, $v ) { $GLOBALS['meta'][ $id ][ $k ] = $v; return true; }
function get_posts( $args ) {
	$want = $args['meta_query'][0]['value'];
	$key  = $args['meta_query'][0]['key'];
	foreach ( $GLOBALS['meta'] as $id => $m ) {
		if ( isset( $m[ $key ] ) && $m[ $key ] === $want ) {
			if ( 'attachment' === $args['post_type'] ) { return array( $id ); }
			if ( isset( $GLOBALS['posts'][ $id ]['post_type'] ) && $GLOBALS['posts'][ $id ]['post_type'] === $args['post_type'] ) {
				return array( $id );
			}
		}
	}
	return array();
}
function set_post_thumbnail( $id, $att ) { $GLOBALS['thumbs'][ $id ] = $att; return true; }
function update_field( $name, $value, $id ) { $GLOBALS['fields'][ $id ][ $name ] = $value; return true; }
function wp_upload_bits( $name, $x, $bits ) { return array( 'file' => '/uploads/' . $name, 'error' => false ); }
function wp_check_filetype( $f ) { return array( 'type' => 'image/jpeg' ); }
function wp_insert_attachment( $args, $file ) { $id = $GLOBALS['next_id']++; $GLOBALS['posts'][ $id ] = $args; return $id; }
function wp_generate_attachment_metadata( $id, $file ) { return array(); }
function wp_update_attachment_metadata( $id, $m ) { return true; }

/** ------------------------------------------------------- ACF, stubbed */
function term_exists( $name, $tax ) { return isset( $GLOBALS['terms'][ $tax ][ $name ] ) ? array( 'term_id' => $GLOBALS['terms'][ $tax ][ $name ] ) : null; }
function wp_insert_term( $name, $tax ) { $id = $GLOBALS['next_id']++; $GLOBALS['terms'][ $tax ][ $name ] = $id; return array( 'term_id' => $id ); }
function wp_set_object_terms( $post_id, $ids, $tax, $append ) { $GLOBALS['assigned'][ $post_id ][ $tax ] = $ids; return $ids; }
function acf_get_internal_post_type_post( $key, $type ) { return null; }
function acf_update_internal_post_type( $args, $type ) { $slot = ( 'acf-taxonomy' === $type ) ? 'taxonomies' : 'post_types'; $GLOBALS['acf'][ $slot ][ $args['key'] ] = $args; return $args; }
function acf_get_field_group( $key ) { return null; }
function acf_import_field_group( $g ) { $GLOBALS['acf']['groups'][ $g['key'] ] = $g; return $g; }

require_once SVA_IMP_DIR . 'includes/class-logger.php';
require_once SVA_IMP_DIR . 'includes/class-structure.php';
require_once SVA_IMP_DIR . 'includes/class-media.php';
require_once SVA_IMP_DIR . 'includes/class-importer.php';

/** ------------------------------------------------------------- the run */
$payload = json_decode( file_get_contents( SVA_IMP_DIR . 'data/payload.json' ), true );
$log     = new SVA_Imp_Logger();

$GROUPS = SVA_Imp_Importer::TYPES;   // payload group => post type

( new SVA_Imp_Structure( $log, false ) )->run();
$media    = new SVA_Imp_Media( $log, $payload['media'], false );
$importer = new SVA_Imp_Importer( $log, $media, $payload, false );
foreach ( array_keys( $GROUPS ) as $t ) {
	$importer->run_type( $t );
}
$importer->run_library();
$importer->run_links();

/** ------------------------------------------------------------- checks */
$fail = array();
$ok   = 0;

function check( $label, $condition, &$fail, &$ok ) {
	if ( $condition ) { $ok++; } else { $fail[] = $label; }
}

/** Find the post that came from a payload record. */
function post_for( $slug, $post_type ) {
	foreach ( $GLOBALS['meta'] as $pid => $m ) {
		if ( isset( $m['_sva_slug'] ) && $m['_sva_slug'] === $slug
			&& isset( $GLOBALS['posts'][ $pid ]['post_type'] )
			&& $GLOBALS['posts'][ $pid ]['post_type'] === $post_type ) {
			return $pid;
		}
	}
	return null;
}

// 1. one post per record, per group
foreach ( $GROUPS as $key => $pt ) {
	$n = 0;
	foreach ( $GLOBALS['posts'] as $p ) {
		if ( isset( $p['post_type'] ) && $p['post_type'] === $pt ) { $n++; }
	}
	check( sprintf( '%s: %d posts, expected %d', $pt, $n, count( $payload[ $key ] ) ), $n === count( $payload[ $key ] ), $fail, $ok );
}

// 2. nothing in post_content, anywhere. All copy lives in ACF.
$leaked = 0;
foreach ( $GLOBALS['posts'] as $p ) {
	if ( isset( $p['post_type'] ) && ! empty( $p['post_content'] ) ) { $leaked++; }
}
check( sprintf( 'post_content used on %d posts, must be 0', $leaked ), 0 === $leaked, $fail, $ok );

// 3. no post type declares editor support, and every one is visible to REST,
//    without which Elementor's dynamic tags cannot see the fields
foreach ( $GLOBALS['acf']['post_types'] as $pt ) {
	check( sprintf( '%s supports the editor', $pt['post_type'] ), ! in_array( 'editor', (array) $pt['supports'], true ), $fail, $ok );
	check( sprintf( '%s is not in the REST API', $pt['post_type'] ), true === $pt['show_in_rest'], $fail, $ok );
}

// 4. the structure is all there
check( 'seven post types registered, got ' . count( $GLOBALS['acf']['post_types'] ), 7 === count( $GLOBALS['acf']['post_types'] ), $fail, $ok );
check( 'seven taxonomies registered, got ' . count( $GLOBALS['acf']['taxonomies'] ), 7 === count( $GLOBALS['acf']['taxonomies'] ), $fail, $ok );
check( 'seven field groups registered, got ' . count( $GLOBALS['acf']['groups'] ), 7 === count( $GLOBALS['acf']['groups'] ), $fail, $ok );

// 5. THE ONE THAT EARNS ITS KEEP.
//    Every field a group declares is actually written by the importer. This is
//    what catches a field added to the structure and forgotten in the
//    generator: it looks right in the admin and is empty for ever.
$written = array();
foreach ( $GLOBALS['fields'] as $set ) {
	foreach ( array_keys( $set ) as $n ) { $written[ $n ] = true; }
}
foreach ( $GLOBALS['acf']['groups'] as $g ) {
	foreach ( $g['fields'] as $f ) {
		if ( 'tab' === $f['type'] ) { continue; }   // a tab holds no value
		check( sprintf( 'field "%s" (%s) is never written', $f['name'], $g['title'] ), isset( $written[ $f['name'] ] ), $fail, $ok );
	}
}

// 6. taxonomies sit on the post types they were meant for, and every record
//    carries at most one term in each, bar the sire of a cross
$expect_on = array(
	'availability' => array( 'sport_horse', 'breeding_mare', 'foal' ),
	'embryo_stage' => array( 'embryo' ),
	'horse_sex'    => array( 'sport_horse', 'breeding_mare', 'foal' ),
	'studbook'     => array( 'sport_horse', 'breeding_mare', 'foal', 'icsi_stallion' ),
	'birth_year'   => array( 'sport_horse', 'breeding_mare', 'foal' ),
	'sire'         => array( 'sport_horse', 'breeding_mare', 'foal', 'embryo', 'icsi_stallion' ),
	'sold_to'      => array( 'sport_horse', 'breeding_mare', 'foal' ),
);
foreach ( $GLOBALS['acf']['taxonomies'] as $t ) {
	$slug = $t['taxonomy'];
	check( sprintf( 'taxonomy %s is not in the expected list', $slug ), isset( $expect_on[ $slug ] ), $fail, $ok );
	if ( isset( $expect_on[ $slug ] ) ) {
		check( sprintf( 'taxonomy %s is on the wrong post types', $slug ), $expect_on[ $slug ] === array_values( (array) $t['object_type'] ), $fail, $ok );
	}
}
foreach ( $GROUPS as $key => $pt ) {
	foreach ( $payload[ $key ] as $r ) {
		$id = post_for( $r['slug'], $pt );
		if ( null === $id ) { continue; }
		foreach ( (array) ( isset( $GLOBALS['assigned'][ $id ] ) ? $GLOBALS['assigned'][ $id ] : array() ) as $tax => $ids ) {
			check( sprintf( '%s has %d terms in %s, expected 1', $r['slug'], count( $ids ), $tax ), 1 === count( $ids ), $fail, $ok );
		}
	}
}

// 7. every record found its post, image fields hold ids and not paths, and
//    every record with a photograph got a featured image
foreach ( $GROUPS as $key => $pt ) {
	foreach ( $payload[ $key ] as $r ) {
		$id = post_for( $r['slug'], $pt );
		check( sprintf( '%s "%s" was not created', $pt, $r['slug'] ), null !== $id, $fail, $ok );
		if ( null === $id ) { continue; }

		foreach ( SVA_Imp_Importer::GALLERIES as $name ) {
			if ( ! isset( $r['fields'][ $name ] ) ) { continue; }
			$g = $GLOBALS['fields'][ $id ][ $name ];
			check( sprintf( '%s gallery holds paths, not ids', $r['slug'] ), $g === array_filter( $g, 'is_int' ), $fail, $ok );
			check( sprintf( '%s lost %d photograph(s) on the way in', $r['slug'], count( $r['fields'][ $name ] ) - count( $g ) ), count( $g ) === count( $r['fields'][ $name ] ), $fail, $ok );
		}
		foreach ( SVA_Imp_Importer::SINGLE_IMAGE as $name ) {
			if ( empty( $r['fields'][ $name ] ) ) { continue; }
			check( sprintf( '%s %s holds a path, not an id', $r['slug'], $name ), is_int( $GLOBALS['fields'][ $id ][ $name ] ), $fail, $ok );
		}
		if ( ! empty( $r['thumbnail'] ) ) {
			check( sprintf( '%s has no featured image', $r['slug'] ), isset( $GLOBALS['thumbs'][ $id ] ), $fail, $ok );
		}
	}
}

// 8. the pedigree arrives whole: fourteen cells on every horse, cross and stallion
foreach ( array( 'sport_horses', 'breeding_mares', 'foals', 'embryos', 'stallions' ) as $key ) {
	foreach ( $payload[ $key ] as $r ) {
		$id = post_for( $r['slug'], $GROUPS[ $key ] );
		if ( null === $id ) { continue; }
		$cells = 0;
		foreach ( array( 'sire', 'dam', 'sire_sire', 'sire_dam', 'dam_sire', 'dam_dam' ) as $c ) {
			if ( array_key_exists( $c, $GLOBALS['fields'][ $id ] ) ) { $cells++; }
		}
		for ( $i = 1; $i <= 8; $i++ ) {
			if ( array_key_exists( 'gp_' . $i, $GLOBALS['fields'][ $id ] ) ) { $cells++; }
		}
		check( sprintf( '%s has %d pedigree cells, expected 14', $r['slug'], $cells ), 14 === $cells, $fail, $ok );
	}
}

// 9. a stallion points at the crosses made with him, as post ids
foreach ( $payload['stallions'] as $r ) {
	$id = post_for( $r['slug'], 'icsi_stallion' );
	if ( null === $id ) { continue; }
	$want = count( $r['fields']['crosses'] );
	$got  = isset( $GLOBALS['fields'][ $id ]['crosses'] ) ? $GLOBALS['fields'][ $id ]['crosses'] : array();
	check( sprintf( '%s links to %d crosses, expected %d', $r['slug'], count( $got ), $want ), count( $got ) === $want, $fail, $ok );
	check( sprintf( '%s links to slugs, not ids', $r['slug'] ), $got === array_filter( $got, 'is_int' ), $fail, $ok );
}

// 10. every image in the manifest reached the library, and none twice
$attachments = 0;
foreach ( $GLOBALS['posts'] as $p ) {
	if ( ! isset( $p['post_type'] ) && isset( $p['post_mime_type'] ) ) { $attachments++; }
}
check( sprintf( '%d attachments for %d images in the manifest', $attachments, count( $payload['media'] ) ), $attachments === count( $payload['media'] ), $fail, $ok );

// 11. running twice adds nothing. Somebody always runs it twice.
$before = count( $GLOBALS['posts'] );
foreach ( array_keys( $GROUPS ) as $t ) {
	$importer->run_type( $t );
}
$importer->run_library();
check( sprintf( 'a second run added %d posts, must add 0', count( $GLOBALS['posts'] ) - $before ), count( $GLOBALS['posts'] ) === $before, $fail, $ok );

/** ------------------------------------------------------------- report */
$c = $log->counts();
echo "import: {$c['created']} created, {$c['updated']} updated, {$c['failed']} failed\n";
echo sprintf( "checks: %d passed, %d failed\n\n", $ok, count( $fail ) );
foreach ( $fail as $f ) { echo "  FAIL  $f\n"; }
exit( $fail ? 1 : 0 );
