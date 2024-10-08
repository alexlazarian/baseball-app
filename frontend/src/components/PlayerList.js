import React, {useState, useEffect, useRef} from 'react'
import api from '../utils/api'
import styles from './PlayerList.module.scss'
import PlayerModal from './PlayerModal'

function PlayerList() {
	const [players, setPlayers] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [selectedPlayer, setSelectedPlayer] = useState(null)
	const [description, setDescription] = useState('')
	const [isGenerating, setIsGenerating] = useState(false)
	const abortControllerRef = useRef(null)
	const fullDescriptionRef = useRef('')
	const [showSkeleton, setShowSkeleton] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSkeleton(false)
		}, 1500)

		return () => clearTimeout(timer)
	}, [])

	const withLoading = asyncFunction => async () => {
		try {
			setIsLoading(true)
			await asyncFunction()
		} catch (error) {
			console.error('Error:', error)
			// Here we could also set an error state to display to the user
		} finally {
			setIsLoading(false)
		}
	}

	const fetchPlayers = withLoading(async () => {
		const res = await api.get('/players')
		setPlayers(res.data)
	})

	const handleExternalFetch = withLoading(async () => {
		await api.get('/players/fetch')
		// After fetching and saving new players, refresh the list
		await fetchPlayers()
	})

	useEffect(() => {
		fetchPlayers()
	}, [])

	const handlePlayerClick = async player => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}
		abortControllerRef.current = new AbortController()

		setSelectedPlayer(player)
		setIsGenerating(false)

		if (player.description) {
			// If description exists, display it immediately
			setDescription(player.description)
		} else {
			// If no description, generate it
			setDescription('')
			setIsGenerating(true)
			fullDescriptionRef.current = '' // Reset the full description
			try {
				const response = await fetch(
					'http://localhost:5050/api/players/generate-description',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(player),
						signal: abortControllerRef.current.signal,
					}
				)

				const reader = response.body.getReader()
				const decoder = new TextDecoder()

				while (true) {
					const {value, done} = await reader.read()
					if (done) break

					const chunk = decoder.decode(value)
					const lines = chunk.split('\n\n')

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = JSON.parse(line.slice(6))
							if (data.content) {
								fullDescriptionRef.current += data.content
								setDescription(fullDescriptionRef.current)
							} else if (data.done) {
								setIsGenerating(false)
								// Update the player in the local state with the new description
								setPlayers(prevPlayers =>
									prevPlayers.map(p =>
										p._id === player._id
											? {
													...p,
													description: fullDescriptionRef.current,
											  }
											: p
									)
								)
							}
						}
					}
				}
			} catch (error) {
				if (error.name === 'AbortError') {
					console.log('Fetch aborted')
				} else {
					console.error('Error fetching player description:', error)
					setDescription('Failed to load description.')
				}
				setIsGenerating(false)
			}
		}
	}

	const handleCloseModal = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}
		setSelectedPlayer(null)
		setDescription('')
		setIsGenerating(false)
	}

	const handleSavePlayer = async editedPlayer => {
		try {
			const response = await api.put(
				`/players/${editedPlayer._id}`,
				editedPlayer
			)
			if (response.status === 200) {
				setPlayers(prevPlayers =>
					prevPlayers.map(p =>
						p._id === editedPlayer._id ? editedPlayer : p
					)
				)
				setSelectedPlayer(editedPlayer)
				setDescription(editedPlayer.description) // Update the description state
			}
		} catch (error) {
			console.error('Error updating player:', error)
		}
	}

	return (
		<div className={styles.playerListContainer}>
			<div className={styles.playerListHeader}>
				<h1>Baseball Players</h1>
				<button onClick={handleExternalFetch} disabled={isLoading}>
					{isLoading ? 'Fetching...' : 'Fetch Players'}
				</button>
			</div>

			<div className={styles.playerGrid}>
				{showSkeleton || isLoading
					? Array.from({length: 8}).map((_, index) => (
							<div
								key={index}
								className={`${styles.playerCard} ${styles.skeleton}`}
							>
								<div className={styles.skeletonTitle}></div>
								<div className={styles.skeletonStats}>
									<div className={styles.skeletonStat}></div>
									<div className={styles.skeletonStat}></div>
									<div className={styles.skeletonStat}></div>
									<div className={styles.skeletonStat}></div>
								</div>
							</div>
					  ))
					: players.map(player => (
							<div
								key={player._id}
								className={styles.playerCard}
								onClick={() => handlePlayerClick(player)}
							>
								<h2>
									{player.rank}. {player.player}
								</h2>
								<div className={styles.statsContainer}>
									<div className={styles.statItem}>
										<span className={styles.statLabel}>Year</span>
										<span className={styles.statValue}>
											{player.year}
										</span>
									</div>
									<div className={styles.statItem}>
										<span className={styles.statLabel}>Age</span>
										<span className={styles.statValue}>
											{player.age}
										</span>
									</div>
									<div className={styles.statItem}>
										<span className={styles.statLabel}>Hits</span>
										<span className={styles.statValue}>
											{player.hits}
										</span>
									</div>
									<div className={styles.statItem}>
										<span className={styles.statLabel}>Bats</span>
										<span className={styles.statValue}>
											{player.bats}
										</span>
									</div>
								</div>
							</div>
					  ))}
			</div>

			{selectedPlayer && (
				<PlayerModal
					player={selectedPlayer}
					onClose={handleCloseModal}
					description={description}
					isGenerating={isGenerating}
					onSave={handleSavePlayer}
				/>
			)}
		</div>
	)
}

export default PlayerList
