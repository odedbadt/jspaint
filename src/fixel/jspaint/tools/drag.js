goog.provide('fixel.jspaint.tools.Drag');

goog.require('fixel.color');
goog.require('fixel.color.Color');
goog.require('fixel.point');
goog.require('fixel.point.Point');
goog.require('fixel.mask');
goog.require('fixel.mask.Mask');
goog.require('fixel.jspaint.Tool');

goog.scope(function() {
var Color = fixel.color.Color;
var Mask = fixel.mask.Mask;
var Point = fixel.point.Point;
var Tool = fixel.jspaint.Tool;
var mask = fixel.mask;
var color = fixel.color;
var point = fixel.point;
var scene = fixel.jspaint.scene;




/**
 * @typedef {(null|{ 
 *   cursorPositionOnStart: ?Point,
 *   offset: ?Point,
 *   dirty: boolean
 * })}
 */
fixel.jspaint.tools.DragState;
var DragState = fixel.jspaint.tools.DragState;
 

/**
 * @param {Mask} cursor
 * @param {Point} initialPosition
 * @constructor
 * @extends {Tool<DragState>}
 */
fixel.jspaint.tools.Drag = function(cursor, initialPosition) {
  /** @private {Mask} */
  this.cursor_ = cursor;
  this.initialPosition_ = initialPosition;
};
var Drag = fixel.jspaint.tools.Drag;


/** @const {!Array<!Color>} */
Drag.COLORS_ = [
  color.create(0, 0, 255),
  color.create(0, 255, 0),
  color.create(255, 0, 255),
  color.create(255, 255, 0),
  color.create(0, 255, 255)
];


/** @override */
Drag.prototype.enter = function(scene) {
    return {offset: null, position: this.initialPosition_, dirty: true};
};


/** @override */
Drag.prototype.startStroke = function(scene, toolState, position) {
  if (mask.contains(position, this.cursor_, toolState.position)) {
    return {offset: point.minus(toolState.position, position), position: toolState.position, dirty: true, drawnPosition: null};
  } else {
    return {offset: null, position: toolState.position, drawnPosition: null};
  }
};


/** @override */
Drag.prototype.strokePoint = function(scene, toolState, position) {
  if (!toolState.offset) {
    return {offset: null, position: toolState.position, drawnPosition: null};  
  }
  return {
    offset: toolState.offset,
    position: point.plus(position, toolState.offset),
    drawnPosition: toolState.drawnPosition,
    dirty: true
  };
};


/** @override */
Drag.prototype.endStroke = function(scene, toolState, position) {
  var strokePoints = toolState.strokePoints;
  return {
    offset: null,
    position: toolState.position,
    drawnPosition: toolState.drawnPosition,
    dirty: true
  };
};


/** @override */
Drag.prototype.exit = function(scene, toolState) {
  return toolState;
};


/** @override */
Drag.prototype.apply = function(scene, toolState) {
  if (!toolState || !toolState.dirty) {
    return null
  }
  var newMask = mask.merge(null, this.cursor_, toolState.position);
  var diff = mask.merge(newMask, this.cursor_, toolState.drawnPosition);
  return {
    scene: {
      layers:[
        {
          mask: mask.fromRectangle(scene.boundingBox),
          texture: function(x, y) { return color.create(255, 255, 255);}
        },
        {
          mask: newMask,
          texture: function(x, y) { return Drag.COLORS_[1];}
        }
      ],
      boundingBox: scene.boundingBox
    },
    diff: diff,
    toolState: {
      offset: toolState.offset,
      position: toolState.position,
      drawnPosition: toolState.position,
      dirty: false
    }
  };
};

}); //  goog.scope
