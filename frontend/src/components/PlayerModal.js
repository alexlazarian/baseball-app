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
				<h2>{player.player}</h2>
				<p>Year: {player.year}</p>
				<p>Age: {player.ageThatYear}</p>
				<p>Hits: {player.hits}</p>
				<p>Bats: {player.bats}</p>
				<h3>Description:</h3>
				<div ref={descriptionRef} className={styles.description}>
					{description || 'Generating description...'}
					{isGenerating && <span className={styles.cursor}>|</span>}
				</div>
				<button onClick={onClose}>Close</button>
			</div>
		</div>
	)
}

export default PlayerModal
