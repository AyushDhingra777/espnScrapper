//2
const cheerio = require("cheerio")
const request = require("request")
const scoreCardObj = require("./score")
function getEveryMatch(fullLink) {  //Link we get from cricket.js
    request(fullLink, cb)   //request
    function cb(err, res, html) {
        if (err) {
            console.log(err)
        }
        else {
            extractEveryMatch(html)
        }
    }
}
function extractEveryMatch(html) {
    let $ = cheerio.load(html)
    let allMatches = $(".match-info.match-info-FIXTURES")   //this gives us ALL MATCHES 

    for (i = 0; i < allMatches.length; i++) {
        let link = $(allMatches[i]).find("a").attr("href")
        let fullLink = "https://www.espncricinfo.com/" + link   //full link to get score of the current match
        console.log(fullLink)
        scoreCardObj.scoreCard(fullLink)    //from module.exports score.js

    }
}
module.exports = {
    getMatches: getEveryMatch
}