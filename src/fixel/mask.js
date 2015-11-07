goog.provide('fixel.mask');
goog.provide('fixel.mask.Alternations');
goog.provide('fixel.mask.Mask');

goog.require('fixel.point');
goog.require('fixel.rectangle');
goog.require('fixel.rectangle.Rectangle');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.asserts');

goog.scope(function() {
var MaskLine = fixel.mask.MaskLine;
var Rectangle = fixel.rectangle.Rectangle;
var point = fixel.point;
var rectangle = fixel.rectangle;



/**
 * Assumed to be sorted.
 * @typedef {!Object<number, Alternations>}
 */
fixel.mask.Alternations;
var Alternations = fixel.mask.Alternations;



/**
 * @typedef {?{
 *   alternations: Alternations,
 *   boundingBox: Rectangle,
 *   isSimple: boolean
 * }}
 */
fixel.mask.Mask;
var mask = fixel.mask;
var Mask = fixel.mask.Mask;

/**
 * @param {Mask} maskA
 * @param {Mask} maskB
 * @param {Point=} opt_offset
 */
mask.merge = function(maskA, maskB, opt_offset) {
  if (!maskA && !maskB) {
    return null;
  }
  if (!maskA) {
    return mask.create(mask.mergeAlternations_(fixel.mask.mergeMaskLines, {}, maskB.alternations, opt_offset && opt_offset.x, opt_offset && opt_offset.y));
  }
  if (!maskB) {
    return maskA;
  }
  return mask.create(mask.mergeAlternations_(fixel.mask.mergeMaskLines, maskA.alternations, maskB.alternations, opt_offset && opt_offset.x, opt_offset && opt_offset.y));
};


/**
 * @param {function(Array<number>, Array<number>, (number|undefined)): Array<number>} rowMergingFunction
 * @param {Alternations} alternationsA
 * @param {Alternations} alternationsB
 * @param {number=} opt_offsetX
 * @param {number=} opt_offsetY
 * @return {Alternations}
 * @private
 */
mask.mergeAlternations_ = function(rowMergingFunction, alternationsA, alternationsB, opt_offsetX, opt_offsetY) {
  opt_offsetX = opt_offsetX || 0;
  opt_offsetY = opt_offsetY || 0;
  var alternations = {};
  for (var y in alternationsA) {
    var mergedLine = rowMergingFunction(alternationsA[Number(y)],
        alternationsB[Number(y) - opt_offsetY] || null, opt_offsetX);
    if (mergedLine) {
      alternations[y] = mergedLine;
    }
  }
  for (y in alternationsB) {
    var mergedLine = rowMergingFunction(
        alternationsA[Number(y) + opt_offsetY]  || null,
        alternationsB[Number(y)], opt_offsetX);
    if (mergedLine) {
      alternations[Number(y) + opt_offsetY] = mergedLine;
    }        
  }  
  return alternations;
};


/**
 * @param {Alternations} alternations
 * @param {Rectangle=} opt_boundingBox
 * @param {boolean=} opt_isSimple
 * @return {Mask}
 */
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


/**
 * @return {Mask}
 */
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
  return fixel.rectangle.create(fromX, fromY, toX, toY);
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
  if (!rectangle) {
    return null;    
  }
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
mask.line0 = function(cursor, fromX, fromY, toX, toY) {
  return mask.lineInternal_(
    cursor.isSimple ? fixel.mask.mergeSimpleMaskLines : fixel.mask.mergeMaskLines,
    cursor, fromX, fromY, toX, toY);
};


/** @return {Mask} */
mask.line = function(cursor, fromX, fromY, toX, toY) {  
  if (arguments.length == 3 && fromX != null && fromY != null) {
    return mask.line(cursor, fromX.x, fromX.y, fromY.x, fromY.y)
  }
  //return mask.line0(cursor, fromX, fromY, toX, toY);
  var dy = toY - fromY;
  var h = rectangle.height(cursor.boundingBox);
  var top = cursor.boundingBox.fromY;
  var bottom = cursor.boundingBox.toY;
  if (fromX > toX || dy < h) {
    return mask.line0(cursor, fromX, fromY, toX, toY);
  }
  var grad = (toX - fromX) / (toY - fromY);
  var sampler = mask.line0(cursor, 0, 0, grad * h * 2, h * 2);
  var alternations = {};
  var shifter = function(s) { return function(x) { return x + s;}}
  startShifter = shifter(fromX);
  for (var t = 0; t < h; ++t) {
    alternations[fromY + top + t] = goog.array.map(
      sampler.alternations[top + t], startShifter);
  }
  for (var t = 0; t < toY - fromY - h; ++t) {
    alternations[fromY + top + h + t] = goog.array.map(
      sampler.alternations[top + h], shifter(Math.floor(fromX + t * grad)));
  }
  var endShifter = shifter(Math.floor(toX - grad * h * 2));
  for (var t = 0; t < h; ++t) {
    alternations[toY + bottom - h + t] = goog.array.map(
      sampler.alternations[bottom + h + t], endShifter);
  }
  /*
  for (var t = 0; t < h; ++t) {
    alternations[toY + bottom - h + t] = goog.array.map(
      sampler.alternations[h + t], shifter(fromX + (toY - fromY) * grad));
  }
  for (var y = 0; y < toY - fromY - 2*h; ++y) {
    alternations[y + fromY + h] = sampler.alternations[y - fromY].map(shifter(y));
  }
  for (var y = toY - h; y < toY; ++y) {
    alternations[y] = sampler.alternations[y - (toY - h)].map(shifter(y));
  }*/
  return mask.create(alternations);
};

/**
 * @param {function(Array<number>, Array<number>, (number|undefined)): ?Array<number>} rowMergingFunction
 * @param {Mask} cursor
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} toX
 * @param {number} toY
 * @return {Mask}
 * @private
 */
mask.lineInternal_ = function(rowMergingFunction, cursor, fromX, fromY, toX, toY) {
  var resultAlternations = {};
  var x = fromX;
  var y = fromY;
  var cursorAlternations = cursor.alternations;
  if (fromX == toX && fromY == toY) {
    return mask.merge(null, cursor, point.create(fromX, fromY));
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



/**
 * Merges the mask with another mask
 * @param {Array<number>} maskA
 * @param {Array<number>} maskB
 * @param {number=} opt_offset
 * @return {Array<number>}
 */
fixel.mask.mergeMaskLines = function(maskA, maskB, opt_offset) {
  var offset = opt_offset || 0;
  if (!goog.isDefAndNotNull(maskA) && !goog.isDefAndNotNull(maskB)) {
    return null;
  }
  if (!goog.isDefAndNotNull(maskA)) {
    return goog.array.map(maskB, function(x) { return Number(x) + offset;});
  }
  if (!goog.isDefAndNotNull(maskB)) {
    return maskA;
  }
  if (maskA.length == 2 && maskB.length == 2) {
    return fixel.mask.mergeSimpleMaskLines(maskA, maskB, offset);
  }
  var iA = 0;
  var iB = 0;
  var lit = 0;
  var output = [];
  var isEmpty = true;
  while (true) {
    if (iA < maskA.length && (iB >= maskB.length ||
        iB < maskB.length && maskA[iA] < maskB[iB] + offset)) {
      // A is strictly smaller or B is done, take A.
      if (iA % 2 == 0) {
        if (lit == 0) {
          output.push(maskA[iA]);
          isEmpty = false;
        }
        lit++;
      } else {
        lit--;
        if (lit == 0) {
          output.push(maskA[iA]);
          isEmpty = false;
        }
      }
      iA++;
    } else if (iA < maskA.length && iB < maskB.length &&
        maskA[iA] == (maskB[iB] + offset)) {
        // A and B are equal, take none, skip both pointers.
        if (iA % 2 == iB % 2) {
          output.push(maskA[iA]);
          isEmpty = false;          
          lit = (iA + 1) % 2 + (iB + 1) % 2;
        }
        iA++;
        iB++;
    } else if (iB < maskB.length) {
      // take B.
      if (iB % 2 == 0) {
        if (lit == 0) {
          output.push(maskB[iB] + offset);
          isEmpty = false;
        }
        lit++;
      } else {
        lit--;
        if (lit == 0) {
          output.push(maskB[iB] + offset);
          isEmpty = false;
        }
      }
      iB++;
    } else {
      // Done.
      break;
    }
  }
  return isEmpty ? null : output;
};

fixel.mask.mergeSimpleMaskLines = function(maskA, maskB, offset) {
  if (!maskA && !maskB) {
    return null;
  }
  if (!maskB) {
    return maskA;
  }
  if (!maskA) {
    return [maskB[0] + offset, maskB[1] + offset];
  }
  /*goog.asserts.assert(maskA.length == 2, 'Mask A is not simple.');
  goog.asserts.assert(maskB.length == 2, 'Mask B is not simple.');*/
  if (maskA[1] < maskB[0] + offset) {
    return [maskA[0], maskA[1], maskB[0] + offset, maskB[1] + offset];
  }
  if (maskB[1] + offset < maskA[0]) {
    return [maskB[0] + offset, maskB[1] + offset, maskA[0], maskA[1]];
  }
  return [Math.min(maskA[0], maskB[0] + offset),
      Math.max(maskA[1], maskB[1] + offset)];
};

mask.clipMaskLine = function(alternations, fromX, toX) {
  if (!alternations) {
    return null;
  }
  var outputAlternations = [];
  var on = false;
  var prevInBounds = false; // x[-1] = -Inf
  for (var i = 0; i < alternations.length; ++i) {
    var x = alternations[i];
    if (!prevInBounds && x >= fromX) {
      if (on) {        
        if (x < toX) {
          if (x > fromX) {
            outputAlternations.push(fromX);
            outputAlternations.push(x);
          }
        } else {
          outputAlternations.push(fromX);
          outputAlternations.push(toX);
        }
      } else if (x < toX  || (x <= toX && on)) {
        outputAlternations.push(x);
      }
    }    
    if (prevInBounds) {
      if (x > toX) {
        if (on) {
          outputAlternations.push(toX);
        }
      } else if (x < toX || (x <= toX && on)) {
        outputAlternations.push(x);        
      }
    }
    prevInBounds = x >= fromX && x < toX;
    if (x >= toX) {
      break;
    }
    on = !on;
  }
  return outputAlternations.length == 0 ? null : outputAlternations;
};


mask.lineContains = function(line, x) {
  // TODO: binary search?
  for (var i = 0; i < line.length; ++i) {
    if (line[i] > x) {
      return (i % 2) == 1;
    }
  }
};


/**
 * @param {Point} location
 * @param {Mask} mask
 * @param {number=} opt_opffsetX
 * @param {number=} opt_opffsetY
 * @return {boolean}
 */
fixel.mask.contains = function(location, mask, opt_offset) {
  if (!mask) {
    return false;
  }
  var row = mask.alternations[location.y - (opt_offset ? opt_offset.y : 0)];
  if (!row) {
    return false;    
  }
  return fixel.mask.lineContains(row, location.x - (opt_offset ? opt_offset.x : 0));
};


fixel.mask.fromBoolean = function(boundingBox, f) {
  var m = null;
  var alternations = {};
  for (var y = boundingBox.fromY; y < boundingBox.toY; ++y) {
    var on = false;
    var row = [];
    for (var x = boundingBox.fromX; x < boundingBox.toX; ++x) {
      if (on && !f(x, y)) {
        row.push(x);
        on = !on;
      }
      if (!on && f(x, y)) {
        row.push(x);
        on = !on;
      }
    }
    if (on) {
      row.push(boundingBox.toX);
    }
    if (row.length > 0) {
      alternations[y] = row;
    }
  }
  return mask.create(alternations);
};


fixel.mask.fromRectangle = function(rectangle) {
  var m = null;
  var alternations = {};
  for (var y = rectangle.fromY; y < rectangle.toY; ++y) {
    alternations[y] = [rectangle.fromX, rectangle.toX];
  }
  return mask.create(alternations, rectangle);
};

});  // goog.scope