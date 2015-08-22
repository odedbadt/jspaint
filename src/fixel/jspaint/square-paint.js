goog.provide('fixel.jspaint.SquarePaint');

goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('fixel.mask.Mask');


goog.scope(function() {

var EventType = goog.events.EventType;
var SquarePaint = fixel.jspaint.SquarePaint;
var mask = fixel.mask;


SquarePaint.init = function() {
  var eventHandler = new goog.events.EventHandler();
  var cursor = SquarePaint.initCursor_(30);
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
  eventHandler.listen(canvas, EventType.MOUSEDOWN,
      goog.partial(SquarePaint.onMouseDown_, state));
  eventHandler.listen(canvas, EventType.MOUSEUP,
      goog.partial(SquarePaint.onMouseUp_, state));
  SquarePaint.renderLoop_(state);
};
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function() {
  SquarePaint.renderLoop_ = function(state) {
    requestAnimFrame(goog.partial(SquarePaint.renderLoop_, state));
    SquarePaint.draw_(state);
  }
})();


SquarePaint.onMouseDown_ = function(state, e) {
  state.mousedown = true;
  var offsetX = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
  var offsetY = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;
  state.staging = mask.merge(null, state.cursor, e.offsetX - offsetX, e.offsetY - offsetY);
  state.diff = state.staging;
};


SquarePaint.onMouseUp_ = function(state, e) {
  state.mousedown = false;
  state.mask = mask.merge(state.mask, state.staging);
  state.staging = null;
  state.diff = state.staging;
};


SquarePaint.onMouseMove_ = function(state, e) {
  if (state.mousedown) {
    state.staging = mask.merge(state.staging, state.cursor, e.offsetX, e.offsetY);
    state.diff = state.staging; // TODO(oded): clone
  }
};


SquarePaint.draw_ = function(state) {
  if (!state.diff) {
    return;
  }
  var boundingBox = state.diff.boundingBox;
  state.diff = null;
  var context = state.canvas.getContext('2d');
  var w = boundingBox.toX - boundingBox.fromX;
  var imageData = context.createImageData(
      w, boundingBox.toY - boundingBox.fromY);
  var maskWithStaging = mask.clip(mask.merge(state.mask, state.staging), state.staging.boundingBox);
  var alternations = maskWithStaging.alternations; 
  for (var y in alternations) {
    yN = Number(y) - boundingBox.fromY;
    for (var i = 0; i < alternations[y].length; i += 2) {
      for (var x = alternations[y][i] - boundingBox.fromX; 
          x < alternations[y][i + 1] - boundingBox.fromX; ++x) {
        imageData.data[(w * yN + x) * 4 + 0] = 0;
        imageData.data[(w * yN + x) * 4 + 1] = 0;
        imageData.data[(w * yN + x) * 4 + 2] = 0;
        imageData.data[(w * yN + x) * 4 + 3] = 255;
      }
    }
  }
  context.putImageData(imageData, boundingBox.fromX, boundingBox.fromY);
  if (!state.mask) {
    return;
  }
  /*
  {
    var context = state.canvasDbg.getContext('2d');
    var boundingBox = state.staging.boundingBox;
    var w = boundingBox.toX - boundingBox.fromX;
    var imageData = context.createImageData(
        w, boundingBox.toY - boundingBox.fromY);
    var alternations = state.staging.alternations; 
    for (var y in alternations) {
      yN = Number(y) - boundingBox.fromY;
      for (var i = 0; i < alternations[y].length; i += 2) {
        for (var x = alternations[y][i] - boundingBox.fromX; 
            x < alternations[y][i + 1] - boundingBox.fromX; ++x) {
          imageData.data[(w * yN + x) * 4 + 0] = 255;
          imageData.data[(w * yN + x) * 4 + 1] = 0;
          imageData.data[(w * yN + x) * 4 + 2] = 0;
          imageData.data[(w * yN + x) * 4 + 3] = 255;
        }
      }
    }
    context.fillRect(0, 0, 600, 600)
    context.putImageData(imageData, 0, 0);
  }*/


};

SquarePaint.initCursor_ = function(r) {
  var alternations = {};
  for (var y = -r; y <= r; ++y) {
    var x = Math.round(Math.sqrt(r * r - y * y));
    if (x > 0) {
      alternations[y] = [-x, x];
    }
  }
  return fixel.mask.create(alternations);
};

goog.exportSymbol('jspaint.SquarePaint', SquarePaint);

});