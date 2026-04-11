const existing = require('./existing');
const branding = require('./branding');
const parks = require('./parks');
const attractions = require('./attractions');
const promotions = require('./promotions');
const travel = require('./travel');
const recommendations = require('./recommendations');
const searchHistory = require('./search-history');
const leads = require('./leads');

module.exports = {
  ...existing,
  ...branding,
  ...parks,
  ...attractions,
  ...promotions,
  ...travel,
  ...recommendations,
  ...searchHistory,
  ...leads,
};