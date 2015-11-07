goog.provide('fixel.point');
goog.provide('fixel.point.Point');


goog.scope(function() {
var point = fixel.point;


/**
 * @typedef {{x: number, y: number}}
 */
fixel.point.Point;
var Point = fixel.point.Point;


/**
 * @param {number} x
 * @param {number} y
 * @return {!Point}
 */
point.create = function(x, y) {
  return {x: x, y: y}
};


/**
 * @param {number} x
 * @param {number} y
 * @return {!Point}
 */
point.minus = function(p1, p2) {
  if (arguments.length == 1) {
    return point.create(-p1.x, -p1.y);
  }
  if (!p1) {
    return point.create(-p2.x, -p2.y);
  }
  if (!p2) {
    return p1;
  }
  return point.create(p1.x - p2.x, p1.y - p2.y);
};


/**
 * @param {number} x
 * @param {number} y
 * @return {!Point}
 */
point.plus = function(p1, p2) {
  if (!p1) {
    return point.plus(p2, p1);
  }
  if (!p2) {
    return p1;
  }
  return point.create(p1.x + p2.x, p1.y + p2.y);
};

});  // goog.scope