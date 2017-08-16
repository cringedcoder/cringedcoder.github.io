---
title: Webpack configuration tips
description: Quick how tos list with brief informations on achieving certain webpack behaviour
collection: posts
author: cringedcoder
date: 2017-08-16
publish: draft
layout: post.html
---

## How to get scss variables inside js code
Install ScssToJson
```bash
npm install scss-to-json --save-dev
```
Import scss-to-json
```
let scssToJson = require('scss-to-json');
```
Provide scss object in externals
```js
externals: {
  scss: JSON.stringify(scssToJson(scssVariablesPath))
}
```
Use it like a module:
```js
import scss from 'scss';

console.log(scss['$color-black']); // #000
```

## How to get jQuery exposed for other libs
Install jQuery
```bash
npm install jquery --save
```
Use ProvidePlugin plugin for webpack.
```js
plugins: [
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery'
  })
]
```
For providing jquery from local project file see note in the next tip.

## How to make imports relative to sources root
Use alias configuration
```js
  resolve: {
      alias: {
          sources: path.resolve(
              './src'
          )
      }
  }
```
Later on you can use following import path
```js
import component from 'soruces/js/component';
```
Note that it is possible to use aliases in webpack config too. For example in
ProvidePlugin:
```js
plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      Popper: 'sources/js/vendors/popper.js'
    })
]
```
