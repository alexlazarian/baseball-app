import React, {useRef, useEffect} from 'react'
import styles from './PlayerModal.module.scss'

const PlayerModal = ({
	player,
	onClose,
	description,
	isGenerating,
}) => {
	const descriptionRef = useRef(null)

	useEffect(() => {
		if (descriptionRef.current) {
			const textNode = descriptionRef.current.childNodes[0]
			if (textNode) {
				const range = document.createRange()
				const sel = window.getSelection()
				range.setStart(textNode, textNode.length)
				range.collapse(true)
				sel.removeAllRanges()
				sel.addRange(range)
			}
		}
	}, [description])

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<div className={styles.playerInfo}>
					<h2>{player.player}</h2>
					<p className={styles.rank}>Rank: {player.rank}</p>
				</div>
				<div className={styles.descriptionContainer}>
					<h3>Description:</h3>
					<div ref={descriptionRef} className={styles.description}>
						{description || 'Generating description...'}
						{isGenerating && <span className={styles.cursor}>|</span>}
					</div>
				</div>
				<div className={styles.statsContainer}>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>Year</span>
						<span className={styles.statValue}>{player.year}</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>Age</span>
						<span className={styles.statValue}>
							{player.ageThatYear}
						</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>Hits</span>
						<span className={styles.statValue}>{player.hits}</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>Bats</span>
						<span className={styles.statValue}>{player.bats}</span>
					</div>
				</div>
				<button onClick={onClose}>Close</button>
			</div>
		</div>
	)
}

export default PlayerModal
