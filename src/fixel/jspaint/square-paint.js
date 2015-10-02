goog.provide('fixel.jspaint.SquarePaint');

goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('fixel.shapes');


goog.scope(function() {
var Event = goog.events.Event;
var EventType = goog.events.EventType;
var SquarePaint = fixel.jspaint.SquarePaint;
var mask = fixel.mask;
var shapes = fixel.shapes;

SquarePaint.init = function() {
  var eventHandler = new goog.events.EventHandler();
  var cursor = shapes.circle(10);
  var canvas = goog.dom.getElement('single-canvas');
  var canvasDbg = goog.dom.getElement('dbg-canvas');
  var state = {
    cursor: cursor,
    eventHandler: eventHandler,
    canvas: canvas,
    canvasDbg: canvasDbg,
    mask: mask.empty()
  } 
  SquarePaint.state_ = state;
  eventHandler.listen(canvas, EventType.MOUSEMOVE,
      goog.partial(SquarePaint.onMouseMove_, state));
  eventHandler.listen(document, EventType.MOUSEDOWN,
      goog.partial(SquarePaint.onMouseDown_, state));
  eventHandler.listen(document, EventType.MOUSEUP,
      goog.partial(SquarePaint.onMouseUp_, state));
  /*eventHandler.listen(document, EventType.MOUSEOVER,
      goog.partial(SquarePaint.onMouseOver_, state));
  eventHandler.listen(document, EventType.MOUSEOUT,
      goog.partial(SquarePaint.onMouseOut_, state));*/
  eventHandler.listen(canvas, EventType.TOUCHSTART, 
      goog.partial(SquarePaint.onTouchStart_, state));
  eventHandler.listen(canvas, EventType.TOUCHMOVE, 
      goog.partial(SquarePaint.onTouchMove_, state));
  eventHandler.listen(canvas, EventType.TOUCHEND, 
      goog.partial(SquarePaint.onTouchEnd_, state));
SquarePaint.renderLoop_(state);
};


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
  state.mousedown = true;
  if (e.target != state.canvas) {
    return;
  }
  var offsetX = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
  var offsetY = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;
  state.staging = mask.merge(null, state.cursor, e.offsetX - offsetX, e.offsetY - offsetY);
  state.diff = state.staging;
  state.movements = [[e.offsetX, e.offsetY]];
  state.lastPoint = [e.offsetX, e.offsetY];
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseMove_ = function(state, e) {
  if (e.getBrowserEvent().buttons) {
    state.movements.push([e.offsetX, e.offsetY]);
    state.freshPoint = [e.offsetX, e.offsetY];
  }
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseUp_ = function(state, e) {
  state.mousedown = false;
  state.diff = state.staging;
  state.mask = mask.merge(state.mask, state.staging);
  state.staging = null;
  state.lastPoint = null;
  state.movements = [];
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseOver_ = function(state, e) {
  console.log(e.getBrowserEvent().button)
  state.mousedown = true;
  if (e.target != state.canvas) {
    return;
  }
  var offsetX = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
  var offsetY = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;
  state.staging = mask.merge(null, state.cursor, e.offsetX - offsetX, e.offsetY - offsetY);
  state.diff = state.staging;
  state.movements = [e.offsetX, e.offsetY];
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onMouseOut_ = function(state, e) {
  state.mousedown = false;
  state.mask = mask.merge(state.mask, state.staging);
  state.diff = state.staging;
  state.staging = null;
  state.lastPoint = null;
  state.movements = [];
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchStart_ = function(state, e) {
  e.preventDefault();
  state.movements = [];
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
    state.lastPoint = [centerX, centerY];
    state.freshPoint = [centerX, centerY];
  }
  state.staging = newStaging;
  state.diff = state.staging;
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchMove_ = function(state, e) {
  var p = [Math.round(e.getBrowserEvent().touches[0].clientX),
      Math.round(e.getBrowserEvent().touches[0].clientY)];
  state.movements.push(p);
  state.lastPoint = p;
  state.freshPoint = p;
};


/**
 * @param {Object} state
 * @param {Event} e
 */
SquarePaint.onTouchEnd_ = function(state, e) {
  e.preventDefault();
  state.mousedown = false;
  state.mask = mask.merge(state.mask, state.staging);
  state.staging = null;
  state.diff = state.staging;
};


/**
 * @param {Object} state
 */
SquarePaint.draw_ = function(state) {
  var clippedMaskWithStaging;
  var boundingBox;
  if (state.freshPoint) {
    var stagingWithFreshPoint = mask.merge(
        state.staging, state.cursor, state.freshPoint[0], state.freshPoint[1]);
    boundingBox = stagingWithFreshPoint.boundingBox;
    var maskWithStaging = mask.merge(state.mask, stagingWithFreshPoint);
    state.freshPoint = null;
    clippedMaskWithStaging = mask.clip(maskWithStaging, boundingBox);
    state.staging = stagingWithFreshPoint;
} else {
    if (!state.movements || state.movements.length  == 0) {
      return;
    }
    var movementLinesMask = SquarePaint.drawMovementLines_(state);
    state.lastPoint = state.movements[state.movements.length - 1];
    state.movements = [];
    if (!movementLinesMask) {
      return;    
    }
    boundingBox = movementLinesMask.boundingBox;
    var stagingWithLines = mask.merge(state.staging, movementLinesMask);
    var maskWithStaging = mask.merge(state.mask, stagingWithLines);
    clippedMaskWithStaging = mask.clip(maskWithStaging, boundingBox);
    state.staging = stagingWithLines;
  }
  var context = state.canvas.getContext('2d');
  var w = boundingBox.toX - boundingBox.fromX;
  var imageData = context.createImageData(
      w, boundingBox.toY - boundingBox.fromY);
  var alternations = clippedMaskWithStaging.alternations; 
  for (var y in alternations) {
    var yN = Number(y) - boundingBox.fromY;
    var alternationsRow = alternations[Number(y)];
    for (var i = 0; i < alternationsRow.length; i += 2) {
      for (var x = alternationsRow[i] - boundingBox.fromX; 
          x < alternationsRow[i + 1] - boundingBox.fromX; ++x) {
        imageData.data[(w * yN + x) * 4 + 0] = 0;
        imageData.data[(w * yN + x) * 4 + 1] = 0;
        imageData.data[(w * yN + x) * 4 + 2] = 0;
        imageData.data[(w * yN + x) * 4 + 3] = 255;
      }
    }
  }
  context.putImageData(imageData, boundingBox.fromX, boundingBox.fromY);
};


/**
 * @param {Object} state
 */
SquarePaint.drawMovementLines_ = function(state) {
  var result = null;
  var prevPoint = state.lastPoint;
  if (!prevPoint) {
    prevPoint = state.movements[0];
  }
  for (var i = 0; i < state.movements.length; ++i) {
    result = mask.merge(result, mask.line(state.cursor,
        prevPoint[0], prevPoint[1],
        state.movements[i][0], state.movements[i][1]));
    prevPoint = state.movements[i];
    var x = 1000;
    for (var j = 0; j < 1000000; ++j) {
      x = x/2;
    }
  }
  return result;
};

goog.exportSymbol('fixel.jspaint.SquarePaint', fixel.jspaint.SquarePaint);
goog.exportSymbol('fixel.jspaint.SquarePaint.init', fixel.jspaint.SquarePaint.init);

});