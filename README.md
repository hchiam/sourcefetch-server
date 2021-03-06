# sourcefetch-server [![version](https://img.shields.io/github/release/hchiam/sourcefetch-server)](https://github.com/hchiam/sourcefetch-server/releases) [![Build Status](https://travis-ci.org/hchiam/sourcefetch-server.svg?branch=master)](https://travis-ci.org/hchiam/sourcefetch-server)

**Live demo:** https://codepen.io/hchiam/full/PEMgBN

Just one of the things I'm learning. https://github.com/hchiam/learning

**Setup:**

```
git clone https://github.com/hchiam/sourcefetch-server.git
cd sourcefetch-server
npm install
node test.js
```

Originally intended for use within my [LUI](https://github.com/hchiam/language-user-interface) demo [here](https://codepen.io/hchiam/full/WOLOJG).

**Server:** https://sourcefetch-server.glitch.me

**Code:** https://glitch.com/edit/#!/sourcefetch-server?path=server.js:1:0

**Inspired by:** https://github.com/hchiam/sourcefetch-tutorial (specifically [sourcefetch.js](https://github.com/hchiam/sourcefetch-tutorial/blob/master/lib/sourcefetch.js) and [package.json](https://github.com/hchiam/sourcefetch-tutorial/blob/master/package.json))

**SVN at:** https://github.com/hchiam/sourcefetch-server

## A helpful note on a lesson learned with combining `async`/`await` with `.map`

<https://stackoverflow.com/questions/40140149/use-async-await-with-array-map/40140562#40140562>

**Problem:** If you give `await` an object that isn't a Promise (like what `.map` returns), then it'll evaluate immediately instead of actually waiting.

**Solution:** Wrap the `.map` in `Promise.all`, like this: `await Promise.all(arr.map(async x => await someProcessing(x)))`
