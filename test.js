'use strict';

const test = require('tape').test;
const request = require('request');
const supertest = require('supertest');
const app = require('./server.js');

test('tape', function(t) {
  t.equal(1, 1, 'tape itself should work');
  t.end();
});

test('test query to the url', function(t) {
  request('https://sourcefetch-server.glitch.me/fetch/?q=quicksort&lang=python', function(error, response, body) {
    t.equal(error, null, 'url query should have no error');
    t.equal(JSON.parse(body).code, "def sort(array=[12,4,5,6,7,3,1,15]):\n    less = []\n    equal = []\n    greater = []\n\n    if len(array) > 1:\n        pivot = array[0]\n        for x in array:\n            if x < pivot:\n                less.append(x)\n            if x == pivot:\n                equal.append(x)\n            if x > pivot:\n                greater.append(x)\n        # Don't forget to return something!\n        return sort(less)+equal+sort(greater)  # Just use the + operator to join lists\n    # Note that you want equal ^^^^^ not pivot\n    else:  # You need to hande the part at the end of the recursion - when you only have one element in your array, just return the array.\n        return array\n",
      'url query body code should equal json response');
    t.end();
  });
});

/* 
 * this next test is inspired by code found here: 
 * https://puigcerber.com/2015/11/27/testing-express-apis-with-tape-and-supertest/
 */
test('GET /fetch/?q=quicksort&lang=python', function(t) {
  supertest('http://localhost:3000')
    .get('/fetch/?q=quicksort&lang=python')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      var expectedThings = "def sort(array=[12,4,5,6,7,3,1,15]):\n    less = []\n    equal = []\n    greater = []\n\n    if len(array) > 1:\n        pivot = array[0]\n        for x in array:\n            if x < pivot:\n                less.append(x)\n            if x == pivot:\n                equal.append(x)\n            if x > pivot:\n                greater.append(x)\n        # Don't forget to return something!\n        return sort(less)+equal+sort(greater)  # Just use the + operator to join lists\n    # Note that you want equal ^^^^^ not pivot\n    else:  # You need to hande the part at the end of the recursion - when you only have one element in your array, just return the array.\n        return array\n";
      var actualThings = res.body.code;

      t.error(err, 'server should have no error');
      t.equal(actualThings, expectedThings, 'server should respond with expected response');
      t.end();
      process.exit();
    });
});
