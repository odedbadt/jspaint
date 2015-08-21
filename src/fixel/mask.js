goog.provide('fixel.mask.Mask');

goog.require('fixel.Rectangle');
goog.require('fixel.mask.MaskLine');
goog.require('fixel.mask.Alternations');

goog.scope(function() {
var Alternations = fixel.mask.Alternations;
var MaskLine = fixel.mask.MaskLine;
var Rectangle = fixel.Rectangle;


/**
 * @typedef {{
 *   alternations: !Object<number, !Alternations>,
 *   boundingBox: Rectangle
 * }}
 */
fixel.mask.Mask;
var mask = fixel.mask;
var Mask = fixel.mask.Mask;


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
    alternations[y] = mask.mergeMaskLine(alternationsA[y],
        alternationsB[Number(y) - offsetY], offsetX);
  }
  for (y in alternationsB) {
    alternations[Number(y) + offsetY] =
        mask.mergeMaskLine(alternationsA[Number(y) + offsetY],
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
};

/** @return {Rectangle} */
mask.calculateBoundingBox_ = function(alternations) {
  var fromX = Infinity;
  var fromY = Infinity;
  var toX = -Infinity;
  var toY = -Infinity;
  for (var y in alternations) {
    if (Number(y) < fromY) {
      fromY = Number(y);
    }
    if (Number(y) + 1 > toY) {
      toY = Number(y) + 1;
    }
    if (alternations[y].length == 0) {
      return;
    }
    if (alternations[y][0] < fromX) {
      fromX = alternations[y][0];
    }
    if (alternations[y][alternations[y].length - 1] > toX) {
      toX = alternations[y][alternations[y].length - 1];
    }
  }
  return fixel.createRectangle(fromX, fromY, toX, toY);
};


/** @return {Mask} */
mask.clip = function(mask, rectangle) {
  var alternations = {};
  for (var y in mask.alternations) {
    var outputAlternations = [];
    if (y < rectangle.fromY || y >= rectangle.toY) {
      continue;      
    }
    var on = false;
    var inBounds = false; // assume x[-1] = -inf
    for (var i = 0; i < mask.alternations[y].length; ++i) {
      var x = mask.alternations[y][i];
      if (inBounds) {
        if (x >= rectangle.toX) {
          inBounds = false;
          if (on) {
            outputAlternations.push[x];
          }
        }
      } else {
        if (x >= rectangle.fromX) {
          inBounds = true;
          if (!on) {
            outputAlternations.push[x];
          }
        }
      }
      on = !on;
      alternations[y] = outputAlternations;
    }
  }
  return fixel.mask.create(alternations);
};

}); // goog.scope