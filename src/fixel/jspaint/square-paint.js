goog.provide('jspaint.SquarePaint');

goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('mask');


goog.scope(function() {

var EventType = goog.events.EventType;
var SquarePaint = jspaint.SquarePaint;
SquarePaint.init = function() {
  var eventHandler = new goog.events.EventHandler();
  var cursor = SquarePaint.initCursor_(3);
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
  state.staging = mask.merge(null, state.cursor, e.offsetX, e.offsetY);
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
    var off    
    state.staging =
        mask.merge(state.staging, state.cursor, e.offsetX - , e.offsetY);
    state.diff = state.staging;
  }
};


SquarePaint.draw_ = function(state) {
  if (!state.diff) {
    return;
  }
  var boundingBox = state.diff.boundingBox;
  state.diff = null;
  var context = state.canvas.getContext('2d');
  var w = boundingBox.maxX - boundingBox.minX + 1;
  var imageData = context.createImageData(
      w, boundingBox.maxY - boundingBox.minY + 1);
  var maskWithStaging = mask.merge(state.mask, state.staging);
  var alternations = maskWithStaging.alternations; 
  for (var y in alternations) {
    yN = Number(y) - boundingBox.minY;
    for (var i = 0; i < alternations[y].length; i += 2) {
      for (var x = alternations[y][i] - boundingBox.minX; 
          x < alternations[y][i + 1] - boundingBox.minX; ++x) {
        imageData.data[(w * yN + x) * 4 + 0] = 0;
        imageData.data[(w * yN + x) * 4 + 1] = 0;
        imageData.data[(w * yN + x) * 4 + 2] = 0;
        imageData.data[(w * yN + x) * 4 + 3] = 255;
      }
    }
  }
  context.putImageData(imageData, boundingBox.minX, boundingBox.minY);
  if (!state.mask) {
    return;
  }
  {
    var context = state.canvasDbg.getContext('2d');
    var boundingBox = state.staging.boundingBox;
    var w = boundingBox.maxX - boundingBox.minX + 1;
    var imageData = context.createImageData(
        w, boundingBox.maxY - boundingBox.minY + 1);
    var alternations = state.staging.alternations; 
    for (var y in alternations) {
      yN = Number(y) - boundingBox.minY;
      for (var i = 0; i < alternations[y].length; i += 2) {
        for (var x = alternations[y][i] - boundingBox.minX; 
            x < alternations[y][i + 1] - boundingBox.minX; ++x) {
          imageData.data[(w * yN + x) * 4 + 0] = 255;
          imageData.data[(w * yN + x) * 4 + 1] = 0;
          imageData.data[(w * yN + x) * 4 + 2] = 0;
          imageData.data[(w * yN + x) * 4 + 3] = 255;
        }
      }
    }
    context.fillRect(0, 0, 600, 600)
    context.putImageData(imageData, 0, 0);
  }


};

SquarePaint.initCursor_ = function(r) {
  var alternations = {};
  for (var y = -r; y <= r; ++y) {
    var x = Math.round(Math.sqrt(r * r - y * y));
    if (x > 0) {
      alternations[y] = [-x, x];
    }
  }
  return mask.create(alternations);
};

goog.exportSymbol('jspaint.SquarePaint', SquarePaint);

});