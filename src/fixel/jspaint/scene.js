goog.provide('fixel.jspaint.Layer');
goog.provide('fixel.jspaint.Scene');
goog.provide('fixel.jspaint.SceneDiff');

goog.require('fixel.rectangle.Rectangle');
goog.require('fixel.mask.Mask');
goog.require('fixel.color.Color');

goog.scope(function() {
var Mask = fixel.mask.Mask;
var Color = fixel.color.Color;
var Rectangle = fixel.rectangle.Rectangle;



/**
 * @typedef {{
 *   mask: Mask,
 *   texture: function(number, number): Color
 *   boundingBox: Rectangle
 * }}
 */
fixel.jspaint.Layer;
var Layer = fixel.jspaint.Layer;




/**
 * @typedef {{
 *   layers: Array<Layer>
 * }}
 */
fixel.jspaint.Scene;



/**
 * @typedef {{
 *   layer_id: number,
 *   mask: Mask
 * }}
 */
fixel.jspaint.SceneDiff;

}); //  goog.scope