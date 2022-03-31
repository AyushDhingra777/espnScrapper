// const url = "https://www.espncricinfo.com//series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard"
const cheerio = require("cheerio")
const request = require("request")
const path = require("path")
const xlsx = require("xlsx")
const fs = require("fs")
function scoreCardEveryTeam(url) {

    request(url, cb)
}
function cb(err, res, html) {
    if (err) {
        console.log(err)
    }
    else {
        extractScore(html)
    }
}
function extractScore(html) {
    let $ = cheerio.load(html)  //loading html using cheerio
    //getting the description box where its written (1st Match (N), Abu Dhabi, Sep 19 2020, Indian Premier League)
    let dateVenuetElem = $(".match-header-info.match-info-MATCH .description")
    //Now we can convert it to text,split it on "," and get element at 1st index for venue,2nd index for date
    let venue = dateVenuetElem.text().split(",")[1].trim()
    let date = dateVenuetElem.text().split(",")[2].trim()
    // console.log(venue)
    // console.log(date)
    //GETTING RESULT
    //getting the result box where only result was written
    let resultElem = $(".event .status-text")
    let result = resultElem.text();
    // console.log(result)
    //we get 3 boxes,2 are of the innings of each team,3rd is match summary
    //now we use cheerio to get only 2 innings,since they have the class "collapsible",easy to select them
    let innings = $(".card.content-block.match-scorecard-table>.Collapsible")
    //To make work easy,get html of any inning 
    let htmlStr = ""
    for (let i = 0; i < innings.length; i++) {  //Loop through 2 innings
        // htmlStr += $(innings[i]).html() //since we wrote "+=" and not "=",we will get both innings ,with "=" we only get the last inning
        //Getting team Name
        let teamName = $(innings[i]).find("h5").text();     //Team Name was under h5 in html
        //We get something like => Mumbai Indians INNINGS (20 overs maximum) ||to remove extra info
        teamName = teamName.split("INNINGS")[0].trim()   //splitting on "INNINGS"=>it returns array,our team will be at idx 0
        let oppTeamidx = (i == 0) ? 1 : 0         //if i(teamName) is 0,then obv other team name(oppTeamName) will be at innings[1],vice versa
        let oppTeamName = $(innings[oppTeamidx]).find("h5").text();
        //same splitting for opponentTeam
        oppTeamName = oppTeamName.split("INNINGS")[0].trim()
        console.log(`${venue} | ${date} | ${teamName} | ${oppTeamName}`)
        //Now we have innings table,we need to access their rows
        //we get all rows of current inning,some rows are empty,some contain extra etc,we need only batsman rows
        let allRows = $(innings[i]).find(".table.batsman tbody tr")
        for (let j = 0; j < allRows.length; j++) {  //to iterate through all rows
            //Getting table data "td" for each row             
            let cols = $(allRows[j]).find("td");
            //Rows which are of batsman,their first column has a class "batsman-cell",since the first column is of batsman Name
            let isBatsman = $(cols[0]).hasClass("batsman-cell")  //returns true if found
            if (isBatsman == true) //It is a batsman
            {
                let playerName = $(cols[0]).text().trim();
                let runs = $(cols[2]).text().trim();
                let balls = $(cols[3]).text().trim();
                let fours = $(cols[5]).text().trim();
                let sixes = $(cols[6]).text().trim();
                let sr = $(cols[7]).text().trim();
                console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${sr}`);
                processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, oppTeamName, venue, date, result)  //To create Folder for each player
            }

        }


    }

    // console.log(htmlStr) since we got the html,hence line commented
}

function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result) {
    let teamPath = path.join(__dirname, "ipl", teamName); //creating path to team name
    dirCreate(teamPath); //Passing path to create teamName dir(if not created)
    let filePath = path.join(teamPath, playerName + ".xlsx");  //we passed path to teamName Dir and then we create path for playerName Dir
    //will return [] if there is no data,after first entry,remaining entries will start getting appended
    let content = excelReader(filePath, playerName); //arguments of this fn are=>(filePath,sheetName),will return [] if there is no data 
    //Making player obj to push to json
    let playerObj = {
        teamName,
        playerName,
        runs,
        balls,  //shorthand when key and value name is same   
        fours,
        sixes,
        sr,
        opponentName,
        venue,
        date,
        result
    }
    //adding data to json(content)
    content.push(playerObj);
    excelWriter(filePath, content, playerName); //args are filePath,json and sheetName
}

function dirCreate(filepath) {   //to create directory called ipl
    if (fs.existsSync(filepath) == false) {
        fs.mkdirSync(filepath)
    }
}
function excelWriter(filePath, json, sheetName) {

    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName) {
    if (fs.existsSync(filePath) == false) {
        return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;

}


module.exports = {
    scoreCard: scoreCardEveryTeam
}