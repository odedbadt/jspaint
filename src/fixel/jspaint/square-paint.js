goog.provide('fixel.jspaint.SquarePaint');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('fixel.shapes');
goog.require('fixel.jspaint.renderer');
goog.require('fixel.jspaint.tools.Freeform');


goog.scope(function() {
var Event = goog.events.Event;
var EventType = goog.events.EventType;
var Freeform = fixel.jspaint.tools.Freeform;
var SquarePaint = fixel.jspaint.SquarePaint;
var mask = fixel.mask;
var shapes = fixel.shapes;

/** @export */
SquarePaint.init = function() {
  var canvas = goog.dom.getElement('single-canvas');
  var scene = {mask: null, boundingBox: null}
  var tool = new Freeform(shapes.circle(10));
  var toolState = tool.enter(null);
  var state = {
    tool: tool,
    toolState: toolState,
    config: {
      canvas: canvas
    },
    scene: scene
  } 
  SquarePaint.state_ = state;
  var eventHandler = new goog.events.EventHandler();
  eventHandler.listen(canvas, EventType.MOUSEMOVE,
      goog.partial(SquarePaint.onMouseMove_, state));
  eventHandler.listen(document, EventType.MOUSEDOWN,
      goog.partial(SquarePaint.onMouseDown_, state));
  eventHandler.listen(document, EventType.MOUSEUP,
      goog.partial(SquarePaint.onMouseUp_, state));
  eventHandler.listen(document, EventType.MOUSEOVER,
      goog.partial(SquarePaint.onMouseOver_, state));
  eventHandler.listen(document, EventType.MOUSEOUT,
      goog.partial(SquarePaint.onMouseOut_, state));
  eventHandler.listen(canvas, EventType.TOUCHSTART, 
      goog.partial(SquarePaint.onTouchStart_, state));
  eventHandler.listen(canvas, EventType.TOUCHMOVE, 
      goog.partial(SquarePaint.onTouchMove_, state));
  eventHandler.listen(canvas, EventType.TOUCHEND, 
      goog.partial(SquarePaint.onTouchEnd_, state));
  eventHandler.listen(document, EventType.KEYPRESS, 
      goog.partial(SquarePaint.onKeyPress_, state));
  SquarePaint.renderLoop_(state);
};


SquarePaint.COLORS_ = [
  {r:0, g:0, b:255},
  {r:0, g:255, b:0},
  {r:255, g:0, b:255},
  {r:255, g:255, b:0},
  {r:0, g:255, b:255}
]
/**
 * @type {function(function(Object))}
 * @private
 */
SquarePaint.requestAnimFrame_ = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


/**
 * @param {Object} state
 * @private
 */
SquarePaint.renderLoop_ = function(state) {
  var requestAnimationFrame = SquarePaint.requestAnimFrame_;
  requestAnimationFrame(goog.partial(SquarePaint.renderLoop_, state));
  SquarePaint.draw_(state);
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseDown_ = function(state, e) {
  state.isMouseDown = true;
  if (e.target != state.config.canvas) {
    return;
  }
  var position = [e.offsetX, e.offsetY];
  state.toolState = state.tool.startStroke(state.scene, state.toolState, position);
  //state.staging = mask.merge(null, state.cursor, e.offsetX, e.offsetY);
  //state.diff = state.staging;
  //state.movements = [];
  //state.lastPoint = [e.offsetX, e.offsetY];
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseMove_ = function(state, e) {
  var position = [e.offsetX, e.offsetY];
  if (e.getBrowserEvent().buttons) {
    if (!state.isMouseDown) {
      state.toolState = state.tool.startStroke(state.scene, state.toolState, position);
    }
    state.isMouseDown = true;
    state.toolState = state.tool.strokePoint(state.scene, state.toolState, position);
    //state.movements.push(position);
  //  state.freshPoint = [e.offsetX, e.offsetY];
  } else if (state.isMouseDown) {
    state.isMouseDown = false;
    state.toolState = state.tool.endStroke(state.scene, state.toolState, position);
  }
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseUp_ = function(state, e) {
  state.isMouseDown = false;
  state.toolState = state.tool.endStroke(state.scene, state.toolState, location);
/*  state.mousedown = false;
  state.diff = state.staging;
  state.mask = mask.merge(state.mask, state.staging);
  state.staging = null;
  state.movements = [];*/
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onKeyPress_ = function(state, e) {
  /*state.colorIndex += 1;
  state.colorIndex = state.colorIndex % SquarePaint.COLORS_.length;*/
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseOver_ = function(state, e) {
  /*state.mousedown = true;
  if (e.target != state.canvas) {
    return;
  }*/
  /*var offsetX = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
  var offsetY = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;
  state.staging = mask.merge(null, state.cursor, e.offsetX - offsetX, e.offsetY - offsetY);
  state.diff = state.staging;
  state.movements = [e.offsetX, e.offsetY];*/
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseOut_ = function(state, e) {
  /*state.mousedown = false;
  state.mask = mask.merge(state.mask, state.staging);
  state.diff = state.staging;
//  state.staging = null;
//  state.lastPoint = null;
  state.movements = [];*/
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchStart_ = function(state, e) {
  e.preventDefault();
  /*state.movements = [];
  if (state.staging) {
    state.mask = mask.merge(state.mask, state.staging);
  }
  var touches = e.getBrowserEvent().touches;
  var newStaging = state.staging;
  if (touches.length > 1) {
    return;
  }
  for (var i = 0; i < touches.length; ++i) {
    var touch = touches[i];
    var centerX = Math.floor(touch.clientX);
    var centerY = Math.floor(touch.clientY);

    state.movements = [[centerX, centerY]];
    /*state.lastPoint = [centerX, centerY];
    state.freshPoint = [centerX, centerY];
  }
  state.staging = newStaging;
  state.diff = state.staging;*/
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchMove_ = function(state, e) {
  /*var p = [Math.round(e.getBrowserEvent().touches[0].clientX),
      Math.round(e.getBrowserEvent().touches[0].clientY)];
  state.movements.push(p);*/
  //state.lastPoint = p;
  //state.freshPoint = p;
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchEnd_ = function(state, e) {
  e.preventDefault();
  /*state.mousedown = false;
  state.mask[state.colorIndex] = mask.merge(state.mask[state.colorIndex], state.staging);
  state.staging = null;
  state.diff = state.staging;*/
};


/**
 * @param {Object} state
 */
SquarePaint.draw_ = function(state) {  
  var result = state.tool.apply(state.scene, state.toolState);
  if (!result) {
    return;
  }
  state.scene = result.scene;
  state.toolState = result.toolState;
  var context = state.config.canvas.getContext('2d');
  fixel.jspaint.renderer.renderScene(result.scene, result.diff, fixel.rectangle.create(0, 0, 1600, 600), context);
/*  if (state.diff) {

  }
  var clippedMaskWithStaging;
  var boundingBox;
  /*if (!state.movements || state.movements.length  == 0) {
    return;
  }
  var movementLinesMask = SquarePaint.drawMovementLines_(state);
  state.lastPoint = state.movements && state.movements[state.movements.length - 1];
  state.movements = [];
  /*if (!movementLinesMask) {
    return;    
  }
  boundingBox = movementLinesMask && movementLinesMask.boundingBox;
  var stagingWithLines = mask.merge(state.staging, movementLinesMask);
  var maskWithStaging = mask.merge(state.mask, stagingWithLines);
  clippedMaskWithStaging = mask.clip(maskWithStaging, boundingBox);
  state.staging = stagingWithLines;
  state.idx = ((state.idx || 0) + 1) % SquarePaint.COLORS_.length;
  var newScene = {layers:[
    {
      mask: state.mask,
      color: SquarePaint.COLORS_[state.idx]
    },
    {
      mask: stagingWithLines,
      color: SquarePaint.COLORS_[1]
    }
  ]};*/
};

});