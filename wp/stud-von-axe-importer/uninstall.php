<?php
/**
 * Deliberately empty.
 *
 * Everything this plugin creates is meant to outlive it. The post types and
 * field groups are ACF's own database records, the horses, crosses, stallions,
 * news reports and partners are ordinary posts, and the photographs are
 * ordinary attachments.
 * WordPress owns all of it the moment the import finishes.
 *
 * Deleting the plugin therefore removes only the plugin. That is the design,
 * not an oversight, so nothing is cleaned up here on purpose.
 *
 * The only trace left behind is one option row recording when the last import
 * ran, kept so a later import can tell you what it is about to overwrite. It
 * costs nothing and it is removed below.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'sva_imp_last_run' );
