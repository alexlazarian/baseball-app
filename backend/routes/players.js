const express = require('express')
const router = express.Router()
const Player = require('../models/Player')
const axios = require('axios')
const OpenAI = require('openai')

// Fetch players from the external API and save to database
router.get('/fetch', async (req, res) => {
	try {
		const response = await axios.get(
			'https://api.sampleapis.com/baseball/hitsSingleSeason'
		)

		console.log(
			'Raw API response:',
			JSON.stringify(response.data.slice(0, 10), null, 2)
		)

		const slicedPlayers = response.data.slice(0, 10)

		const correctedPlayers = correctRankings(slicedPlayers)

		const players = correctedPlayers.map(player => ({
			rank: parseInt(player.Rank),
			player: player.Player || '',
			ageThatYear: player.AgeThatYear
				? parseInt(player.AgeThatYear)
				: null,
			hits: player.Hits || 0,
			year: player.Year || null,
			bats: player.Bats || '',
		}))

		console.log(
			'Corrected players:',
			JSON.stringify(players, null, 2)
		)

		await Player.deleteMany({}) // Clear existing players
		await Player.insertMany(players)
		res.json({message: 'Players fetched and saved successfully'})
	} catch (error) {
		console.error('Error in /fetch route:', error)
		res.status(500).json({message: error.message})
	}
})

// Get all players
router.get('/', async (req, res) => {
	try {
		console.log('hey')
		const players = await Player.find()
		res.json(players)
	} catch (error) {
		res.status(500).json({message: error.message})
	}
})

// Update a player
router.put('/:id', async (req, res) => {
	try {
		const updatedPlayer = await Player.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true}
		)
		res.json(updatedPlayer)
	} catch (error) {
		res.status(400).json({message: error.message})
	}
})

// TODO: Add route for LLM-generated description

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

router.post('/generate-description', async (req, res) => {
	const {player, year, hits, ageThatYear, bats} = req.body
	const prompt = `Generate a brief description of the baseball player ${player} based on the following stats:
  Year: ${year}
  Hits: ${hits}
  Age: ${ageThatYear}
  Bats: ${bats}
  Please provide a concise summary of their performance and any notable achievements.`

	try {
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		})

		const stream = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [{role: 'user', content: prompt}],
			stream: true,
		})

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || ''
			if (content) {
				res.write(`data: ${JSON.stringify({content})}\n\n`)
			}
		}

		res.write(`data: ${JSON.stringify({done: true})}\n\n`)
		res.end()
	} catch (error) {
		console.error('Error generating description:', error)
		res.status(500).json({message: 'Error generating description'})
	}
})

function correctRankings(players) {
	// Sort players by hits in descending order
	// When hits are equal, sort randomly
	const sortedPlayers = players.sort((a, b) => {
		if (b.Hits !== a.Hits) {
			return b.Hits - a.Hits
		}
		return Math.random() - 0.5 // Random sort for ties
	})

	// Assign ranks based on the sorted order
	return sortedPlayers.map((player, index) => ({
		...player,
		Rank: (index + 1).toString(),
	}))
}

module.exports = router
