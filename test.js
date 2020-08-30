var test = require("tape").test;
var request = require("request");
var supertest = require("supertest");
var app = require("./server.js");
var testCache = require("./test-cache.js");

test("tape", function (t) {
  t.equal(1, 1, "tape itself should work");
  t.end();
});

test("test getUrlsOfTopSearchResults from search query inputs", async function (t) {
  var query = "quicksort";
  var language = "python";
  var numberOfResults = 1;
  var actual = await app.getUrlsOfTopSearchResults(
    query,
    language,
    numberOfResults
  );
  var expectedToInclude =
    "https://www.google.com//url?q=https://stackoverflow.com/questions/18262306/quicksort-with-python";
  var urlMatchesWithoutQueryParameters =
    actual.indexOf(expectedToInclude) !== -1;
  t.true(urlMatchesWithoutQueryParameters);
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
  t.true(containsStartOfTag);
  t.true(containsCodeTag);
  t.end();
  // process.exit(); // to just run this test, un-comment this line and comment out later tests
});

test("test getText of code from HTML", async function (t) {
  var actual = await app.getText(testCache.testHtml);
  var expected = testCache.testCode;
  t.equal(actual, expected);
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
    var code = JSON.parse(body).code;
    t.equal(
      code,
      'def sort(array=[12,4,5,6,7,3,1,15]):\n    """Sort the array by using quicksort."""\n\n    less = []\n    equal = []\n    greater = []\n\n    if len(array) > 1:\n        pivot = array[0]\n        for x in array:\n            if x < pivot:\n                less.append(x)\n            elif x == pivot:\n                equal.append(x)\n            elif x > pivot:\n                greater.append(x)\n        # Don\'t forget to return something!\n        return sort(less)+equal+sort(greater)  # Just use the + operator to join lists\n    # Note that you want equal ^^^^^ not pivot\n    else:  # You need to handle the part at the end of the recursion - when you only have one element in your array, just return the array.\n        return array\n',
      "url query body code should equal json response"
    );
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
      var expectedThings =
        'def sort(array=[12,4,5,6,7,3,1,15]):\n    """Sort the array by using quicksort."""\n\n    less = []\n    equal = []\n    greater = []\n\n    if len(array) > 1:\n        pivot = array[0]\n        for x in array:\n            if x < pivot:\n                less.append(x)\n            elif x == pivot:\n                equal.append(x)\n            elif x > pivot:\n                greater.append(x)\n        # Don\'t forget to return something!\n        return sort(less)+equal+sort(greater)  # Just use the + operator to join lists\n    # Note that you want equal ^^^^^ not pivot\n    else:  # You need to handle the part at the end of the recursion - when you only have one element in your array, just return the array.\n        return array\n';
      var actualThings = res.body.code;

      t.error(err, "server should have no error");
      t.equal(
        actualThings,
        expectedThings,
        "server should respond with expected response"
      );
      t.end();
      process.exit();
    });
});
