goog.provide('fixel.jspaint.tools.Freeform');

goog.require('fixel.Color');
goog.require('fixel.Point');
goog.require('fixel.mask');
goog.require('fixel.mask.Mask');
goog.require('fixel.jspaint.Tool');

goog.scope(function() {
var Color = fixel.Color;
var Mask = fixel.mask.Mask;
var Point = fixel.Point;
var Tool = fixel.jspaint.Tool;
var mask = fixel.mask;
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
fixel.jspaint.tools.FreeformState;
var FreeformState = fixel.jspaint.tools.FreeformState;
 

/**
 * @param {Mask} cursor
 * @constructor
 * @extends {Tool<FreeformState>}
 */
fixel.jspaint.tools.Freeform = function(cursor) {
  /** @private {Mask} */
  this.cursor_ = cursor
};
var Freeform = fixel.jspaint.tools.Freeform;


/** @const {!Array<!Color>} */
Freeform.COLORS_ = [
  {r:0, g:0, b:255},
  {r:0, g:255, b:0},
  {r:255, g:0, b:255},
  {r:255, g:255, b:0},
  {r:0, g:255, b:255}
];


/** @override */
Freeform.prototype.enter = function(scene) {
  return null;
};


/** @override */
Freeform.prototype.startStroke = function(scene, toolState, position) {
  return {strokePoints: [position], lastDrawnPoint: null, mask: null, dirty: true, staged: null};
};


/** @override */
Freeform.prototype.strokePoint = function(scene, toolState, position) {
  var strokePoints = toolState.strokePoints;
  strokePoints.push(position); // TODO: consider copying (or replacing with linked list)
  return {strokePoints: strokePoints, lastDrawnPoint: toolState.lastDrawnPoint, mask: toolState.mask, dirty: true, staged: null};
};


/** @override */
Freeform.prototype.endStroke = function(scene, toolState, position) {
  var strokePoints = toolState.strokePoints;
  strokePoints.push(position); // TODO: consider copying (or replacing with linked list)
  return {strokePoints: [], lastDrawnPoint: null, mask: null, staged: toolState.mask, dirty: true};
};


/** @override */
Freeform.prototype.exit = function(scene, toolState) {
  return toolState;
};


/** @override */
Freeform.prototype.apply = function(scene, toolState) {
  if (!toolState.dirty) {
    return null
  }
  var clippedMaskWithStaging;
  var boundingBox;
  var movementLinesMask = Freeform.drawMovementLines_(toolState.lastDrawnPoint, toolState.strokePoints, this.cursor_);
  var newBaseLayerMask = scene.layers ? 
    fixel.mask.merge(scene.layers[0].mask, toolState.staged) : null
  var diffBoundingBox = toolState.staged ? newBaseLayerMask.boundingBox :
      movementLinesMask && movementLinesMask.boundingBox;
  var newNewToolStateMask = fixel.mask.merge(toolState.mask, movementLinesMask);
  return {
    scene: {
      layers:[
        {
          mask: newBaseLayerMask,
          color: Freeform.COLORS_[0]
        },
        {
          mask: newNewToolStateMask,
          color: Freeform.COLORS_[1]
        }
      ]
    },
    diff: diffBoundingBox,
    toolState: {
      strokePoints: [],
      lastDrawnPoint: toolState.strokePoints[toolState.strokePoints.length - 1] || null,
      mask: newNewToolStateMask,
      dirty: false
    }
  };
};


/**
 * @param {?Point} lastPoint
 * @param {!Array<!Point>} strokePoints
 * @return {Mask}
 * @private
 */
Freeform.drawMovementLines_ = function(lastPoint, strokePoints, cursor) {
  if (strokePoints.length == 0) {
    return null;
  } else {
    var result = null;
    lastPoint = lastPoint || strokePoints[0];
    for (var i = 0; i < strokePoints.length; ++i) {
      result = mask.merge(result, mask.line(
          cursor,
          lastPoint[0],
          lastPoint[1],
          strokePoints[i][0],
          strokePoints[i][1]));
      lastPoint = strokePoints[i];
    }
    return result;
  }
};

}); //  goog.scope
