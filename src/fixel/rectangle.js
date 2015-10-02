goog.provide('fixel.Rectangle');


goog.scope(function(){



/**
 * @typedef {(null|{fromX: number, fromY: number, toX: number, toY: number})}
 */
fixel.Rectangle;
var Rectangle = fixel.Rectangle;


/**
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} toX
 * @param {number} toY
 * @return {Rectangle}
 */
fixel.createRectangle = function(fromX, fromY, toX, toY) {
  if (fromX >= toX || fromY >= toY) {
    return null; // empty
  }
  return {fromX: fromX, fromY: fromY, toX: toX, toY: toY}
}

}); //  goog.scope