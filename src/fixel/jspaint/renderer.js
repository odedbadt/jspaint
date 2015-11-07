goog.provide('fixel.jspaint.renderer');
goog.provide('fixel.jspaint.Context2dLike');

goog.require('fixel.mask.Mask');
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
 * @param {Mask} diff
 * @param {{getImageData:function(number, number, number, number): Context2dLike,
 *          putImageData:function(Context2dLike, number, number)}} writableContext
 */
fixel.jspaint.renderer.renderScene = function(scene, diff, writableContext) {
  if (!diff || ! scene.boundingBox) {
    return;
  }
  diffBoundingBox = diff.boundingBox;
  var width = fixel.rectangle.width(diffBoundingBox);
  var height = fixel.rectangle.height(diffBoundingBox);
  var imageData = writableContext.getImageData(diffBoundingBox.fromX, diffBoundingBox.fromY, width, height);

  var offsetX = diffBoundingBox.fromX - scene.boundingBox.fromX;
  var offsetY = diffBoundingBox.fromY - scene.boundingBox.fromY;
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
          var texture = layer.texture;
          if (!texture) {
            return;
          }
          var color = texture(x, Number(y));
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