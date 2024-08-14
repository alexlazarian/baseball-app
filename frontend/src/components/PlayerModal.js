import React from 'react'
import styles from './PlayerModal.module.scss'

const PlayerModal = ({player, onClose, description}) => {
	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<h2>{player.player}</h2>
				<p>Year: {player.year}</p>
				<p>Age: {player.ageThatYear}</p>
				<p>Hits: {player.hits}</p>
				<p>Bats: {player.bats}</p>
				<h3>Description:</h3>
				<div className={styles.description}>
					{description || 'Generating description...'}
				</div>
				<button onClick={onClose}>Close</button>
			</div>
		</div>
	)
}

export default PlayerModal
