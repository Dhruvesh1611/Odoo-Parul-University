const beverages = require('./beverages');
const snacks = require('./snacks');
const breakfast = require('./breakfast');
const mainCourse = require('./mainCourse');
const desserts = require('./desserts');
const salads = require('./salads');
const specials = require('./specials');

module.exports = [
  ...beverages,
  ...snacks,
  ...breakfast,
  ...mainCourse,
  ...desserts,
  ...salads,
  ...specials,
];
