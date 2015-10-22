goog.provide('fixel.Color');

goog.require('goog.asserts');

goog.scope(function(){



/**
 * @typedef {{r: number, g: number, b: number}}
 */
fixel.Color;
var Color = fixel.Color;


/**
 * @return {!Color}
 */
fixel.createColor = function(r, g, b) {
  goog.asserts.assert(r >= 0 && r <= 255, 'R componenet out of range.');
  goog.asserts.assert(g >= 0 && g <= 255, 'G componenet out of range.');
  goog.asserts.assert(b >= 0 && b <= 255, 'B componenet out of range.');
  return {r: r, g: g, b: b}
};

}); //  goog.scope