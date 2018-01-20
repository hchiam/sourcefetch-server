const express = require('express');
const app = express();
const request = require('request');
const cheerio = require('cheerio');

app.use(express.static('public'));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});

app.get("/:query", (req, res) => {
  
  // ******* HERE'S WHERE IT TAKES A QUERY AND RETURNS SOMETHING *******
  
  // var r = test_promise_github_json(req.params.query);
  var r = test_promise_html(req.params.query);
  // var r = test_cheerio(req.params.query);
  
  r.then(function(result) {
    res.type('json').send(
      {'response':result}
    );
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

function test_return(query) {
  return 'simple return. query = ' + query;
}

function test_promise_then(query) {
  return new Promise((resolve, reject) => {
    // console.log('Initial');
    // resolve();
    var url = "http://www.google.com";
    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log('SOMETHING WORKED!!! query = ' + String(body));
        resolve(body);
      } else {
        console.log('IT DID NOT WORK...');
        reject({
          reason: 'Unable to download page.'
        });
      }
    });
  })
  .then(() => {
      throw new Error('Something failed');

      console.log('Do this');
  })
  .catch(() => {
      console.log('Do that');
  })
  .then(() => {
      console.log('Do this whatever happened before');
  });
}

function test_promise_simple_resolve(query) {
  return new Promise((resolve, reject) => {
    resolve("got it");
  });
}

function test_promise_github_json(query) {
  var options = {
      url: 'https://api.github.com/users/narenaryan',
      headers: {
          'User-Agent': 'request'
      }
  };
  return new Promise(function(resolve, reject) {
    request.get(options,function(error,response,body){
      if (error) {
        reject(error);
      } else {
        resolve(
          {
            1:query,
            2:JSON.parse(body)
          }
        );
      }
    });
  });
}

function test_promise_html(query) {
  var url = 'https://en.wikipedia.org/wiki/' + query;
  var options = {
      url: url
  };
  return new Promise(function(resolve, reject) {
    request.get(options,function(error,response,body){
      if (error) {
        reject(error);
      } else {
        resolve(
          {
            query:query,
            url:url,
            body:body
          }
        );
      }
    });
  });
}

function test_cheerio(query) {
  var url = 'https://en.wikipedia.org/wiki/' + query;
  var options = {
      url: url
  };
  return new Promise(function(resolve, reject) {
    request.get(options,function(error,response,body){
      if (error) {
        reject(error);
      } else {
        resolve(
          {
            query:query,
            url:url,
            body:body
          }
        );
      }
    });
  }).then(function(html) {
    const $ = cheerio.load(html);
    // return {scrape:$('div.accepted-answer pre code').text()};
    return {scrape:$('div.mw-parser-output').text()};
  });
}
