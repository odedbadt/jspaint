goog.provide('fixel.jspaint.Tool');

goog.require('fixel.jspaint.Scene');
goog.require('fixel.point.Point');
goog.require('fixel.mask.Mask');

goog.scope(function(){
var Point = fixel.point.Point;
var Mask = fixel.mask.Mask;
var Scene = fixel.jspaint.Scene;


/**
 * @template ToolState
 * @constructor
 */
fixel.jspaint.Tool = function() {

};
var Tool = fixel.jspaint.Tool;

/**
 * @param {?Scene} scene;
 * @return {ToolState}
 */
Tool.prototype.enter = goog.abstractMethod;

/**
 * @param {?Scene} scene;
 * @param {ToolState} toolState;
 * @param {Point} location;
 * @return {ToolState}
 */
Tool.prototype.startStroke = goog.abstractMethod;

/**
 * @param {?Scene} scene;
 * @param {ToolState} toolState;
 * @param {Point} location;
 * @return {ToolState}
 */
Tool.prototype.strokePoint = goog.abstractMethod;

/**
 * @param {?Scene} scene;
 * @param {ToolState} toolState;
 * @param {Point} location;
 * @return {ToolState}
 */
Tool.prototype.endStroke = goog.abstractMethod;


/**
 * @param {?Scene} scene;
 * @param {ToolState} toolState;
 * @return {ToolState}
 */
Tool.prototype.exit = goog.abstractMethod;


/**
 * @param {?Scene} scene;
 * @param {ToolState} toolState;
 * @return {(null|{scene: Scene, diff: Mask, toolState: ToolState})}
 */
Tool.prototype.apply = goog.abstractMethod;

});