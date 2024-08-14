import React, {useRef, useEffect, useState} from 'react'
import styles from './PlayerModal.module.scss'

const PlayerModal = ({
	player,
	onClose,
	description,
	isGenerating,
	onSave,
}) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editedPlayer, setEditedPlayer] = useState({...player})
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

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleSave = () => {
		console.log('editedPlayer', editedPlayer)
		onSave(editedPlayer)
		setIsEditing(false)
	}

	const handleInputChange = e => {
		const {name, value} = e.target
		setEditedPlayer(prev => ({...prev, [name]: value}))
	}

	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<div className={styles.playerInfo}>
					{isEditing ? (
						<input
							type='text'
							name='player'
							value={editedPlayer.player}
							onChange={handleInputChange}
							className={styles.editInput}
						/>
					) : (
						<h2>{player.player}</h2>
					)}
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
					{['year', 'ageThatYear', 'hits', 'bats'].map(stat => (
						<div key={stat} className={styles.statItem}>
							<span className={styles.statLabel}>
								{stat.charAt(0).toUpperCase() + stat.slice(1)}
							</span>
							{isEditing ? (
								<input
									type='text'
									name={stat}
									value={editedPlayer[stat]}
									onChange={handleInputChange}
									className={styles.editInput}
								/>
							) : (
								<span className={styles.statValue}>
									{player[stat]}
								</span>
							)}
						</div>
					))}
				</div>
				<div className={styles.buttonContainer}>
					{isEditing ? (
						<button
							className={styles.saveButton}
							onClick={handleSave}
						>
							Save
						</button>
					) : (
						<button
							className={styles.editButton}
							onClick={handleEdit}
						>
							Edit
						</button>
					)}
					<button className={styles.closeButton} onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}

export default PlayerModal
