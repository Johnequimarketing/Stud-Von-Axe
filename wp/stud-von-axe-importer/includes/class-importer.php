<?php
/**
 * The content passes.
 *
 * Every post carries _sva_slug. That is the lookup on a second run: found means
 * update, not found means insert. Nothing is ever deleted, so a client edit is
 * only overwritten in the fields the payload actually carries.
 *
 * post_content stays empty everywhere on purpose. All copy lives in ACF fields.
 *
 * This class parses nothing and decides nothing. Every judgement was made in the
 * generator, where it could be checked before it reached anyone's server.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SVA_Imp_Importer {

	const SLUG_KEY = '_sva_slug';

	/** payload group to post type. */
	const TYPES = array(
		'sport_horses'   => 'sport_horse',
		'breeding_mares' => 'breeding_mare',
		'foals'          => 'foal',
		'embryos'        => 'embryo',
		'stallions'      => 'icsi_stallion',
		'news'           => 'news_item',
		'partners'       => 'partner',
	);

	/**
	 * Which fields hold images. This is the only per client branch in here, and
	 * getting it wrong writes file paths into the database instead of
	 * attachment ids.
	 */
	const SINGLE_IMAGE = array( 'logo', 'photo_2' );
	const GALLERIES    = array( 'gallery' );

	/**
	 * Fields holding slugs that become post ids once everything exists.
	 * A stallion's list spans the lot: he has sired mares, foals and crosses
	 * on this site, so the search runs over every type until the slug turns up.
	 */
	const RELATIONS = array(
		'crosses' => array( 'embryo', 'foal', 'breeding_mare', 'sport_horse', 'icsi_stallion' ),
	);

	/** @var SVA_Imp_Logger */
	private $log;

	/** @var SVA_Imp_Media */
	private $media;

	/** @var array */
	private $payload;

	/** @var bool */
	private $dry_run;

	public function __construct( SVA_Imp_Logger $log, SVA_Imp_Media $media, array $payload, $dry_run = false ) {
		$this->log     = $log;
		$this->media   = $media;
		$this->payload = $payload;
		$this->dry_run = (bool) $dry_run;
	}

	/**
	 * One slice of one group. The admin screen walks these so a hundred posts
	 * and two hundred images never sit in a single request.
	 */
	public function run_type( $key, $from = 0, $many = 0 ) {
		if ( ! isset( self::TYPES[ $key ] ) ) {
			$this->log->failed( sprintf( 'unknown content type %s', $key ) );
			return;
		}
		$records = isset( $this->payload[ $key ] ) ? (array) $this->payload[ $key ] : array();
		if ( $many > 0 ) {
			$records = array_slice( $records, (int) $from, (int) $many );
		}
		foreach ( $records as $record ) {
			$this->import_one( self::TYPES[ $key ], $record );
		}
	}

	private function import_one( $post_type, array $record ) {
		$slug  = $record['slug'];
		$title = $record['title'];

		$existing = $this->find( $post_type, $slug );

		if ( $this->dry_run ) {
			$this->log->note( sprintf( '%s "%s" would be %s', $post_type, $title, $existing ? 'updated' : 'created' ) );
			return;
		}

		$args = array(
			'post_type'    => $post_type,
			'post_title'   => $title,
			'post_status'  => 'publish',
			'post_content' => '', // never used: all copy lives in ACF fields
			'menu_order'   => isset( $record['menu_order'] ) ? (int) $record['menu_order'] : 0,
		);
		if ( $existing ) {
			// The post is already here, so leave its URL alone: somebody may
			// have renamed it on purpose.
			$args['ID'] = $existing;
		} else {
			$args['post_name'] = $slug;
		}

		$id = wp_insert_post( $args, true );
		if ( is_wp_error( $id ) ) {
			$this->log->failed( sprintf( '%s "%s": %s', $post_type, $title, $id->get_error_message() ) );
			return;
		}

		update_post_meta( $id, self::SLUG_KEY, $slug );
		$this->apply_terms( $id, $record );
		$this->apply_fields( $id, $record );

		$existing ? $this->log->updated( sprintf( '%s "%s"', $post_type, $title ) )
		          : $this->log->created( sprintf( '%s "%s"', $post_type, $title ) );
	}

	/**
	 * The relationship pass, run last because it needs every post to exist.
	 * A stallion holds the crosses made with him; those are embryo slugs in the
	 * payload and post ids in the database.
	 */
	public function run_links() {
		foreach ( self::TYPES as $key => $post_type ) {
			foreach ( (array) ( isset( $this->payload[ $key ] ) ? $this->payload[ $key ] : array() ) as $record ) {
				foreach ( self::RELATIONS as $field => $targets ) {
					if ( ! isset( $record['fields'][ $field ] ) || ! $record['fields'][ $field ] ) {
						continue;
					}
					$ids = array();
					foreach ( (array) $record['fields'][ $field ] as $slug ) {
						$found = 0;
						foreach ( (array) $targets as $target ) {
							$found = $this->find( $target, $slug );
							if ( $found ) {
								break;
							}
						}
						if ( $found ) {
							$ids[] = $found;
						} else {
							$this->log->failed( sprintf( '%s: nothing on the site called "%s"', $record['title'], $slug ) );
						}
					}
					if ( $this->dry_run ) {
						$this->log->note( sprintf( '%s would link to %d cross(es)', $record['title'], count( $ids ) ) );
						continue;
					}
					$post_id = $this->find( $post_type, $record['slug'] );
					unset( $target );
					if ( $post_id ) {
						update_field( $field, $ids, $post_id );
						$this->log->updated( sprintf( '%s linked to %d cross(es)', $record['title'], count( $ids ) ) );
					}
				}
			}
		}
	}

	/**
	 * Put the design imagery in the library. It belongs to no post: the
	 * Elementor templates reach for it, and a template cannot bundle a file.
	 */
	public function run_library() {
		$paths = isset( $this->payload['library'] ) ? (array) $this->payload['library'] : array();
		foreach ( $paths as $path ) {
			$id = $this->media->ensure( $path, '' );
			if ( $this->dry_run ) {
				continue;
			}
			$id ? $this->log->created( sprintf( 'image "%s"', $path ) )
			    : $this->log->failed( sprintf( 'image "%s" did not travel', $path ) );
		}
		if ( $this->dry_run ) {
			$this->log->note( sprintf( '%d design image(s) would be checked', count( $paths ) ) );
		}
	}

	/**
	 * Assign the taxonomy terms a record carries. Terms are created on first use
	 * so the import does not depend on anyone seeding them by hand.
	 */
	private function apply_terms( $post_id, array $record ) {
		if ( empty( $record['terms'] ) ) {
			return;
		}
		foreach ( $record['terms'] as $taxonomy => $names ) {
			$ids = array();
			foreach ( (array) $names as $name ) {
				if ( '' === $name ) {
					continue;
				}
				$term = term_exists( $name, $taxonomy );
				if ( ! $term ) {
					$term = wp_insert_term( $name, $taxonomy );
				}
				if ( is_wp_error( $term ) ) {
					$this->log->failed( sprintf( 'term "%s" in %s: %s', $name, $taxonomy, $term->get_error_message() ) );
					continue;
				}
				$ids[] = (int) $term['term_id'];
			}
			if ( $ids ) {
				wp_set_object_terms( $post_id, $ids, $taxonomy, false );
			}
		}
	}

	private function find( $post_type, $slug ) {
		$found = get_posts(
			array(
				'post_type'      => $post_type,
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				'meta_query'     => array(
					array(
						'key'   => self::SLUG_KEY,
						'value' => $slug,
					),
				),
			)
		);
		return $found ? (int) $found[0] : 0;
	}

	/**
	 * Write the ACF fields, turning image paths into attachment ids on the way.
	 * Relationship fields are left alone here and resolved in run_links().
	 */
	private function apply_fields( $post_id, array $record ) {
		$fields = $record['fields'];
		$alt    = isset( $record['alt'] ) ? $record['alt'] : $record['title'];

		foreach ( self::SINGLE_IMAGE as $name ) {
			if ( ! empty( $fields[ $name ] ) ) {
				$fields[ $name ] = $this->media->ensure( $fields[ $name ], $alt );
			}
		}

		foreach ( self::GALLERIES as $name ) {
			if ( ! isset( $fields[ $name ] ) ) {
				continue;
			}
			$ids = array();
			foreach ( (array) $fields[ $name ] as $path ) {
				$att = $this->media->ensure( $path, $alt );
				if ( $att ) {
					$ids[] = $att;
				}
			}
			$fields[ $name ] = $ids;
		}

		foreach ( $fields as $name => $value ) {
			if ( isset( self::RELATIONS[ $name ] ) ) {
				continue;
			}
			update_field( $name, $value, $post_id );
		}

		// the featured image, so the admin list is readable
		if ( ! empty( $record['thumbnail'] ) ) {
			$thumb = $this->media->ensure( $record['thumbnail'], $alt );
			if ( $thumb ) {
				set_post_thumbnail( $post_id, $thumb );
			}
		}
	}
}
