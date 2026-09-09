<?php
/**
 * A run log the client can read.
 *
 * Not error_log: the person running this is looking at an admin screen and
 * needs to see what happened in plain words, including what was skipped.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SVA_Imp_Logger {

	/** @var array<int, array{level:string, message:string}> */
	private $lines = array();

	/** @var array<string,int> */
	private $counts = array( 'created' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0 );

	public function created( $message ) {
		$this->counts['created']++;
		$this->add( 'created', $message );
	}

	public function updated( $message ) {
		$this->counts['updated']++;
		$this->add( 'updated', $message );
	}

	public function skipped( $message ) {
		$this->counts['skipped']++;
		$this->add( 'skipped', $message );
	}

	public function failed( $message ) {
		$this->counts['failed']++;
		$this->add( 'failed', $message );
	}

	public function note( $message ) {
		$this->add( 'note', $message );
	}

	private function add( $level, $message ) {
		$this->lines[] = array(
			'level'   => $level,
			'message' => (string) $message,
		);
	}

	public function lines() {
		return $this->lines;
	}

	public function counts() {
		return $this->counts;
	}

	public function has_failures() {
		return $this->counts['failed'] > 0;
	}

	/** A one line summary for the top of the screen. */
	public function summary() {
		return sprintf(
			/* translators: 1: created 2: updated 3: skipped 4: failed */
			__( '%1$d created, %2$d updated, %3$d skipped, %4$d failed', 'sva-imp' ),
			$this->counts['created'],
			$this->counts['updated'],
			$this->counts['skipped'],
			$this->counts['failed']
		);
	}
}
