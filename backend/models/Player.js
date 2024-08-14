const mongoose = require('mongoose')

const PlayerSchema = new mongoose.Schema({
	rank: {type: Number, default: null},
	player: {type: String, default: ''},
	ageThatYear: {type: Number, default: null},
	hits: {type: Number, default: 0},
	year: {type: Number, default: null},
	bats: {type: String, default: ''},
})

module.exports = mongoose.model('Player', PlayerSchema)
