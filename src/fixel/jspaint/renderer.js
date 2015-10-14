goog.provide('fixel.jspaint.renderer');

goog.require('fixel.rectangle.Rectangle');
goog.require('fixel.jspaint.Scene');
goog.require('fixel.jspaint.SceneDiff');

goog.scope(function(){
var Rectangle = fixel.rectangle.Rectangle;
var Scene = fixel.jspaint.Scene;
var SceneDiff = fixel.jspaint.SceneDiff;


/**
 * @param {!Scene} scene
 * @param {Rectangle} boundingBox
 * @param {{createImageData:function(number, number): !Array<number>, putImageData:function(Array<number, number, number)}} writableContext
 */
fixel.jspaint.renderer.renderScene = function(scene, boundingBox, writableContext) {
  if (!boundingBox) {
    return;
  }
  var sceneBoundingBox = null;
  goog.array.forEach(scene.layers, function(layer) {
    sceneBoundingBox = fixel.rectangle.boundingRect(sceneBoundingBox, layer.mask && layer.mask.boundingBox);
  });
  if (!sceneBoundingBox) {
    return;
  }
  var width = fixel.rectangle.width(sceneBoundingBox);
  var height = fixel.rectangle.height(sceneBoundingBox);
  var imageData = writableContext.createImageData(width, height);

  var offsetX = sceneBoundingBox.fromX - boundingBox.fromX;
  var offsetY = sceneBoundingBox.fromY - boundingBox.fromY;
  goog.array.forEach(scene.layers, function(layer, layerIndex) {
    if (!layer || ! layer.mask) {
      return;
    }
    var mask = layer.mask;
    var alternations = mask.alternations;
    var color = layer.color;
    for (var y in alternations) {
      var yN = Number(y) - offsetY;
      var alternationsRow = alternations[Number(y)];
      for (var i = 0; i < alternationsRow.length; i += 2) {
        for (var x = alternationsRow[i]; x < alternationsRow[i + 1]; ++x) {
          var xN = x - offsetX;          
          var n = (width * yN + xN) * 4
          imageData.data[n] = color.r;
          imageData.data[n + 1] = color.g;
          imageData.data[n + 2] = color.b;
          imageData.data[n + 3] = 255;
        }
      }
    }
  });
  writableContext.putImageData(imageData,
      sceneBoundingBox.fromX, sceneBoundingBox.fromY);
};

});  // goog.scope