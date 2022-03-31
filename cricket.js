//1
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595"
const cheerio = require("cheerio")
const request = require("request")
const fs = require("fs")
const path = require("path")
const allMatchObj = require("./allMatch")
const iplPath = path.join(__dirname, "ipl") //making path to "ipl" directory
dirCreate(iplPath)
request(url, cb)    //request
function cb(err, res, html) {   //callback
    if (err) {
        console.log(err)
    }
    else {
        extractHtml(html)
    }
}
function extractHtml(html) {
    let $ = cheerio.load(html)
    let link = $(".widget-items.cta-link").find("a").attr("href")   //we dont get full link,homepage part will not be there
    // console.log(link)
    let fullLink = "https://www.espncricinfo.com/" + link   //This will give link to next page when we click "view ALL RESULTS"
    allMatchObj.getMatches(fullLink)    //from module.exports allMatch.js
}

function dirCreate(filepath) {   //to create directory called ipl
    if (fs.existsSync(filepath) == false) {
        fs.mkdirSync(filepath)
    }
}
