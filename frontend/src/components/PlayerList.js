import React, {useState, useEffect} from 'react'
import api from '../utils/api'
import styles from './PlayerList.module.scss'
import PlayerModal from './PlayerModal'

function PlayerList() {
	const [players, setPlayers] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [selectedPlayer, setSelectedPlayer] = useState(null)
	const [description, setDescription] = useState('')
	const [isGenerating, setIsGenerating] = useState(false)

	const fetchPlayers = async () => {
		try {
			setIsLoading(true)
			const res = await api.get('/players')
			setPlayers(res.data)
		} catch (error) {
			console.error('Error fetching players:', error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchPlayers()
	}, [])

	const handleFetchPlayers = async () => {
		try {
			setIsLoading(true)
			await api.get('/players/fetch')
			// After fetching and saving new players, refresh the list
			await fetchPlayers()
		} catch (error) {
			console.error(
				'Error fetching players from external API:',
				error
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handlePlayerClick = async player => {
		setSelectedPlayer(player)
		setIsGenerating(false)

		if (player.description) {
			// If description exists, display it immediately
			setDescription(player.description)
		} else {
			// If no description, generate it
			setDescription('')
			setIsGenerating(true)
			try {
				const response = await fetch(
					'http://localhost:5050/api/players/generate-description',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(player),
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
								setDescription(prev => prev + data.content)
							} else if (data.done) {
								setIsGenerating(false)
								// Update the player in the local state with the new description
								setPlayers(prevPlayers =>
									prevPlayers.map(p =>
										p._id === player._id
											? {...p, description: description}
											: p
									)
								)
							}
						}
					}
				}
			} catch (error) {
				console.error('Error fetching player description:', error)
				setDescription('Failed to load description.')
				setIsGenerating(false)
			}
		}
	}

	return (
		<div className={styles.playerListContainer}>
			<div className={styles.playerListHeader}>
				<h1>Baseball Players</h1>
				<button onClick={handleFetchPlayers} disabled={isLoading}>
					{isLoading ? 'Fetching...' : 'Fetch Players'}
				</button>
			</div>
			{isLoading ? (
				<p>Loading...</p>
			) : (
				<div className={styles.playerGrid}>
					{players.map(player => (
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
										{player.ageThatYear}
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
			)}
			{selectedPlayer && (
				<PlayerModal
					player={selectedPlayer}
					onClose={() => setSelectedPlayer(null)}
					description={description}
					isGenerating={isGenerating}
				/>
			)}
		</div>
	)
}

export default PlayerList
