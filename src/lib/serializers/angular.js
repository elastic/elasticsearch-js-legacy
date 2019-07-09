/* global angular */
var utils = require('../utils');
var JsonSerializer = require('../serializers/json');

function AngularSerializer() {}
utils.inherits(AngularSerializer, JsonSerializer);

// mimic the JsonSerializer's encode method, but use angular's toJson instead
AngularSerializer.prototype.encode = function (val) {
  switch (typeof val) {
    case 'string':
      return val;
    case 'object':
      if (val) return angular.toJson(val);
    /* falls through */
    default:
      return undefined
  }

};

module.exports = AngularSerializer;
