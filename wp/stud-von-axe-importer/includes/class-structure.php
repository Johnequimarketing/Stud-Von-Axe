<?php
/**
 * The content model: seven post types, seven taxonomies, seven field groups.
 *
 * All of it is written into the database as ACF's own records, with
 * acf_update_internal_post_type() and acf_import_field_group(), and not
 * registered from PHP here. That is the whole promise of this plugin: delete it
 * afterwards and the post types, the fields, the posts and the images all stay,
 * because ACF and WordPress own them rather than us.
 *
 * Keys are stable and prefixed sva_. They are how a second run finds what the
 * first one made, so they must never change once this has been on a live site.
 *
 * Why seven post types and not one with a taxonomy: asked and answered by Mark
 * on 9 September. The playbook argues the other way, and a foal that grows into
 * a sport horse now has to be moved by hand, which is written into the handover
 * rather than left to be discovered.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SVA_Imp_Structure {

	/**
	 * No editor, anywhere. Every piece of copy lives in an ACF field and
	 * post_content stays empty on all 113 posts. A half filled editor beside a
	 * set of fields is where client content goes to get lost.
	 */
	const SUPPORTS = array( 'title', 'thumbnail', 'revisions' );

	/** @var SVA_Imp_Logger */
	private $log;

	/** @var bool */
	private $dry_run;

	public function __construct( SVA_Imp_Logger $log, $dry_run = false ) {
		$this->log     = $log;
		$this->dry_run = (bool) $dry_run;
	}

	/* ── the three factories ─────────────────────────────────────────────── */

	private function pt( $key, $slug, $single, $plural, $icon, $archive ) {
		return array(
			'key'              => 'sva_' . $key,
			'title'            => $plural,
			'active'           => true,
			'post_type'        => $slug,
			'labels'           => array(
				'name'          => $plural,
				'singular_name' => $single,
				'menu_name'     => $plural,
				'add_new_item'  => sprintf( 'Add %s', strtolower( $single ) ),
				'edit_item'     => sprintf( 'Edit %s', strtolower( $single ) ),
				'search_items'  => sprintf( 'Search %s', strtolower( $plural ) ),
				'not_found'     => sprintf( 'No %s yet', strtolower( $plural ) ),
			),
			'public'           => true,
			'hierarchical'     => false,
			// Elementor's dynamic tags cannot see a post type without this.
			'show_in_rest'     => true,
			'menu_icon'        => array( 'type' => 'dashicons', 'value' => $icon ),
			'supports'         => self::SUPPORTS,
			'has_archive'      => (bool) $archive,
			'has_archive_slug' => $archive ? $archive : '',
			'rewrite'          => array(
				'permalink_rewrite' => 'post_type_key',
				'with_front'        => false,
			),
		);
	}

	private function tax( $key, $slug, $single, $plural, $on ) {
		return array(
			'key'               => 'sva_' . $key,
			'title'             => $plural,
			'active'            => true,
			'taxonomy'          => $slug,
			'object_type'       => $on,
			'labels'            => array(
				'name'          => $plural,
				'singular_name' => $single,
				'menu_name'     => $plural,
			),
			'public'            => true,
			'hierarchical'      => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => array(
				'permalink_rewrite' => 'taxonomy_key',
				'slug'              => $slug,
				'with_front'        => false,
			),
		);
	}

	/** $key is namespaced per group so the same field name can live in several. */
	private function f( $key, $label, $name, $type, $extra = array() ) {
		return array_merge(
			array(
				'key'   => 'field_sva_' . $key,
				'label' => $label,
				'name'  => $name,
				'type'  => $type,
			),
			$extra
		);
	}

	/** A tab is just a field, which is why the layout lives in the same list. */
	private function tab( $key, $label ) {
		return $this->f( $key, $label, '', 'tab', array( 'placement' => 'top' ) );
	}

	private function group( $key, $title, $post_types, $fields ) {
		$location = array();
		foreach ( (array) $post_types as $pt ) {
			$location[] = array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => $pt,
				),
			);
		}
		return array(
			'key'                   => 'group_sva_' . $key,
			'title'                 => $title,
			'fields'                => $fields,
			'location'              => $location,
			'menu_order'            => 0,
			'position'              => 'normal',
			'style'                 => 'default',
			'label_placement'       => 'top',
			'instruction_placement' => 'label',
			'active'                => true,
			// The editor is off, so there is nothing to hide but the slug box.
			'hide_on_screen'        => array( 'the_content', 'excerpt', 'custom_fields', 'discussion', 'comments' ),
		);
	}

	private function w( $width ) {
		return array( 'wrapper' => array( 'width' => (string) $width ) );
	}

	/* ── the seven post types ────────────────────────────────────────────── */

	public function post_types() {
		return array(
			$this->pt( 'sport_horse',   'sport_horse',   'Sport horse',    'Sport horses',   'dashicons-awards',    'sport-horses' ),
			$this->pt( 'breeding_mare', 'breeding_mare', 'Breeding mare',  'Breeding mares', 'dashicons-heart',     'breeding-mares' ),
			$this->pt( 'foal',          'foal',          'Foal',           'Foals',          'dashicons-pets',      'foals' ),
			$this->pt( 'embryo',        'embryo',        'Embryo',         'Embryos',        'dashicons-marker',    'embryos' ),
			$this->pt( 'icsi_stallion', 'icsi_stallion', 'ICSI stallion',  'ICSI semen',     'dashicons-star-half', 'icsi-semen' ),
			$this->pt( 'news_item',     'news_item',     'News report',    'News',           'dashicons-megaphone', 'news' ),
			// Partners appear in a rail on three pages, never on an archive of
			// their own, so there is nothing for has_archive to point at.
			$this->pt( 'partner',       'partner',       'Partner',        'Partners',       'dashicons-groups',    '' ),
		);
	}

	/* ── the seven taxonomies ────────────────────────────────────────────── */

	/**
	 * Only what a visitor filters on. Elementor's filter widgets and WordPress
	 * archive queries work on terms and never on ACF values, so anything the
	 * static site puts a chip or a select on has to be a term here. Anything
	 * else stays an ordinary field.
	 */
	public function taxonomies() {
		$three = array( 'sport_horse', 'breeding_mare', 'foal' );
		$five  = array( 'sport_horse', 'breeding_mare', 'foal', 'embryo', 'icsi_stallion' );

		return array(
			$this->tax( 'availability', 'availability', 'Availability',  'Availability',   $three ),
			$this->tax( 'embryo_stage', 'embryo_stage', 'Stage',         'Stages',         array( 'embryo' ) ),
			$this->tax( 'horse_sex',    'horse_sex',    'Sex',           'Sexes',          $three ),
			$this->tax( 'studbook',     'studbook',     'Studbook',      'Studbooks',      array( 'sport_horse', 'breeding_mare', 'foal', 'icsi_stallion' ) ),
			$this->tax( 'birth_year',   'birth_year',   'Year of birth', 'Years of birth', $three ),
			$this->tax( 'sire',         'sire',         'Sire',          'Sires',          $five ),
			$this->tax( 'sold_to',      'sold_to',      'Sold to',       'Sold to',        $three ),
		);
	}

	/* ── the fields ──────────────────────────────────────────────────────── */

	/**
	 * The pedigree, three generations, as fourteen plain text fields.
	 *
	 * Deliberately not a repeater. Elementor cannot loop an ACF repeater
	 * without code, and on the previous build that limitation hit the pedigree
	 * table first. The source shape is already flat, so shipping it flat costs
	 * nothing and every cell is bindable on its own.
	 *
	 * The widths draw the tree: two halves, then four quarters, then eight.
	 */
	private function pedigree_fields( $p ) {
		$out = array(
			$this->tab( $p . '_tab_ped', 'Pedigree' ),
			$this->f( $p . '_sire', 'Sire', 'sire', 'text', $this->w( 50 ) ),
			$this->f( $p . '_dam', 'Dam', 'dam', 'text', $this->w( 50 ) ),
			$this->f( $p . '_sire_sire', "Sire's sire", 'sire_sire', 'text', $this->w( 25 ) ),
			$this->f( $p . '_sire_dam', "Sire's dam", 'sire_dam', 'text', $this->w( 25 ) ),
			$this->f( $p . '_dam_sire', "Dam's sire", 'dam_sire', 'text', $this->w( 25 ) ),
			$this->f( $p . '_dam_dam', "Dam's dam", 'dam_dam', 'text', $this->w( 25 ) ),
		);
		$labels = array(
			"Sire's sire's sire", "Sire's sire's dam", "Sire's dam's sire", "Sire's dam's dam",
			"Dam's sire's sire", "Dam's sire's dam", "Dam's dam's sire", "Dam's dam's dam",
		);
		foreach ( $labels as $i => $label ) {
			$n     = $i + 1;
			$out[] = $this->f(
				$p . '_gp_' . $n,
				$label,
				'gp_' . $n,
				'text',
				array_merge(
					$this->w( 25 ),
					array( 'instructions' => 0 === $i ? 'Leave a cell empty when it is not known. The page prints "To be filled in" rather than a guess.' : '' )
				)
			);
		}
		return $out;
	}

	/** Shared by sport horses, breeding mares and foals. */
	private function horse_fields( $p ) {
		return array_merge(
			array(
				$this->tab( $p . '_tab_horse', 'Horse' ),
				$this->f( $p . '_tagline', 'Tagline', 'tagline', 'text', array_merge( $this->w( 100 ), array(
					'instructions' => 'The owners\' own one line about this horse. It sits in the gold plate on the card.',
				) ) ),
				$this->f( $p . '_genetics', 'Breeding line', 'genetics', 'text', array_merge( $this->w( 100 ), array(
					'instructions' => 'The sire line as one string, for example "Cornet Obolensky x Calato x Darco x Chin Chin".',
				) ) ),
				$this->f( $p . '_sex', 'Sex', 'sex', 'text', $this->w( 25 ) ),
				$this->f( $p . '_year_of_birth', 'Year of birth', 'year_of_birth', 'text', array_merge( $this->w( 25 ), array(
					'instructions' => 'A year, or a full date as dd/mm/yyyy.',
				) ) ),
				$this->f( $p . '_studbook', 'Studbook', 'studbook', 'text', $this->w( 25 ) ),
				$this->f( $p . '_height', 'Height', 'height', 'text', array_merge( $this->w( 25 ), array(
					'instructions' => 'Text, not a number: this holds "168 cm".',
				) ) ),
				$this->f( $p . '_sold', 'Sold', 'sold', 'true_false', array_merge( $this->w( 25 ), array( 'ui' => 1 ) ) ),
				$this->f( $p . '_sold_to', 'Sold to', 'sold_to', 'text', array_merge( $this->w( 25 ), array(
					'instructions' => 'The country, spelled out. Empty when the horse is available.',
				) ) ),
				$this->f( $p . '_horsetelex', 'Horsetelex', 'horsetelex', 'url', array_merge( $this->w( 50 ), array(
					'instructions' => 'The pedigree page, and only when it really is this horse\'s. A link that turned out to be a parent\'s or a search page is not carried.',
				) ) ),
				$this->f( $p . '_horsetelex_of', 'The link belongs to', 'horsetelex_of', 'text', array_merge( $this->w( 50 ), array(
					'instructions' => 'Empty when the link is this horse\'s own. Otherwise the name of the parent it belongs to, because twenty one of these links point at the mother and the page has to say so rather than pretend.',
				) ) ),
			),
			$this->pedigree_fields( $p ),
			array(
				$this->tab( $p . '_tab_story', 'Story' ),
				$this->f( $p . '_body', 'Story', 'body', 'wysiwyg', array(
					'tabs'         => 'all',
					'media_upload' => 0,
					'instructions' => 'The owners\' own text about this horse. Facts only.',
				) ),

				$this->tab( $p . '_tab_photos', 'Photos' ),
				$this->f( $p . '_gallery', 'Photographs', 'gallery', 'gallery', array(
					'return_format' => 'array',
					'instructions'  => 'The first photograph is also set as the featured image, which is what the card and the page hero use.',
				) ),

				$this->tab( $p . '_tab_video', 'Video' ),
				$this->f( $p . '_video_1_id', 'First video', 'video_1_id', 'text', array_merge( $this->w( 50 ), array(
					'instructions' => 'A YouTube id, not a full link. Written from the list below, so edit the list and not this field.',
				) ) ),
				$this->f( $p . '_videos', 'All videos', 'videos', 'repeater', array(
					'layout'       => 'table',
					'button_label' => 'Add a video',
					'instructions' => 'YouTube ids. The field above mirrors the first one, because a video widget cannot read a repeater.',
					'sub_fields'   => array(
						$this->f( $p . '_video_id', 'YouTube id', 'youtube_id', 'text', array( 'wrapper' => array( 'width' => '30' ) ) ),
						$this->f( $p . '_video_title', 'Title', 'title', 'text', array(
							'wrapper'      => array( 'width' => '70' ),
							'instructions' => 'As YouTube has it. Kept so the list reads as something rather than as eleven characters.',
						) ),
					),
				) ),

				$this->tab( $p . '_tab_source', 'Source' ),
				$this->f( $p . '_source', 'Where this came from', 'source', 'text', array(
					'instructions' => 'Internal. Kept so a later correction reads as a correction and not as a typo.',
				) ),
			)
		);
	}

	private function embryo_fields() {
		$p = 'em';
		return array_merge(
			array(
				$this->tab( $p . '_tab_cross', 'Cross' ),
				$this->f( $p . '_sire_name', 'Sire', 'sire_name', 'text', $this->w( 50 ) ),
				$this->f( $p . '_dam_name', 'Dam', 'dam_name', 'text', $this->w( 50 ) ),
				$this->f( $p . '_tagline', 'Tagline', 'tagline', 'text', array_merge( $this->w( 100 ), array(
					'instructions' => 'The owners\' own line about the damline. A cross with none of its own borrows its dam\'s.',
				) ) ),
				$this->f( $p . '_genetics', 'Breeding line', 'genetics', 'text', $this->w( 100 ) ),
				$this->f( $p . '_stage', 'Stage', 'stage', 'select', array_merge( $this->w( 33 ), array(
					'choices'      => array(
						'carrying' => 'Carrying',
						'frozen'   => 'Frozen',
					),
					'default_value' => 'carrying',
					'instructions'  => 'Carrying means a mare is in foal with it. Frozen means it is in the tank.',
				) ) ),
				$this->f( $p . '_due_date', 'Due date', 'due_date', 'text', array_merge( $this->w( 33 ), array(
					'instructions' => 'dd/mm/yyyy. Empty on a frozen embryo.',
				) ) ),
				$this->f( $p . '_horsetelex', 'Horsetelex', 'horsetelex', 'url', array_merge( $this->w( 34 ), array(
					'instructions' => 'A cross is not born, so it has no entry of its own: this is its dam\'s.',
				) ) ),
				$this->f( $p . '_horsetelex_of', 'The link belongs to', 'horsetelex_of', 'text', array_merge( $this->w( 50 ), array(
					'instructions' => 'Empty when the link is this horse\'s own. Otherwise the name of the parent it belongs to, because twenty one of these links point at the mother and the page has to say so rather than pretend.',
				) ) ),

			),
			$this->pedigree_fields( $p ),
			array(
				$this->tab( $p . '_tab_lines', 'Lines' ),
				$this->f( $p . '_sire_line', 'Sire line', 'sire_line', 'wysiwyg', array(
					'tabs'         => 'all',
					'media_upload' => 0,
					'instructions' => 'What the sire has done and what he produces. Empty means the page says so rather than inventing one.',
				) ),
				$this->f( $p . '_dam_line', 'Dam line', 'dam_line', 'wysiwyg', array(
					'tabs'         => 'all',
					'media_upload' => 0,
				) ),

				$this->tab( $p . '_tab_photos', 'Photos' ),
				$this->f( $p . '_gallery', 'Photographs', 'gallery', 'gallery', array(
					'return_format' => 'array',
					'instructions'  => 'A cross has no photograph of its own, so this is the sire\'s, at the owners\' word of 6 September.',
				) ),

				$this->tab( $p . '_tab_source', 'Source' ),
				$this->f( $p . '_source', 'Where this came from', 'source', 'text' ),
			)
		);
	}

	private function stallion_fields() {
		$p = 'st';
		return array_merge(
			array(
				$this->tab( $p . '_tab_stallion', 'Stallion' ),
				$this->f( $p . '_genetics', 'Breeding line', 'genetics', 'text', $this->w( 100 ) ),
				$this->f( $p . '_year_of_birth', 'Year of birth', 'year_of_birth', 'text', $this->w( 25 ) ),
				$this->f( $p . '_studbook', 'Studbook', 'studbook', 'text', $this->w( 25 ) ),
				$this->f( $p . '_availability', 'Availability', 'availability', 'text', array_merge( $this->w( 25 ), array(
					'instructions' => 'Text, never a number: this holds "On request".',
				) ) ),
				$this->f( $p . '_crowned', 'Crowned', 'crowned', 'true_false', array_merge( $this->w( 25 ), array(
					'ui'           => 1,
					'instructions' => 'Three stallions carry a crown on the owners\' own card. Nobody has said what it means, so nothing is drawn for it yet.',
				) ) ),
				$this->f( $p . '_horsetelex', 'Horsetelex', 'horsetelex', 'url', $this->w( 50 ) ),
				$this->f( $p . '_horsetelex_of', 'The link belongs to', 'horsetelex_of', 'text', array_merge( $this->w( 50 ), array(
					'instructions' => 'Empty when the link is this horse\'s own. Otherwise the name of the parent it belongs to, because twenty one of these links point at the mother and the page has to say so rather than pretend.',
				) ) ),

			),
			$this->pedigree_fields( $p ),
			array(
				$this->tab( $p . '_tab_story', 'Story' ),
				$this->f( $p . '_body', 'Story', 'body', 'wysiwyg', array(
					'tabs'         => 'all',
					'media_upload' => 0,
				) ),
				$this->f( $p . '_source_text', 'Sources', 'source_text', 'text', array(
					'instructions' => 'Which sources the story was written from, and when they were read.',
				) ),

				$this->tab( $p . '_tab_crosses', 'Crosses' ),
				$this->f( $p . '_crosses', 'Bred with him', 'crosses', 'relationship', array(
					'post_type'     => array( 'embryo', 'foal', 'breeding_mare', 'sport_horse', 'icsi_stallion' ),
					'return_format' => 'id',
					'instructions'  => 'Counted, not claimed: everything on this site whose sire is this stallion. Mares and foals as well as crosses, which is why the list is not only embryos.',
				) ),

				$this->tab( $p . '_tab_photos', 'Photos' ),
				$this->f( $p . '_gallery', 'Photographs', 'gallery', 'gallery', array( 'return_format' => 'array' ) ),
			)
		);
	}

	private function news_fields() {
		$p = 'nw';
		return array(
			$this->tab( $p . '_tab_story', 'Story' ),
			$this->f( $p . '_eyebrow', 'Eyebrow', 'eyebrow', 'text', array_merge( $this->w( 50 ), array(
				'instructions' => 'The place or the event, above the headline. No dates: the ones on the old site did not match their own stories.',
			) ) ),
			$this->f( $p . '_excerpt', 'Excerpt', 'excerpt', 'textarea', array_merge( $this->w( 50 ), array(
				'rows'         => 2,
				'instructions' => 'The card text, and the search result description.',
			) ) ),
			$this->f( $p . '_body', 'Body', 'body', 'wysiwyg', array(
				'tabs'         => 'all',
				'media_upload' => 0,
			) ),
			$this->f( $p . '_body_it', 'Body, Italian', 'body_it', 'wysiwyg', array(
				'tabs'         => 'all',
				'media_upload' => 0,
				'instructions' => 'Rides along for the day the site grows an Italian version. Not shown anywhere yet.',
			) ),

			$this->tab( $p . '_tab_photo', 'Photo' ),
			$this->f( $p . '_focus', 'Focus point', 'focus', 'text', array_merge( $this->w( 50 ), array(
				'instructions' => 'CSS object-position, for example "50% 38%". Which part of the photograph survives a crop.',
			) ) ),
			$this->f( $p . '_is_placeholder', 'Photograph is a stand in', 'is_placeholder', 'true_false', array_merge( $this->w( 50 ), array(
				'ui'           => 1,
				'instructions' => 'On means the card says so out loud rather than passing it off as the real thing.',
			) ) ),

			$this->tab( $p . '_tab_source', 'Source' ),
			$this->f( $p . '_title_original', 'Their own headline', 'title_original', 'text', array(
				'instructions' => 'Kept beside the rewritten one. Never shown.',
			) ),
			$this->f( $p . '_source_url', 'Where this came from', 'source_url', 'url' ),
		);
	}

	private function partner_fields() {
		$p = 'pa';
		return array(
			$this->f( $p . '_logo', 'Logo', 'logo', 'image', array(
				'return_format' => 'array',
				'instructions'  => 'Each logo keeps its own background, so it is shown whole on a white card and never cropped.',
			) ),
			$this->f( $p . '_website', 'Website', 'website', 'url', array(
				'instructions' => 'Empty for all three: the owners have not given a link yet. The logo is not a link until they do.',
			) ),
			$this->f( $p . '_blurb', 'One line', 'blurb', 'textarea', array(
				'rows'         => 2,
				'instructions' => 'Empty for all three, for the same reason.',
			) ),
		);
	}

	public function field_groups() {
		return array(
			$this->group( 'sport_horse',   'Sport horse',   'sport_horse',   $this->horse_fields( 'sp' ) ),
			$this->group( 'breeding_mare', 'Breeding mare', 'breeding_mare', $this->horse_fields( 'bm' ) ),
			$this->group( 'foal',          'Foal',          'foal',          $this->horse_fields( 'fo' ) ),
			$this->group( 'embryo',        'Embryo',        'embryo',        $this->embryo_fields() ),
			$this->group( 'icsi_stallion', 'ICSI stallion', 'icsi_stallion', $this->stallion_fields() ),
			$this->group( 'news_item',     'News report',   'news_item',     $this->news_fields() ),
			$this->group( 'partner',       'Partner',       'partner',       $this->partner_fields() ),
		);
	}

	/* ── writing it ──────────────────────────────────────────────────────── */

	public function run() {
		foreach ( $this->post_types() as $args ) {
			$this->internal( $args, 'acf-post-type', 'post type', $args['post_type'] );
		}
		foreach ( $this->taxonomies() as $args ) {
			$this->internal( $args, 'acf-taxonomy', 'taxonomy', $args['taxonomy'] );
		}
		foreach ( $this->field_groups() as $group ) {
			$this->field_group( $group );
		}
	}

	private function internal( $args, $acf_type, $label, $name ) {
		$existing = acf_get_internal_post_type_post( $args['key'], $acf_type );

		if ( $this->dry_run ) {
			$this->log->note( sprintf( '%s "%s" would be %s', $label, $name, $existing ? 'updated' : 'created' ) );
			return;
		}

		if ( $existing ) {
			$args['ID'] = $existing->ID;
		}
		acf_update_internal_post_type( $args, $acf_type );

		$existing ? $this->log->updated( sprintf( '%s "%s"', $label, $name ) )
		          : $this->log->created( sprintf( '%s "%s"', $label, $name ) );
	}

	private function field_group( $group ) {
		$existing = acf_get_field_group( $group['key'] );

		if ( $this->dry_run ) {
			$this->log->note( sprintf(
				'field group "%s" would be %s, %d field(s)',
				$group['title'],
				$existing ? 'updated' : 'created',
				count( $group['fields'] )
			) );
			return;
		}

		if ( $existing && ! empty( $existing['ID'] ) ) {
			$group['ID'] = $existing['ID'];
		}
		// import and not update: only import carries the sub_fields of a repeater.
		acf_import_field_group( $group );

		$existing ? $this->log->updated( sprintf( 'field group "%s"', $group['title'] ) )
		          : $this->log->created( sprintf( 'field group "%s"', $group['title'] ) );
	}
}
