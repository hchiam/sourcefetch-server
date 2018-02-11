/* ******* OVERVIEW: *******
 * 
 * A good place to start reading: getCode. Give it a searchString and a programmingLanguage to : 
 * 
 * search stackoverflow.com --> URL --> HTML --> text --> get a code snippet! 
 * 
 * The important steps in the code are : 
 * 
 * getUrlOfTopSearchResult (using 'google') --> getHtml (using 'request') --> getText (using 'cheerio') --> code snippet! 
 * 
 * *************************
 */

// import express.js to make it easier to write this app's code
const express = require('express');
const app = express();

// import special functionality to search, get html, and web scrape
const google = require('google'); // search string --> url list
const request = require('request'); // url --> html
const cheerio = require('cheerio'); // html --> element text

google.resultsPerPage = 1;

// need this default block for this glitch.com server to work
if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = []; //['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

// make this app publicly available for user requests
app.use(express.static('public'));

// make this app actually listen for requests
const listener = app.listen(process.env.PORT | 3000, () => { // | 3000 in case testing locally
  console.log('Your app is listening on port ' + listener.address().port);
});

// make this app respond to requests, like this one: https://sourcefetch-server.glitch.me/fetch/?q=quicksort&lang=python
app.get("/fetch", (request, response) => { // you can optionally specify a programming language
  
  // set up search for code snippet
  let searchString = request.query.q; // e.g.: q = "quicksort" <-- https://sourcefetch-server.glitch.me/fetch/?q=quicksort
  let programmingLanguage = 'javascript'; // JS by default
  if (request.query.lang !== undefined) {
    programmingLanguage = request.query.lang; // e.g.: lang=python <-- https://sourcefetch-server.glitch.me/fetch/?q=quicksort&lang=python
  }
  
  // get code snippet
  let codeSnippetFound = getCode(searchString, programmingLanguage);
  
  // send code snippet to user
  codeSnippetFound.then(function(result) {
    response.type('json').send(
      {'code':result}
    );
  });
  
});

// ******* DETAILS OF getCode: CHAINED "PROMISES" *******

function getCode(query, language) {
  // e.g.: query = "quicksort", language = "javascript"
  return getUrlOfTopSearchResult(query,language)
    .then(url => getHtml(url))
    .then(html => getText(html));
}

function getUrlOfTopSearchResult(query, language) {
  let searchString = query + " in " + language + " site:stackoverflow.com";
  return new Promise((resolve, reject) => {
    
    // use google --> get top search result --> get url
    google(searchString, (error, response) => {
      if (error) {
        reject( { reason: 'Search error.' } );
      } else if (response.links.length === 0) {
        reject( { reason: 'No results found.' } );
      } else {
        let firstLink = response.links[0].href;
        resolve(firstLink);
      }
    });
    
  });
}

function getHtml(url) {
  var options = { url: url, headers: {'User-Agent': 'request'} };
  return new Promise(function(resolve, reject) {
    
    // use url and indicate 'request' --> get page html
    request.get(options, function(error, response, html){
      if (error) {
        reject(error);
      } else {
        resolve(html);
      }
    });
    
  });
}

function getText(html) {
  return new Promise((resolve, reject) => {
    
    // use html --> get specific html element --> get text
    $ = cheerio.load(html);
    resolve($('div.accepted-answer pre code').text()); // get text of code element in a pre in a div with class .accepted-answer
    
  });
}
