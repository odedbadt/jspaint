goog.provide('fixel.Point');


goog.scope(function() {



/**
 * @typedef {{x: number, y: number}}
 */
fixel.Point;
var Point = fixel.Point;


/**
 * @param {number} x
 * @param {number} y
 * @return {!Point}
 */
fixel.createRectangle = function(x, y) {
  return {x: x, y: y}
}

});  // goog.scope