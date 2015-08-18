goog.provide('mask');
goog.provide('mask.Rectangle');
goog.provide('mask.Mask');

goog.require('mask.MaskLine');
goog.require('mask.MaskLine.Alternations');

goog.scope(function() {
var Alternations = mask.MaskLine.Alternations;
var MaskLine = mask.MaskLine;



/**
 * @typedef {{minX: number, minY: number, maxX: number, maxY: number}}
 */
mask.Rectangle;
var Rectangle = mask.Rectangle;


/**
 * @typedef {{
 *   alternations: !Object<number, !Alternations>,
 *   boundingBox: Rectangle
 * }}
 */
mask.Mask;
var Mask = mask.Mask;


mask.merge = function(maskA, maskB, offsetX, offsetY) {
  if (!maskA && !maskB) {
    return null;
  }
  if (!maskA) {
    return mask.create(mask.mergeAlternations_({}, maskB.alternations, offsetX, offsetY));
  }
  if (!maskB) {
    return maskA;
  }
  return mask.create(mask.mergeAlternations_(maskA.alternations, maskB.alternations, offsetX, offsetY));
};

/** @private */
mask.mergeAlternations_ = function(alternationsA, alternationsB, offsetX, offsetY) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  var alternations = {};
  for (y in alternationsA) {
    alternations[y] = MaskLine.merge(alternationsA[y],
        alternationsB[Number(y) - offsetY], offsetX);
  }
  for (y in alternationsB) {
    alternations[Number(y) + offsetY] =
        MaskLine.merge(alternationsA[Number(y) + offsetY],
            alternationsB[y], offsetX);
  }
  return alternations;
};

mask.create = function(alternations, opt_boundingBox) {
  if (goog.object.isEmpty(alternations)) {
    return null;
  }  
  return {
    alternations: alternations,
    boundingBox : opt_boundingBox || mask.calculateBoundingBox_(alternations)
  }
};


mask.empty = function() {
  return mask.create({});
}


mask.calculateBoundingBox_ = function(alternations) {
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  for (var y in alternations) {
    if (Number(y) < minY) {
      minY = Number(y);
    }
    if (Number(y) > maxY) {
      maxY = Number(y);
    }
    if (alternations[y].length == 0) {
      return;
    }
    if (alternations[y][0] < minX) {
      minX = alternations[y][0];
    }
    if (alternations[y][alternations[y].length - 1] > maxX) {
      maxX = alternations[y][alternations[y].length - 1];
    }
  }
  return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
}

}); // goog.scope