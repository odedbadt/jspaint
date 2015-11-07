goog.provide('fixel.shapes');

goog.require('fixel.mask');
goog.require('fixel.rectangle');

goog.scope(function() {
var shapes = fixel.shapes;
var rectangle = fixel.rectangle;


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


shapes.star = function(r) {
  return fixel.mask.fromBoolean(rectangle.create(-r*5,-r*5,r*5,r*5),
      function(x, y) {
        var count = 0;
        for (var i = 0; i < 5; ++i) {
          var theta = Math.PI*2/5 * i;
          var dy = Math.cos(theta);
          var dx = Math.sin(theta);
          if (x * dx + y * dy < r) {
            count++;
          }
        }
        return count > 3;
      });
};

shapes.rectangle = function(fromX, fromY, toX, toY) {
  return fixel.mask.fromBoolean(rectangle.create(fromX, fromY, toX, toY),
      function(x, y) {
        return true;
      });
};

});