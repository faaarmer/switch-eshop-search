const _ = require('lodash')
const fetch = require('node-fetch')
const inquirer = require('inquirer')
const ora = require('ora')
;(async function () {
	let inquirerAnswer = await inquirer.prompt([
		{
			message: "What's the title of the game?",
			type: 'input',
			name: 'searchString',
		},
	])
	let spinner = ora('Loading').start()

	let fetchRes = await fetch(
		`https://www.nintendo.com/json/content/get/game/list/filter/subset?qtitlelike=${encodeURIComponent(
			inquirerAnswer.searchString
		)}&qsortBy=releaseDate&qdirection=descend&qhardware=Nintendo%20Switch`
	)

	const searchResults = await fetchRes.json()
	let numResults = _.get(searchResults, 'total')
	let gameWeirdID
	let choices
	let selectedGame

	if (!numResults) {
		return
	}
 else if (numResults === 1 || numResults === '1') {
		selectedGame = searchResults.game
	}
 else {
		spinner.stop()
		choices = _.map(searchResults.game, 'title')
		inquirerAnswer = await inquirer.prompt([
			{
				message: 'What game are you looking for?',
				type: 'list',
				name: 'game',
				choices,
			},
		])
		selectedGame = _.find(searchResults.game, {
			title: inquirerAnswer.game,
		})
	}
	gameWeirdID = selectedGame.id
	spinner.start()
	res = await fetch(
		`https://www.nintendo.com/json/content/get/game/${gameWeirdID}`
	)
	const gameResultJSON = await res.json()
	let usNintendoStoreID = _.get(gameResultJSON, 'game.nsuid')
	if (!usNintendoStoreID) {
		spinner.stop()
		console.log(`This game isn't on the eShop 😓`)

		// if (!choices) {
		// } else {
		// 	console.log('')
		// }
	}
 else {
		let generatedIds = generateIdsToTest(usNintendoStoreID)
		let games = await testIDs(generatedIds)
		spinner.stop()
		// console.log(JSON.stringify(games, null, 4))
		prettyPrintGameStats(selectedGame, games[0])
	}
})()

async function testIDs (generatedIds) {
	let promises = []
	const games = []
	_.each(generatedIds, id => {
		promises.push(
			fetch(
				`https://ec.nintendo.com/api/AU/en/guest_prices?ns_uids=${id}`,
				{
					credentials: 'omit',
					headers: {},
					referrer: `https://ec.nintendo.com/AU/en/titles/${id}`,
					referrerPolicy: 'no-referrer-when-downgrade',
					body: null,
					method: 'GET',
					mode: 'cors',
				}
			).then(res => res.text())
		)
	})
	let results = await Promise.all(promises)
	_.each(results, async res => {
		let auEshopResult = JSON.parse(res)
		if (
			!_.isEmpty(auEshopResult) &&
            !_.isEmpty(_.get(auEshopResult, '[0].price'))
		) {
			games.push(auEshopResult[0])
		}
	})
	return games
}

function generateIdsToTest (usNintendoStoreID) {
	usNintendoStoreID = parseInt(usNintendoStoreID)

	let ids = [usNintendoStoreID]

	for (let i = 1; i <= 5; i++) {
		ids.push(usNintendoStoreID - i)
		ids.push(usNintendoStoreID + i)
	}
	return ids
}

function prettyPrintGameStats (selectedGame, auEshopResult) {
	console.log(
		`${selectedGame.title} - ${
			auEshopResult.price.regular_price.formatted_value
		}${
			auEshopResult.price.regular_price.currency
		} - https://ec.nintendo.com/AU/en/titles/${auEshopResult.id}`
	)
	console.log(
		`<a href="https://ec.nintendo.com/AU/en/titles/${auEshopResult.id}">${selectedGame.title} - ${
			auEshopResult.price.regular_price.formatted_value
		}${
			auEshopResult.price.regular_price.currency
		}</a>`
	)
}
