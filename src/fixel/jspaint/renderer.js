goog.provide('fixel.jspaint.renderer');
goog.provide('fixel.jspaint.Context2dLike');

goog.require('fixel.jspaint.Scene');
goog.require('fixel.rectangle.Rectangle');

goog.scope(function(){
var Mask = fixel.mask.Mask;
var Rectangle = fixel.rectangle.Rectangle;
var Scene = fixel.jspaint.Scene;
var SceneDiff = fixel.jspaint.SceneDiff;

/**
 * @typedef {{data: !Array<number>}}
 */
fixel.jspaint.Context2dLike;
var Context2dLike = fixel.jspaint.Context2dLike;


/**
 * @param {!Scene} scene
 * @param {Rectangle} diffBoundingBox
 * @param {Rectangle} boundingBox
 * @param {{createImageData:function(number, number): Context2dLike,
 *          putImageData:function(Context2dLike, number, number)}} writableContext
 */
fixel.jspaint.renderer.renderScene = function(scene, diffBoundingBox, boundingBox, writableContext) {
  if (!diffBoundingBox || ! boundingBox) {
    return;
  }
  /*var sceneBoundingBox = null;
  goog.array.forEach(scene.layers, function(layer) {
    sceneBoundingBox = fixel.rectangle.boundingRect(sceneBoundingBox, layer.mask && layer.mask.boundingBox);
  });
  if (!sceneBoundingBox) {
    return;
  }*/
  var width = fixel.rectangle.width(diffBoundingBox);
  var height = fixel.rectangle.height(diffBoundingBox);
  var imageData = writableContext.createImageData(width, height);

  var offsetX = diffBoundingBox.fromX - boundingBox.fromX;
  var offsetY = diffBoundingBox.fromY - boundingBox.fromY;
  goog.array.forEach(scene.layers, function(layer, layerIndex) {
    if (!layer || !layer.mask) {
      return;
    }
    var clippedMask = fixel.mask.clip(layer.mask, diffBoundingBox)
    if (!clippedMask) {
      return;
    }
    var alternations = clippedMask.alternations;
    for (var y in alternations) {
      var yN = Number(y) - offsetY;
      var alternationsRow = alternations[Number(y)];
      for (var i = 0; i < alternationsRow.length; i += 2) {
        for (var x = alternationsRow[i]; x < alternationsRow[i + 1]; ++x) {
          var xN = x - offsetX;
          var n = (width * yN + xN) * 4;
          var color = layer.color;
          imageData.data[n] = color.r;
          imageData.data[n + 1] = color.g;
          imageData.data[n + 2] = color.b;
          imageData.data[n + 3] = 255;
        }
      }      
    }
  });
  writableContext.putImageData(imageData,
      diffBoundingBox.fromX, diffBoundingBox.fromY);
};

});  // goog.scope