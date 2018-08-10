;(async function() {
    const fetch = require('node-fetch')
    const _ = require('lodash')
    let searchString = process.argv[2]
    if (!searchString) {
        return
    }
    let res = await fetch(
        `https://www.nintendo.com/json/content/get/game/list/filter/subset?qtitlelike=${encodeURIComponent(
            searchString
        )}&qsortBy=releaseDate&qdirection=descend&qhardware=Nintendo%20Switch`
    )
    const json = await res.json()
    console.log(`json`, json)
    // let gameWeirdID = _.get(json, 'game[0].id') || _.get(json, 'game.id')
    // if (!gameWeirdID) {
    //     return
    // }
    // res = await fetch(
    //     `https://www.nintendo.com/json/content/get/game/${gameWeirdID}`
    // )
    // const gameResultJSON = await res.json()
    // console.log(`gameResultJSON`, gameResultJSON)
    // let nintendoStoreID = _.get(gameResultJSON, 'game.nsuid')
    // console.log(`nintendoStoreID`, nintendoStoreID)
})()
