/* ******* OVERVIEW: *******
 *
 * A good place to start reading: getCode. Give it a searchString and a programmingLanguage to :
 *
 * search stackoverflow.com --> URL --> HTML --> text --> get a code snippet!
 *
 * The important steps in the code are :
 *
 * getUrlsOfTopSearchResults (using 'google') --> getHtml (using 'request') --> getText (using 'cheerio') --> code snippet!
 *
 * *************************
 */

// import express.js to make it easier to write this app's code
var express = require("express");
var app = express();

// import special functionality to search, get html, and web scrape
var { google } = require("./helpers/google.js");
var request = require("request"); // url --> html
var cheerio = require("cheerio"); // html --> element text

// need this default block for this glitch.com server to work
if (!process.env.DISABLE_XORIGIN) {
  app.use(function (req, res, next) {
    var allowedOrigins = []; //['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || "*";
    if (!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      console.log(origin);
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
    }
    next();
  });
}

// make this app publicly available for user requests
app.use(express.static("public"));

// make this app actually listen for requests
var listener = app.listen(process.env.PORT | 3000, () => {
  // | 3000 in case testing locally
  console.log("Your app is listening on port " + listener.address().port);
});

// make this app respond to requests, like this one: https://sourcefetch-server.glitch.me/fetch/?q=quicksort&lang=python
app.get("/fetch", (request, response) => {
  // you can optionally specify a programming language

  // set up search for code snippet
  var searchString = request.query.q; // e.g.: q = "quicksort" <-- https://sourcefetch-server.glitch.me/fetch/?q=quicksort
  var programmingLanguage = "javascript"; // JS by default
  if (request.query.lang !== undefined) {
    programmingLanguage = request.query.lang; // e.g.: lang=python <-- https://sourcefetch-server.glitch.me/fetch/?q=quicksort&lang=python
  }

  // get code snippet
  var codeSnippetFound = getCode(searchString, programmingLanguage);

  // send code snippet to user
  codeSnippetFound
    .then(function (result) {
      response.type("json").send({ code: result });
    })
    .catch(function (error) {
      console.log("codeSnippetFound", error);
    });
});

// ******* DETAILS OF getCode: CHAINED "PROMISES" *******

function getCode(query, language = "javascript") {
  // e.g.: query = "quicksort", language = "javascript"
  var numberOfResults = 5;
  var codeText = getUrlsOfTopSearchResults(query, language, numberOfResults)
    .then((urls) => Promise.all(urls.map((url) => getHtml(url))))
    .then((htmls) => Promise.all(htmls.map((html) => getText(html))))
    .then((texts) => texts.filter((text) => text != ""))
    .then((texts) => texts[0]) // first one
    .catch(function (error) {
      console.log("getCode getUrlsOfTopSearchResults", error);
    });
  return codeText;
}

async function getUrlsOfTopSearchResults(
  query,
  language = "javascript",
  numberOfResults
) {
  var searchString = query + " in " + language + " site:stackoverflow.com";
  console.log("searchString:", searchString);
  var output = await google(searchString);

  return new Promise((resolve, reject) => {
    // use google --> get top search result --> get url
    var linksFound = output && output.length && output[0].link;
    if (linksFound) {
      // var firstLink = output[0].link;
      var urls = output.slice(0, numberOfResults).map((r) => r.link);
      resolve(urls);
    } else if (output && output.length === 0) {
      reject({ reason: "No results found." });
    } else {
      reject({ reason: "Search error." });
    }
  }).catch(function (error) {
    console.log("getUrlsOfTopSearchResults", error);
  });
}

function getHtml(url) {
  var options = { url: url, headers: { "User-Agent": "request" } };
  return new Promise(function (resolve, reject) {
    // use url and indicate 'request' --> get page html
    request.get(options, function (error, response, html) {
      if (error) {
        reject(error);
      } else {
        resolve(html);
      }
    });
  }).catch(function (error) {
    console.log("getHtml", error);
  });
}

function getText(html) {
  return new Promise((resolve, reject) => {
    // use html --> get specific html element --> get text
    var $ = cheerio.load(html);
    var text = $("div.accepted-answer pre code").text();
    resolve(text); // get text of code element in a pre in a div with class .accepted-answer
  }).catch(function (error) {
    console.log("getHtml", error);
  });
}

if (typeof exports !== "undefined") {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      getCode,
      getUrlsOfTopSearchResults,
      getHtml,
      getText,
    };
  }
}
