goog.provide('fixel.jspaint.tools.Line');

goog.require('fixel.color.Color');
goog.require('fixel.point.Point');
goog.require('fixel.mask');
goog.require('fixel.rectangle');
goog.require('fixel.mask.Mask');
goog.require('fixel.jspaint.Tool');

goog.scope(function() {
var Color = fixel.color.Color;
var Mask = fixel.mask.Mask;
var Point = fixel.point.Point;
var Tool = fixel.jspaint.Tool;
var mask = fixel.mask;
var rectangle = fixel.rectangle;
var scene = fixel.jspaint.scene;



/**
 * @typedef {(null|{ 
 *   strokePoints: !Array<!Point>,
 *   lastDrawnPoint: ?Point,
 *   mask: Mask,
 *   staged: Mask,
 *   dirty: boolean
 * })}
 */
fixel.jspaint.tools.LineState;
var LineState = fixel.jspaint.tools.LineState;
 

/**
 * @param {Mask} cursor
 * @constructor
 * @extends {Tool<LineState>}
 */
fixel.jspaint.tools.Line = function(cursor) {
  /** @private {Mask} */
  this.cursor_ = cursor
};
var Line = fixel.jspaint.tools.Line;


/** @const {!Array<!Color>} */
Line.COLORS_ = [
  {r:0, g:0, b:255},
  {r:0, g:255, b:0},
  {r:255, g:0, b:255},
  {r:255, g:255, b:0},
  {r:0, g:255, b:255}
];


/** @override */
Line.prototype.enter = function(scene) {
  return null;
};


/** @override */
Line.prototype.startStroke = function(scene, toolState, position) {
  return {diff: null, strokePoints: [position], startPoint: position, endPoint: position, mask: null, dirty: true, staged: null};
};


/** @override */
Line.prototype.strokePoint = function(scene, toolState, position) {
  var strokePoints = toolState.strokePoints;
  strokePoints.push(position); // TODO: consider copying (or replacing with linked list)
  return {diff: scene.diff, strokePoints: strokePoints, startPoint: toolState.startPoint, endPoint: position, mask: toolState.mask, dirty: true, staged: null};
};


/** @override */
Line.prototype.endStroke = function(scene, toolState, position) {
  var strokePoints = toolState.strokePoints;
  strokePoints.push(position); // TODO: consider copying (or replacing with linked list)
  return {strokePoints: [], startPoint: toolState.startPoint, endPoint: position, mask: null, staged: toolState.mask, dirty: true};
};


/** @override */
Line.prototype.exit = function(scene, toolState) {
  return toolState;
};


/** @override */
Line.prototype.apply = function(scene, toolState) {
  if (!toolState || !toolState.dirty) {
    return null
  }
  var clippedMaskWithStaging;
  var boundingBox;
  var newBaseLayerMask = scene.layers ? 
      fixel.mask.merge(scene.layers[0].mask, toolState.staged) : null;
  var newToolStateMask = fixel.mask.line(this.cursor_, toolState.startPoint, toolState.endPoint);
  var diff = mask.merge(newBaseLayerMask,
    mask.merge(toolState.mask, newToolStateMask));
  return {
    scene: {
      layers:[
        {
          mask: newBaseLayerMask,
          texture: function(x, y) { return Line.COLORS_[0];}
        },
        {
          mask: newToolStateMask,
          texture: function(x, y) { return Line.COLORS_[1]; }
        }
      ],
      boundingBox: scene.boundingBox      
    },
    diff: diff,
    toolState: {
      strokePoints: [],
      mask: newToolStateMask,
      startPoint: toolState.startPoint,
      endPoint: toolState.endPoint,
      dirty: false
    }
  };
};

}); //  goog.scope
