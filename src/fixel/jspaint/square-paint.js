goog.provide('fixel.jspaint.SquarePaint');

goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('fixel.mask.Mask');
goog.require('fixel.shapes');


goog.scope(function() {

var EventType = goog.events.EventType;
var SquarePaint = fixel.jspaint.SquarePaint;
var mask = fixel.mask;
var shapes = fixel.shapes;

SquarePaint.objToString = function(obj) {
  var b = [];
  for (var prop in obj) {
    if (!obj[prop]) {
      continue;
    }
    if (typeof(obj[prop]) == 'function') {
      continue;
    }
    b.push(prop + ' : ' + obj[prop]);
  }
  return(b.join('\n\t'))
};

SquarePaint.log_ts_ = [];
SquarePaint.log_ = function(msg) {
  SquarePaint.log_ts_.push([msg, (new Date()).getTime()])
}
SquarePaint.dumpLog = function() {
  console.log(SquarePaint.log_ts_);
}


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
    window.requestAnimFrame(goog.partial(SquarePaint.renderLoop_, state));
    SquarePaint.draw_(state);
  }
})();


SquarePaint.onMouseDown_ = function(state, e) {
  /*if (state.staging) {
      state.mask = mask.merge(state.mask, state.staging);
      state.diff = state.staging;
  }*/
  state.mousedown = true;
  if (e.target != state.canvas) {
    return;
  }
  var offsetX = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
  var offsetY = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;
  state.staging = mask.merge(null, state.cursor, e.offsetX - offsetX, e.offsetY - offsetY);
  state.diff = mask.merge(state.diff, state.staging);
  state.movements = [];
};


SquarePaint.onMouseMove_ = function(state, e) {
  if (e.getBrowserEvent().buttons) {
    state.movements.push([e.offsetX, e.offsetY]);
  }
};


SquarePaint.onMouseUp_ = function(state, e) {
  state.mousedown = false;
  state.mask = mask.merge(state.mask, state.staging);
  state.staging = null;
  state.lastPoint = null;
  state.diff = state.staging;
};


SquarePaint.onMouseOver_ = function(state, e) {
  console.log(e.getBrowserEvent().button)
  state.mousedown = true;
  if (e.target != state.canvas) {
    return;
  }
  var offsetX = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
  var offsetY = state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;
  state.staging = mask.merge(null, state.cursor, e.offsetX - offsetX, e.offsetY - offsetY);
  state.diff = mask.merge(state.diff, state.staging);
  state.movements = [];
};


SquarePaint.onMouseOut_ = function(state, e) {
  state.mousedown = false;
  state.mask = mask.merge(state.mask, state.staging);
  state.diff = state.staging;
  state.staging = null;
};


SquarePaint.onTouchStart_ = function(state, e) {
  e.preventDefault();
  state.movements = [];
  if (state.staging) {
    state.mask = mask.merge(state.mask, state.staging);
  }
  var touches = e.getBrowserEvent().touches;
  var newStaging = state.staging;
  for (var i = 0; i < touches.length; ++i) {
    var touch = touches[i];
    var cursor = state.cursor;
    var offsetX = 0;//state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
    var offsetY = 0;//state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;      
    var centerX = Math.floor(touch.clientX + touch.radiusX / 2);
    var centerY = Math.floor(touch.clientY + touch.radiusY / 2);

    newStaging = mask.merge(newStaging, cursor, centerX - offsetX, centerY - offsetY);
    state.cursor = cursor;
  }
  state.staging = newStaging;
  state.diff = state.staging;
};


SquarePaint.onTouchMove_ = function(state, e) {
  state.movements.push([Math.round(e.getBrowserEvent().touches[0].clientX), Math.round(e.getBrowserEvent().touches[0].clientY)]);
  return;

  e.preventDefault();
  var touches = e.getBrowserEvent().touches;
  var newStaging = state.staging;
  for (var i = 0; i < touches.length; ++i) {
    var touch = touches[i];
    var offsetX = 0;//state.staging && state.staging.boundingBox && state.staging.boundingBox.fromX || 0;
    var offsetY = 0;//state.staging && state.staging.boundingBox && state.staging.boundingBox.fromY || 0;      
    var centerX = touch.clientX;
    var centerY = touch.clientY;

    newStaging = mask.merge(newStaging, state.cursor, centerX - offsetX, centerY - offsetY); 
  }
  state.staging = newStaging;
  state.diff = state.staging;
};


SquarePaint.onTouchEnd_ = function(state, e) {
  e.preventDefault();
  state.mousedown = false;
  state.mask = mask.merge(state.mask, state.staging);
  state.staging = null;
  state.diff = state.staging;
};


SquarePaint.draw_ = function(state) {
  if (!state.movements || state.movements.length  == 0) {
    return;    
  }
  state.lastPoint = state.lastPoint || state.movements[0];
  state.staging = mask.merge(state.staging, mask.line(state.cursor,
    state.lastPoint[0][0], state.lastPoint[0][1],
    state.movements[0][0], state.movements[0][1]));
  if (state.movements.length  == 1) {
    state.staging = mask.merge(state.staging, state.cursor, state.movements[0][0], state.movements[0][1]);
    state.lastPoint = state.movements[0];
  } else {
    for (var i = 1; i < state.movements.length; ++i) {
      state.staging = mask.merge(state.staging, mask.line(state.cursor,
          state.movements[i - 1][0], state.movements[i - 1][1],
          state.movements[i][0], state.movements[i][1]));
      state.lastPoint = state.movements[i];
    }
  }
  state.diff = state.staging;
  state.movements = [];
  if (!state.diff) {
    return;    
  }
  var boundingBox = state.diff.boundingBox;
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
};
goog.exportSymbol('fixel.jspaint.SquarePaint', fixel.jspaint.SquarePaint);
goog.exportSymbol('fixel.jspaint.SquarePaint.init', fixel.jspaint.SquarePaint.init);
goog.exportSymbol('fixel.jspaint.SquarePaint.dumpLog', SquarePaint.dumpLog);

});