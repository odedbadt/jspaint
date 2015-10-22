goog.provide('fixel.jspaint.Layer');
goog.provide('fixel.jspaint.Scene');
goog.provide('fixel.jspaint.SceneDiff');

goog.require('fixel.mask.Mask');
goog.require('fixel.Color');

goog.scope(function() {
var Mask = fixel.mask.Mask;
var Color = fixel.Color;



/**
 * @typedef {{
 *   mask: Mask,
 *   color: Color
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