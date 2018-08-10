;(async function() {
    const fetch = require('node-fetch')
    const _ = require('lodash')
    const inquirer = require('inquirer')
    let inquirerAnswer = await inquirer.prompt([
        {
            message: "What's the title of the game?",
            type: 'input',
            name: 'searchString',
        },
    ])

    let fetchRes = await fetch(
        `https://www.nintendo.com/json/content/get/game/list/filter/subset?qtitlelike=${encodeURIComponent(
            inquirerAnswer.searchString
        )}&qsortBy=releaseDate&qdirection=descend&qhardware=Nintendo%20Switch`
    )
    const searchResults = await fetchRes.json()
    let numResults = _.get(searchResults, 'total')
    let gameWeirdID
    let choices
    if (!numResults) {
        return
    } else if (numResults === 1 || numResults === '1') {
        console.log('one')
        gameWeirdID = searchResults.game.id
    } else {
        choices = _.map(searchResults.game, 'title')
        inquirerAnswer = await inquirer.prompt([
            {
                message: 'What game are you looking for?',
                type: 'list',
                name: 'game',
                choices,
            },
        ])
        gameWeirdID = _.find(searchResults.game, { title: inquirerAnswer.game })
            .id
    }

    res = await fetch(
        `https://www.nintendo.com/json/content/get/game/${gameWeirdID}`
    )
    const gameResultJSON = await res.json()
    let nintendoStoreID = _.get(gameResultJSON, 'game.nsuid')
    if (!nintendoStoreID) {
        console.log(`This game isn't on the eShop 😓`)
        // if (!choices) {
        // } else {
        // 	console.log('')
        // }
    } else {
        console.log(`nintendoStoreID`, nintendoStoreID)
        res = await fetch(
            `https://ec.nintendo.com/api/AU/en/guest_prices?ns_uids=${nintendoStoreID}`,
            {
                credentials: 'omit',
                headers: {},
                referrer: `https://ec.nintendo.com/AU/en/titles/${nintendoStoreID}`,
                referrerPolicy: 'no-referrer-when-downgrade',
                body: null,
                method: 'GET',
                mode: 'cors',
            }
        )
        // console.log(`res`, res)
        const auEshopResult = await res.json()
        console.log(`auEshopResult`, auEshopResult)
    }
})

// testing response of valid AU shop response
;(async function() {
    const fetch = require('node-fetch')
    let res = await fetch(
        `https://ec.nintendo.com/api/AU/en/guest_prices?ns_uids=70010000007705`,
        {
            credentials: 'omit',
            headers: {},
            referrer: `https://ec.nintendo.com/AU/en/titles/70010000007705`,
            referrerPolicy: 'no-referrer-when-downgrade',
            body: null,
            method: 'GET',
            mode: 'cors',
        }
    )
    console.log(`res`, res)
    const auEshopResult = await res.json()
    console.log(`auEshopResult`, auEshopResult)
})()
