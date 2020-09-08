var axios = require("axios");
var cheerio = require("cheerio");

// Example usage:

// (async function () {
//   var query = "js sort backwards";
//   var queryBiasedToJs = query;
//   function biasToJs() {
//     var words = queryBiasedToJs.split(" ");
//     var hasJs = words.some(
//       (w) => w.toLowerCase() === "js" || w.toLowerCase() === "javascript"
//     );
//     if (hasJs) return;
//     queryBiasedToJs = "js " + queryBiasedToJs;
//   }
//   biasToJs();
//   console.log(await google(queryBiasedToJs));
// })();

async function google(what, numberOfResults) {
  var url = `https://www.google.com/search?q=${what}`;
  try {
    var html = await axios.get(url);
    var howManyResults = numberOfResults || 3;
    var searchResults = []; // {header:'', link:'', description:''}
    var body = await cheerio.load(html.data);
    body("h3")
      .slice(0, howManyResults)
      .each(function () {
        var header = body(this);
        var headerText = header.text();
        var link = header.parent();
        var linkText = "https://www.google.com/" + link.attr("href");
        var descriptionSelector = "div.BNeawe div.BNeawe";
        var description = header
          .parent()
          .parent()
          .siblings()
          .find(descriptionSelector);
        var descriptionText = description.text();
        var searchResult = {
          header: headerText,
          link: linkText,
          description: descriptionText,
        };
        searchResults.push(searchResult);
      });
    return searchResults;
  } catch (error) {
    return error;
  }
}

if (typeof exports !== "undefined") {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      google,
    };
  }
}
