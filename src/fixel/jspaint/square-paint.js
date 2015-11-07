goog.provide('fixel.jspaint.SquarePaint');
  
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('fixel.shapes');
goog.require('fixel.point');
goog.require('fixel.rectangle');
goog.require('fixel.jspaint.renderer');
goog.require('fixel.jspaint.tools.Drag');
goog.require('fixel.jspaint.tools.Line');
goog.require('fixel.jspaint.tools.Freeform');


goog.scope(function() {
var Event = goog.events.Event;
var EventType = goog.events.EventType;
var SquarePaint = fixel.jspaint.SquarePaint;
var mask = fixel.mask;
var point = fixel.point;
var rectangle = fixel.rectangle;
var shapes = fixel.shapes;

/** @export */
SquarePaint.init = function() {

  SquarePaint.resetState_();
  var eventHandler = new goog.events.EventHandler();
  var state = SquarePaint.state_;
  SquarePaint.setCanvasSize_(state);
  var canvas = state.config.canvas;
  eventHandler.listen(window, EventType.RESIZE,
      goog.partial(SquarePaint.setCanvasSize_, state));
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


SquarePaint.resetState_ = function() {
  var canvas = goog.dom.getElement('single-canvas');
  var scene = {mask: null, boundingBox: null}
  var tool = new fixel.jspaint.tools.Drag(shapes.star(10), point.create(100, 100));
  var toolState = tool.enter(null);
  SquarePaint.state_ = {
    tool: tool,
    toolState: toolState,
    config: {
      canvas: canvas
    },
    scene: scene
  };
};


/**
 * @param {Object} state
 * @private
 */
SquarePaint.setCanvasSize_ = function(state) {
  SquarePaint.resetState_();
  var viewPortSize = goog.dom.getViewportSize();
  var w = viewPortSize.width;
  var h = viewPortSize.height;
  state.config.canvas.width = w;
  state.config.canvas.height = h;
  state.config.boundingBox = rectangle.create(0, 0, w, h);
};


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
  var position = point.create(e.offsetX, e.offsetY);
  state.toolState = state.tool.startStroke(state.scene, state.toolState, position);
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseMove_ = function(state, e) {
  var position = point.create(e.offsetX, e.offsetY);
  if (e.getBrowserEvent().buttons) {
    if (!state.isMouseDown) {
      state.toolState = state.tool.startStroke(state.scene, state.toolState, position);
    }
    state.isMouseDown = true;
    state.toolState = state.tool.strokePoint(state.scene, state.toolState, position);
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
  var position = point.create(e.offsetX, e.offsetY);
  state.toolState = state.tool.endStroke(state.scene, state.toolState, position);
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onKeyPress_ = function(state, e) {
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseOver_ = function(state, e) {
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseOut_ = function(state, e) {
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchStart_ = function(state, e) {
  e.preventDefault();
  var touches = e.getBrowserEvent()['touches'];
  var touch = touches[0];
  var centerX = Math.floor(touch['clientX']);
  var centerY = Math.floor(touch['clientY']);
  var position = [centerX, centerY];
  state.toolState = state.tool.startStroke(state.scene, state.toolState, position);
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchMove_ = function(state, e) {
  var touches = e.getBrowserEvent()['touches'];
  var touch = touches[0];
  var centerX = Math.floor(touch['clientX']);
  var centerY = Math.floor(touch['clientY']);
  var position = [centerX, centerY];
  state.toolState = state.tool.strokePoint(state.scene, state.toolState, position);
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchEnd_ = function(state, e) {
  e.preventDefault();
  state.toolState = state.tool.endStroke(state.scene, state.toolState, null);
};


/**
 * @param {Object} state
 */
SquarePaint.draw_ = function(state) {  
  state.scene.boundingBox = state.config.boundingBox;
  var result = state.tool.apply(state.scene, state.toolState);
  if (!result) {
    return;
  }
  state.scene = result.scene;
  state.toolState = result.toolState;
  var context = state.config.canvas.getContext('2d');
  fixel.jspaint.renderer.renderScene(state.scene, result.diff, context);
};

});