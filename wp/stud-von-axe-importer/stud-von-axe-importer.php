<?php
/**
 * Plugin Name:  Stud Von Axe Content Importer
 * Description:  One shot importer for Stud Von Axe: creates the seven ACF post types, the seven taxonomies and the seven field groups, then imports the sport horses, breeding mares, foals, embryos, ICSI stallions, news and partners with their photographs. Delete this plugin when it is done; everything it made stays.
 * Version:      2026.09.09.2156
 * Requires PHP: 7.4
 * Author:       EquiMarketing
 * Author URI:   https://www.equimarketing.com
 * License:      GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SVA_IMP_FILE', __FILE__ );
define( 'SVA_IMP_DIR', plugin_dir_path( __FILE__ ) );
define( 'SVA_IMP_VERSION', '2026.09.09.2156' );

/**
 * ACF Pro 6.1 is the floor, because that is the release where post types and
 * field groups became database records instead of code. The whole point of this
 * plugin is that it can be deleted afterwards, and that only holds if ACF owns
 * the definitions rather than us.
 */
function sva_imp_requirement_error() {
	if ( ! class_exists( 'ACF' ) ) {
		return __( 'Advanced Custom Fields Pro is not active. Activate it before running the import.', 'sva-imp' );
	}
	if ( ! function_exists( 'acf_get_setting' ) ) {
		return __( 'This copy of ACF does not expose the functions the importer needs.', 'sva-imp' );
	}
	$version = acf_get_setting( 'version' );
	if ( $version && version_compare( $version, '6.1', '<' ) ) {
		return sprintf(
			/* translators: %s: the installed ACF version */
			__( 'ACF %s is installed. The importer needs 6.1 or newer, which is where post types became database records.', 'sva-imp' ),
			$version
		);
	}
	if ( ! function_exists( 'acf_update_internal_post_type' ) ) {
		return __( 'ACF Pro is required. The free edition cannot register post types.', 'sva-imp' );
	}
	return '';
}

require_once SVA_IMP_DIR . 'includes/class-logger.php';
require_once SVA_IMP_DIR . 'includes/class-structure.php';
require_once SVA_IMP_DIR . 'includes/class-media.php';
require_once SVA_IMP_DIR . 'includes/class-importer.php';
require_once SVA_IMP_DIR . 'includes/class-admin.php';

add_action( 'plugins_loaded', array( 'SVA_Imp_Admin', 'init' ) );
