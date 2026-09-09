<?php
/**
 * Dumps the real ACF structure to JSON, so the Elementor generator binds to
 * field keys the plugin actually creates.
 *
 * The keys are built at runtime ('field_sva_' . $prefix . '_' . $name), so no
 * regex over the source can read them honestly. On the previous build a regex
 * over source skipped one field and that field was invisible to every check.
 * Running the class is the only source that cannot drift.
 *
 * Run: php elementor/dump-acf.php > elementor/acf.json
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'SVA_IMP_DIR', dirname( __DIR__ ) . '/wp/stud-von-axe-importer/' );

$GLOBALS['acf'] = array( 'post_types' => array(), 'groups' => array(), 'taxonomies' => array() );

function __( $t, $d = null ) { return $t; }
function esc_html__( $t, $d = null ) { return $t; }
function wp_json_encode( $v ) { return json_encode( $v ); }
function current_time() { return '2026-09-09 12:00:00'; }
function update_option( $k, $v ) { return true; }
function get_option( $k, $d = false ) { return $d; }
function acf_get_internal_post_type_post( $key, $type ) { return null; }
function acf_update_internal_post_type( $args, $type ) {
	$slot = ( 'acf-taxonomy' === $type ) ? 'taxonomies' : 'post_types';
	$GLOBALS['acf'][ $slot ][ $args['key'] ] = $args;
	return $args;
}
function acf_get_field_group( $key ) { return null; }
function acf_import_field_group( $g ) { $GLOBALS['acf']['groups'][ $g['key'] ] = $g; return $g; }

require_once SVA_IMP_DIR . 'includes/class-logger.php';
require_once SVA_IMP_DIR . 'includes/class-structure.php';

( new SVA_Imp_Structure( new SVA_Imp_Logger(), false ) )->run();

$out = array( 'post_types' => array(), 'taxonomies' => array(), 'groups' => array() );

foreach ( $GLOBALS['acf']['post_types'] as $key => $pt ) {
	$out['post_types'][ $pt['post_type'] ] = array(
		'key'     => $key,
		'archive' => isset( $pt['has_archive'] ) ? $pt['has_archive'] : '',
		'label'   => isset( $pt['labels']['name'] ) ? $pt['labels']['name'] : '',
	);
}
foreach ( $GLOBALS['acf']['taxonomies'] as $key => $tx ) {
	$out['taxonomies'][ $tx['taxonomy'] ] = array(
		'key' => $key,
		'on'  => isset( $tx['object_type'] ) ? array_values( $tx['object_type'] ) : array(),
	);
}
foreach ( $GLOBALS['acf']['groups'] as $key => $g ) {
	$pts = array();
	foreach ( $g['location'] as $or ) {
		foreach ( $or as $rule ) {
			if ( 'post_type' === $rule['param'] ) { $pts[] = $rule['value']; }
		}
	}
	$fields = array();
	foreach ( $g['fields'] as $f ) {
		if ( 'tab' === $f['type'] ) { continue; }
		$fields[ $f['name'] ] = array( 'key' => $f['key'], 'type' => $f['type'], 'label' => $f['label'] );
	}
	$out['groups'][ $key ] = array( 'post_types' => $pts, 'title' => $g['title'], 'fields' => $fields );
}

echo json_encode( $out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ), "\n";
