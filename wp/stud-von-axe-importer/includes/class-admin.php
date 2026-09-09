<?php
/**
 * One screen under Tools: what is in the box, a dry run, and the import.
 *
 * The work runs one step at a time over AJAX. Fifty posts plus fifty images in a
 * single request will pass a default max_execution_time on most shared hosting.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SVA_Imp_Admin {

	const CAP   = 'manage_options';
	const SLUG  = 'sva-importer';
	const NONCE = 'sva_imp_run';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'wp_ajax_sva_imp_step', array( __CLASS__, 'ajax_step' ) );
	}

	public static function menu() {
		add_management_page(
			__( 'Stud Von Axe Content Importer', 'sva-imp' ),
			__( 'Stud Von Axe Importer', 'sva-imp' ),
			self::CAP,
			self::SLUG,
			array( __CLASS__, 'screen' )
		);
	}

	public static function payload() {
		$file = SVA_IMP_DIR . 'data/payload.json';
		if ( ! file_exists( $file ) ) {
			return null;
		}
		$data = json_decode( file_get_contents( $file ), true ); // phpcs:ignore
		return is_array( $data ) ? $data : null;
	}

	/** How many records go into one request. */
	const PER_STEP = 20;

	/** What the box holds, in the order the screen lists it. */
	public static function groups() {
		return array(
			'sport_horses'   => __( 'Sport horses', 'sva-imp' ),
			'breeding_mares' => __( 'Breeding mares', 'sva-imp' ),
			'foals'          => __( 'Foals', 'sva-imp' ),
			'embryos'        => __( 'Embryos', 'sva-imp' ),
			'stallions'      => __( 'ICSI stallions', 'sva-imp' ),
			'news'           => __( 'News reports', 'sva-imp' ),
			'partners'       => __( 'Partners', 'sva-imp' ),
		);
	}

	/**
	 * The ordered list of steps the browser walks through.
	 *
	 * A group longer than PER_STEP is cut into slices, because a hundred posts
	 * and two hundred images with thumbnail generation will pass
	 * max_execution_time on ordinary hosting, and a timeout halfway through an
	 * import is exactly the mess this is meant to avoid.
	 *
	 * The links pass runs last: a stallion points at the crosses made with him,
	 * and those posts have to exist before they can be pointed at.
	 */
	public static function steps() {
		$payload = self::payload();
		$steps   = array( 'structure' => __( 'Post types and fields', 'sva-imp' ) );

		foreach ( self::groups() as $key => $label ) {
			$total = ( $payload && isset( $payload[ $key ] ) ) ? count( $payload[ $key ] ) : 0;
			if ( ! $total ) {
				continue;
			}
			for ( $from = 0; $from < $total; $from += self::PER_STEP ) {
				$steps[ $key . ':' . $from ] = $total > self::PER_STEP
					? sprintf( '%s %d to %d', $label, $from + 1, min( $from + self::PER_STEP, $total ) )
					: $label;
			}
		}

		$steps['library'] = __( 'Design images', 'sva-imp' );
		$steps['links']   = __( 'Linking the crosses to their sires', 'sva-imp' );

		return $steps;
	}

	public static function screen() {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'You do not have permission to run the importer.', 'sva-imp' ) );
		}

		$problem = sva_imp_requirement_error();
		$payload = self::payload();
		$last    = get_option( 'sva_imp_last_run' );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Stud Von Axe Content Importer', 'sva-imp' ); ?></h1>

			<?php if ( $problem ) : ?>
				<div class="notice notice-error"><p><?php echo esc_html( $problem ); ?></p></div>
			<?php endif; ?>

			<?php if ( ! $payload ) : ?>
				<div class="notice notice-error"><p><?php esc_html_e( 'data/payload.json is missing from the plugin. Rebuild it with tools-gen-wp-payload.py.', 'sva-imp' ); ?></p></div>
			<?php else : ?>
				<p><?php esc_html_e( 'This puts the post types, the fields, the content and the images in place. When it is done you can delete this plugin: everything it made belongs to WordPress and ACF, and stays.', 'sva-imp' ); ?></p>

				<table class="widefat striped" style="max-width:520px;margin:18px 0">
					<tbody>
					<?php foreach ( self::groups() as $key => $label ) : ?>
						<tr><td><?php echo esc_html( $label ); ?></td><td><strong><?php echo isset( $payload[ $key ] ) ? count( $payload[ $key ] ) : 0; ?></strong></td></tr>
					<?php endforeach; ?>
					<tr><td><?php esc_html_e( 'Images', 'sva-imp' ); ?></td><td><strong><?php echo count( $payload['media'] ); ?></strong></td></tr>
					</tbody>
				</table>

				<?php if ( $last ) : ?>
					<p class="description">
						<?php
						printf(
							/* translators: %s: date and time */
							esc_html__( 'Last run: %s. Running again updates what is there and adds what is missing. Nothing is deleted.', 'sva-imp' ),
							esc_html( $last )
						);
						?>
					</p>
				<?php endif; ?>

				<p>
					<button class="button" id="sva-imp-dry" <?php disabled( (bool) $problem ); ?>><?php esc_html_e( 'Dry run', 'sva-imp' ); ?></button>
					<button class="button button-primary" id="sva-imp-go" <?php disabled( (bool) $problem ); ?>><?php esc_html_e( 'Run the import', 'sva-imp' ); ?></button>
					<span id="sva-imp-status" style="margin-left:10px"></span>
				</p>
				<p class="description"><?php esc_html_e( 'A dry run walks the whole import and reports what it would do, writing nothing.', 'sva-imp' ); ?></p>

				<div id="sva-imp-log" style="display:none;margin-top:20px;max-height:460px;overflow:auto;background:#fff;border:1px solid #dcdcde;padding:12px 16px;font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace"></div>
			<?php endif; ?>
		</div>

		<script>
		(function () {
			var steps = <?php echo wp_json_encode( array_keys( self::steps() ) ); ?>;
			var names = <?php echo wp_json_encode( self::steps() ); ?>;
			var nonce = <?php echo wp_json_encode( wp_create_nonce( self::NONCE ) ); ?>;
			var log = document.getElementById('sva-imp-log');
			var status = document.getElementById('sva-imp-status');
			var go = document.getElementById('sva-imp-go');
			var dry = document.getElementById('sva-imp-dry');
			if (!go) { return; }

			var colours = { created: '#116329', updated: '#0969da', skipped: '#7a7a7a', failed: '#a40e26', note: '#57606a' };

			function write(level, message) {
				var row = document.createElement('div');
				row.style.color = colours[level] || '#1d2327';
				row.textContent = (level === 'note' ? '' : level.toUpperCase() + '  ') + message;
				log.appendChild(row);
				log.scrollTop = log.scrollHeight;
			}

			function run(isDry) {
				go.disabled = true; dry.disabled = true;
				log.style.display = 'block'; log.innerHTML = '';
				var i = 0;
				function next() {
					if (i >= steps.length) {
						status.textContent = isDry ? 'Dry run finished.' : 'Done.';
						go.disabled = false; dry.disabled = false;
						return;
					}
					var step = steps[i];
					status.textContent = names[step] + '…';
					var body = new URLSearchParams();
					body.set('action', 'sva_imp_step');
					body.set('nonce', nonce);
					body.set('step', step);
					body.set('dry', isDry ? '1' : '0');
					fetch(ajaxurl, { method: 'POST', credentials: 'same-origin', body: body })
						.then(function (r) { return r.json(); })
						.then(function (res) {
							if (!res || !res.success) {
								write('failed', (res && res.data) ? res.data : 'the request failed');
								status.textContent = 'Stopped.';
								go.disabled = false; dry.disabled = false;
								return;
							}
							write('note', '— ' + names[step]);
							res.data.lines.forEach(function (l) { write(l.level, l.message); });
							i++; next();
						})
						.catch(function (e) {
							write('failed', String(e));
							status.textContent = 'Stopped.';
							go.disabled = false; dry.disabled = false;
						});
				}
				next();
			}

			go.addEventListener('click', function (e) { e.preventDefault(); run(false); });
			dry.addEventListener('click', function (e) { e.preventDefault(); run(true); });
		})();
		</script>
		<?php
	}

	public static function ajax_step() {
		if ( ! current_user_can( self::CAP ) ) {
			wp_send_json_error( __( 'Not allowed.', 'sva-imp' ), 403 );
		}
		check_ajax_referer( self::NONCE, 'nonce' );

		$problem = sva_imp_requirement_error();
		if ( $problem ) {
			wp_send_json_error( $problem, 400 );
		}

		$payload = self::payload();
		if ( ! $payload ) {
			wp_send_json_error( __( 'payload.json is missing.', 'sva-imp' ), 400 );
		}

		// sanitize_key would eat the colon that carries the offset, so the
		// step is matched against the list instead of being scrubbed.
		$step  = isset( $_POST['step'] ) ? wp_unslash( $_POST['step'] ) : ''; // phpcs:ignore
		$dry   = ! empty( $_POST['dry'] );
		$steps = self::steps();

		if ( ! is_string( $step ) || ! array_key_exists( $step, $steps ) ) {
			wp_send_json_error( __( 'Unknown step.', 'sva-imp' ), 400 );
		}

		$log = new SVA_Imp_Logger();

		if ( 'structure' === $step ) {
			( new SVA_Imp_Structure( $log, $dry ) )->run();
		} else {
			$media    = new SVA_Imp_Media( $log, $payload['media'], $dry );
			$importer = new SVA_Imp_Importer( $log, $media, $payload, $dry );

			if ( 'library' === $step ) {
				$importer->run_library();
			} elseif ( 'links' === $step ) {
				$importer->run_links();
			} else {
				list( $group, $from ) = array_pad( explode( ':', $step, 2 ), 2, 0 );
				$importer->run_type( $group, (int) $from, self::PER_STEP );
			}
		}

		if ( ! $dry && 'links' === $step ) {
			update_option( 'sva_imp_last_run', current_time( 'mysql' ) );
		}

		wp_send_json_success(
			array(
				'lines'   => $log->lines(),
				'summary' => $log->summary(),
			)
		);
	}
}
