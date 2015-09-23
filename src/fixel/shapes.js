goog.provide('fixel.shapes');

goog.require('fixel.mask');

goog.scope(function() {
var shapes  = fixel.shapes;

shapes.circle = function(r) {
  var alternations = {};
  var iR = Math.floor(r);
  for (var y = -iR; y <= iR; ++y) {
    var x = Math.round(Math.sqrt(r * r - y * y));
    if (x > 0) {
      alternations[y] = [-x, x];
    }
  }
  return fixel.mask.create(alternations);
};

});