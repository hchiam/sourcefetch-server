var test = require("tape").test;
var request = require("request");
var supertest = require("supertest");
var app = require("./server.js");
var testCache = require("./test-cache.js");

test("tape", function (t) {
  t.equal(1, 1, "tape itself should work");
  t.end();
});

test("test getCode from search query inputs", async function (t) {
  var query = "quicksort";
  var language = "python";

  var actual = await app.getCode(query, language);
  var expected =
    'def sort(array=[12,4,5,6,7,3,1,15]):\n    """Sort the array by using quicksort."""\n\n    less = []\n    equal = []\n    greater = []\n\n    if len(array) > 1:\n        pivot = array[0]\n        for x in array:\n            if x < pivot:\n                less.append(x)\n            elif x == pivot:\n                equal.append(x)\n            elif x > pivot:\n                greater.append(x)\n        # Don\'t forget to return something!\n        return sort(less)+equal+sort(greater)  # Just use the + operator to join lists\n    # Note that you want equal ^^^^^ not pivot\n    else:  # You need to handle the part at the end of the recursion - when you only have one element in your array, just return the array.\n        return array\n';

  t.false(Array.isArray(actual), "output is NOT an array");
  t.equal(actual, expected, "check results of getCode");
  t.end();
  // process.exit(); // to just run this test, un-comment this line and comment out later tests
});

test("test getUrlsOfTopSearchResults from search query inputs", async function (t) {
  var query = "quicksort";
  var language = "python";
  var numberOfResults = 1;

  var urls = await app.getUrlsOfTopSearchResults(
    query,
    language,
    numberOfResults
  );
  var firstUrl = urls[0];

  var expectedToInclude =
    "https://www.google.com//url?q=https://stackoverflow.com/questions/18262306/quicksort-with-python";

  var urlMatchesWithoutQueryParameters =
    firstUrl.indexOf(expectedToInclude) !== -1;

  t.true(
    urlMatchesWithoutQueryParameters,
    "first URL matches (not including URL query parameters)"
  );
  t.end();
  // process.exit(); // to just run this test, un-comment this line and comment out later tests
});

test("test getHtml from URL", async function (t) {
  var url =
    "https://stackoverflow.com/questions/18262306/quicksort-with-python";

  var actual = await app.getHtml(url);

  var startOfTag = "<";
  var codeTag = "<code>";

  var containsStartOfTag = actual.indexOf(startOfTag) !== -1;
  var containsCodeTag = actual.indexOf(codeTag) !== -1;

  t.true(containsStartOfTag, "HTML contains start of tag <");
  t.true(containsCodeTag, "HTML contains <code> tag");
  t.end();
  // process.exit(); // to just run this test, un-comment this line and comment out later tests
});

test("test getText of code from HTML", async function (t) {
  var actual = await app.getText(testCache.testHtml);
  var expected = testCache.testCode;
  t.equal(actual, expected, "get code text from HTML");
  t.end();
  // process.exit(); // to just run this test, un-comment this line and comment out later tests
});

test("test query to the url", async function (t) {
  request("http://localhost:3000/fetch/?q=quicksort&lang=python", function (
    error,
    response,
    body
  ) {
    t.equal(error, null, "url query should have no error");

    var actual = JSON.parse(body).code;
    var expected =
      'def sort(array=[12,4,5,6,7,3,1,15]):\n    """Sort the array by using quicksort."""\n\n    less = []\n    equal = []\n    greater = []\n\n    if len(array) > 1:\n        pivot = array[0]\n        for x in array:\n            if x < pivot:\n                less.append(x)\n            elif x == pivot:\n                equal.append(x)\n            elif x > pivot:\n                greater.append(x)\n        # Don\'t forget to return something!\n        return sort(less)+equal+sort(greater)  # Just use the + operator to join lists\n    # Note that you want equal ^^^^^ not pivot\n    else:  # You need to handle the part at the end of the recursion - when you only have one element in your array, just return the array.\n        return array\n';

    t.false(
      Array.isArray(actual),
      "url query body code should NOT be an array"
    );
    t.equal(actual, expected, "code text should match");
    t.end();
    // process.exit(); // to just run this test, un-comment this line and comment out later tests
  });
});

test("test getting next result if there's no code in the first one (in google search)", async function (t) {
  request("http://localhost:3000/fetch/?q=stream", function (
    error,
    response,
    body
  ) {
    t.equal(error, null, "url query should have no error");

    var actual = JSON.parse(body).code;

    t.false(
      Array.isArray(actual),
      "url query body code should NOT be an array"
    );
    t.true(actual !== "", "code text should NOT be empty");
    t.end();
    // process.exit(); // to just run this test, un-comment this line and comment out later tests
  });
});

/*
 * this next test is inspired by code found here:
 * https://puigcerber.com/2015/11/27/testing-express-apis-with-tape-and-supertest/
 */
test("GET /fetch/?q=quicksort&lang=python", function (t) {
  supertest("http://localhost:3000")
    .get("/fetch/?q=quicksort&lang=python")
    .expect(200)
    .expect("Content-Type", /json/)
    .end(function (err, res) {
      var actual = res.body.code;
      var expected =
        'def sort(array=[12,4,5,6,7,3,1,15]):\n    """Sort the array by using quicksort."""\n\n    less = []\n    equal = []\n    greater = []\n\n    if len(array) > 1:\n        pivot = array[0]\n        for x in array:\n            if x < pivot:\n                less.append(x)\n            elif x == pivot:\n                equal.append(x)\n            elif x > pivot:\n                greater.append(x)\n        # Don\'t forget to return something!\n        return sort(less)+equal+sort(greater)  # Just use the + operator to join lists\n    # Note that you want equal ^^^^^ not pivot\n    else:  # You need to handle the part at the end of the recursion - when you only have one element in your array, just return the array.\n        return array\n';

      t.error(err, "server should have no error");
      t.false(Array.isArray(actual), "server response should NOT be an array");
      t.equal(actual, expected, "server should respond with expected response");
      t.end();
      process.exit();
    });
});
