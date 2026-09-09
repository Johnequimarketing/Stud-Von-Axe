<?php
/**
 * Images into the media library, once.
 *
 * Every attachment is stamped with _sva_src, its original path in the static
 * build. That stamp is the lookup key on a second run, so importing twice does
 * not fill the library with duplicates.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SVA_Imp_Media {

	const META_KEY = '_sva_src';

	/** @var SVA_Imp_Logger */
	private $log;

	/** @var bool */
	private $dry_run;

	/** @var array<string,array{file:string,alt:string}> original path => bundled file and its alt */
	private $manifest;

	/** @var array<string,int> in-request cache, path => attachment id */
	private $seen = array();

	public function __construct( SVA_Imp_Logger $log, array $manifest, $dry_run = false ) {
		$this->log      = $log;
		$this->manifest = $manifest;
		$this->dry_run  = (bool) $dry_run;
	}

	/**
	 * @param string $src   Original path, e.g. Placeholders/HorsesReal/laurien-1.png
	 * @param string $alt   Alt text to store on the attachment.
	 * @return int          Attachment id, or 0.
	 */
	public function ensure( $src, $alt = '' ) {
		if ( ! $src ) {
			return 0;
		}
		if ( isset( $this->seen[ $src ] ) ) {
			return $this->seen[ $src ];
		}

		if ( ! isset( $this->manifest[ $src ] ) ) {
			$this->log->failed( sprintf( 'image not bundled with the plugin: %s', $src ) );
			return 0;
		}
		$entry = $this->manifest[ $src ];
		// The generator wrote a real alt for every photograph, because the
		// client never will and it is the one place an unchecked claim about a
		// picture gets published.
		if ( ! empty( $entry['alt'] ) ) {
			$alt = $entry['alt'];
		}

		$existing = $this->find( $src );
		if ( $existing ) {
			$this->seen[ $src ] = $existing;
			if ( $alt && ! $this->dry_run ) {
				update_post_meta( $existing, '_wp_attachment_image_alt', $alt );
			}
			return $existing;
		}

		/*
		 * Two locations, and that is the whole trick behind the split pair of
		 * zips. The media ships inside the plugin when the host will take a
		 * thirty seven megabyte upload, and in a separate zip unpacked into
		 * wp-content/uploads when it will not. Neither route needs a code
		 * change.
		 */
		$file = SVA_IMP_DIR . 'assets/media/' . $entry['file'];
		if ( ! file_exists( $file ) ) {
			$loose = WP_CONTENT_DIR . '/uploads/stud-von-axe-media/' . $entry['file'];
			if ( file_exists( $loose ) ) {
				$file = $loose;
			} else {
				$this->log->failed( sprintf(
					'image %s is in neither place. Either upload the full plugin zip, or unpack stud-von-axe-importer-fotos.zip into wp-content/uploads/ so the files land in wp-content/uploads/stud-von-axe-media/.',
					$entry['file']
				) );
				return 0;
			}
		}

		if ( $this->dry_run ) {
			$this->log->note( sprintf( 'would import image %s', $src ) );
			return 0;
		}

		$id = $this->sideload( $file, $src, $alt );
		if ( $id ) {
			$this->seen[ $src ] = $id;
			$this->log->created( sprintf( 'image %s', $src ) );
		}
		return $id;
	}

	/** Find a previously imported attachment by its stamp. */
	private function find( $src ) {
		$found = get_posts(
			array(
				'post_type'              => 'attachment',
				'post_status'            => 'inherit',
				'posts_per_page'         => 1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_term_cache' => false,
				'meta_query'             => array(
					array(
						'key'   => self::META_KEY,
						'value' => $src,
					),
				),
			)
		);
		return $found ? (int) $found[0] : 0;
	}

	/** Copy the bundled file into uploads and register it. */
	private function sideload( $file, $src, $alt ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$name = basename( $src );
		$upload = wp_upload_bits( $name, null, file_get_contents( $file ) ); // phpcs:ignore
		if ( ! empty( $upload['error'] ) ) {
			$this->log->failed( sprintf( 'upload of %s failed: %s', $name, $upload['error'] ) );
			return 0;
		}

		$type = wp_check_filetype( $upload['file'] );
		$id   = wp_insert_attachment(
			array(
				'post_mime_type' => $type['type'],
				'post_title'     => $this->title_from( $name ),
				'post_content'   => '',
				'post_status'    => 'inherit',
			),
			$upload['file']
		);

		if ( is_wp_error( $id ) || ! $id ) {
			$this->log->failed( sprintf( 'could not register %s', $name ) );
			return 0;
		}

		wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $upload['file'] ) );
		update_post_meta( $id, self::META_KEY, $src );
		if ( $alt ) {
			update_post_meta( $id, '_wp_attachment_image_alt', $alt );
		}
		return (int) $id;
	}

	private function title_from( $name ) {
		$base = preg_replace( '/\.[a-z0-9]+$/i', '', $name );
		$base = str_replace( array( '-', '_' ), ' ', $base );
		return ucfirst( trim( $base ) );
	}
}
