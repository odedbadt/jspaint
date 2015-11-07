goog.provide('fixel.color.Color');
goog.provide('fixel.color');

goog.require('goog.asserts');

goog.scope(function(){
var color = fixel.color;


/**
 * @typedef {{r: number, g: number, b: number}}
 */
fixel.color.Color;
var Color = fixel.color.Color;


/**
 * @return {!Color}
 */
color.create = function(r, g, b) {
  goog.asserts.assert(r >= 0 && r <= 255, 'R componenet out of range.');
  goog.asserts.assert(g >= 0 && g <= 255, 'G componenet out of range.');
  goog.asserts.assert(b >= 0 && b <= 255, 'B componenet out of range.');
  return {r: r, g: g, b: b}
};

}); //  goog.scope