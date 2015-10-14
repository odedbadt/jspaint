goog.provide('fixel.rectangle.Rectangle');
goog.provide('fixel.rectangle');



/**
 * @typedef {(null|{fromX: number, fromY: number, toX: number, toY: number})}
 */
fixel.rectangle.Rectangle;


goog.scope(function(){

var Rectangle = fixel.rectangle.Rectangle;
var rectangle = fixel.rectangle;

/**
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} toX
 * @param {number} toY
 * @return {Rectangle}
 */
rectangle.create = function(fromX, fromY, toX, toY) {
  if (fromX >= toX || fromY >= toY) {
    return null; // empty
  }
  return {fromX: fromX, fromY: fromY, toX: toX, toY: toY}
}


/**
 * @param {Rectangle} r1
 * @param {Rectangle} r2
 * @return {Rectangle}
 */
rectangle.intersection = function(r1, r2) {
  if (!r1 || !r2) { 
    return null; // empty
  }
  return fixel.rectangle.create(
    Math.max(r1.fromX, r2.fromX),
    Math.max(r1.fromY, r2.fromY),
    Math.min(r1.toX, r2.toX),
    Math.min(r1.toY, r2.toY));
};


/**
 * @param {Rectangle} r1
 * @param {Rectangle} r2
 * @return {Rectangle}
 */
rectangle.boundingRect = function(r1, r2) {
  if (!r1) {
    return r2;
  }
  if (!r2) {
    return r1;
  }
  return fixel.rectangle.create(
    Math.min(r1.fromX, r2.fromX),
    Math.min(r1.fromY, r2.fromY),
    Math.max(r1.toX, r2.toX),
    Math.max(r1.toY, r2.toY));
};


/**
 * @param {Rectangle} rect
 * @return {number} Width of rectangle
 */
rectangle.width = function(rect) {
  if (!rect || rect.toX < rect.fromX) {
    return 0;
  } else {
    return rect.toX - rect.fromX;
  }
};


/**
 * @param {Rectangle} rect
 * @return {number} Width of rectangle
 */
rectangle.height = function(rect) {
  if (!rect || rect.toY < rect.fromY) {
    return 0;
  } else {
    return rect.toY - rect.fromY;
  }
};

}); //  goog.scope