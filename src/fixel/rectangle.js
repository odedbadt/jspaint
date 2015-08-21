goog.provide('fixel.Rectangle');



/**
 * @typedef {{fromX: number, fromY: number, toX: number, toY: number}}
 */
fixel.Rectangle;
var Rectangle = fixel.Rectangle;


/**
 * @return {!Rectangle}
 */
fixel.createRectangle = function(fromX, fromY, toX, toY) {
  if (fromX >= toX || fromY >= toY) {
    return null; // empty
  }
  return {fromX: fromX, fromY: fromY, toX: toX, toY: toY}
}