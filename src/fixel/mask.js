goog.provide('fixel.mask');
goog.provide('fixel.mask.Mask');

goog.require('fixel.Rectangle');
goog.require('fixel.mask.MaskLine');
goog.require('fixel.mask.Alternations');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.asserts');

goog.scope(function() {
var Alternations = fixel.mask.Alternations;
var MaskLine = fixel.mask.MaskLine;
var Rectangle = fixel.Rectangle;


/**
 * @typedef {{
 *   alternations: !Object<number, !Alternations>,
 *   boundingBox: Rectangle,
 *   isSimple: boolean
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
    return mask.create(mask.mergeAlternations_(fixel.mask.mergeMaskLines, {}, maskB.alternations, offsetX, offsetY));
  }
  if (!maskB) {
    return maskA;
  }
  return mask.create(mask.mergeAlternations_(fixel.mask.mergeMaskLines, maskA.alternations, maskB.alternations, offsetX, offsetY));
};


/** @private */
mask.mergeAlternations_ = function(rowMergingFunction, alternationsA, alternationsB, offsetX, offsetY) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  var alternations = {};
  for (y in alternationsA) {
    alternations[y] = rowMergingFunction(alternationsA[y],
        alternationsB[Number(y) - offsetY], offsetX);
  }
  for (y in alternationsB) {
    var mergedLine = rowMergingFunction(alternationsA[Number(y) + offsetY],
            alternationsB[y], offsetX);
    if (mergedLine) {
      alternations[Number(y) + offsetY] = mergedLine;
    }        
  }  
  return alternations;
};


mask.create = function(alternations, opt_boundingBox, opt_isSimple) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.object.forEach(alternations, function(alternationRow, y) {
      goog.asserts.assert(y == Math.floor(y), 'Y values must be integers.');
      goog.asserts.assert(alternationRow.length > 0, 'Alternations cannot be empty.');
      goog.asserts.assert((alternationRow.length % 2) == 0, 'Alternations count must be even.');
      for (var i = 0; i < alternationRow.length; ++i) {
        var x = alternationRow[i];
        goog.asserts.assert(x == Math.floor(x), 'X values must be integers.');
        if (i > 0) {
          goog.asserts.assert(x >  alternationRow[i - 1], 'X values must be strictly monotonely increasing %s[%s - 1, %s]: %s, %s.', y, i, i, alternationRow[i - 1], x);
        }
      }
    });
  }
  if (goog.object.isEmpty(alternations)) {
    return null;
  }
  return {
    alternations: alternations,
    boundingBox : opt_boundingBox || mask.calculateBoundingBox_(alternations),
    isSimple: opt_isSimple || mask.calculateIsSimple_(alternations) 
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
      continue;
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

/** @return {boolean} */
mask.calculateIsSimple_ = function(alternations) {
  for (var y in alternations) {
    if (alternations[y].length != 2) {
      return false;
    }
  }
  return true;
};


/** @return {Mask} */
mask.clip = function(mask, rectangle) {
  var alternations = {};
  for (var y in mask.alternations) {
    if (y < rectangle.fromY || y >= rectangle.toY) {
      continue;
    }
    var outputAlternations = fixel.mask.clipMaskLine(
        mask.alternations[y], rectangle.fromX, rectangle.toX);
    if (outputAlternations) {
      alternations[y] = outputAlternations;
    }
  }
  return fixel.mask.create(alternations);
};


/** @return {Mask} */
mask.convexLCursorLine = function(cursor, fromX, fromY, toX, toY) {
  if (fromX == toX && fromY == toY) {
    return mask.merge(null, cursor, fromX, fromY)
  }
  var x = fromX;
  var y = fromY;
  var alternations = {};
  if (Math.abs(toX - fromX) > Math.abs(toY - fromY)) {
    if (fromX < toX) {
      var dx = 1;
      var dy = (toY - fromY) / (toX - fromX);
      while (x <= toX) {
        result = mask.merge(result, cursor, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }
    } else {
      var dx = -1;
      var dy = -(toY - fromY) / (toX - fromX);
      while (x >= toX) {
        result = mask.merge(result, cursor, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }    
    }
  } else {
    if (Math.abs(toY - fromY))
    if (fromY < toY) {
      var dx = (toX - fromX) / (toY - fromY);    
      var dy = 1;
      while (y <= toY) {
        result = mask.merge(result, cursor, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }
    } else {
      var dx = -(toX - fromX) / (toY - fromY);    
      var dy = -1;
      while (y >= toY) {
        result = mask.merge(result, cursor, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }    
    }    
  }
  return result;
};


/** @return {Mask} */
mask.line = function(cursor, fromX, fromY, toX, toY) {
  return mask.lineInternal_(
    cursor.isSimple ? fixel.mask.mergeSimpleMaskLines : fixel.mask.mergeMaskLines,
    cursor, fromX, fromY, toX, toY);
}

/** @return {Mask} */
mask.lineInternal_ = function(rowMergingFunction, cursor, fromX, fromY, toX, toY) {
  var resultAlternations = {};
  var x = fromX;
  var y = fromY;
  var cursorAlternations = cursor.alternations;
  if (fromX == toX && fromY == toY) {
    return mask.merge(null, cursor, fromX, fromY)
  }
  if (Math.abs(toX - fromX) > Math.abs(toY - fromY)) {
    if (fromX < toX) {
      var dx = 1;
      var dy = (toY - fromY) / (toX - fromX);
      while (x <= toX) {
        resultAlternations = mask.mergeAlternations_(rowMergingFunction,
            resultAlternations, cursorAlternations, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }
    } else {
      var dx = -1;
      var dy = -(toY - fromY) / (toX - fromX);
      while (x >= toX) {
        resultAlternations = mask.mergeAlternations_(rowMergingFunction,
            resultAlternations, cursorAlternations, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }    
    }
  } else {
    if (fromY < toY) {
      var dx = (toX - fromX) / (toY - fromY);    
      var dy = 1;
      while (y <= toY) {
        resultAlternations = mask.mergeAlternations_(rowMergingFunction,
            resultAlternations, cursorAlternations, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }
    } else {
      var dx = -(toX - fromX) / (toY - fromY);    
      var dy = -1;
      while (y >= toY) {
        resultAlternations = mask.mergeAlternations_(rowMergingFunction,
            resultAlternations, cursorAlternations, Math.round(x), Math.round(y));
        x += dx;
        y += dy;
      }    
    }    
  }
  return mask.create(resultAlternations);
};

}); // goog.scope