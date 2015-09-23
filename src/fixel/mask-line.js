goog.provide('fixel.mask.MaskLine');
goog.provide('fixel.mask.Alternations');

goog.require('goog.array');

goog.scope(function() {



/**
 * Assumed to be sorted.
 * @typedef {!Array<number>}
 */
fixel.mask.Alternations;
var Alternations = fixel.mask.Alternations;


/**
 * Merges the mask with another mask
 * @param {Alternations} maskA
 * @param {Alternations} maskB
 * @return {Alternations}
 */
fixel.mask.mergeMaskLine = function(maskA, maskB, offset) {
  offset = offset || 0;
  if (!goog.isDefAndNotNull(maskA) && !goog.isDefAndNotNull(maskB)) {
    return null;
  }
  if (!goog.isDefAndNotNull(maskA)) {
    return goog.array.map(maskB, function(x) { return Number(x) + offset;});
  }
  if (!goog.isDefAndNotNull(maskB)) {
    return maskA;
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

fixel.mask.clipMaskLine = function(alternations, fromX, toX) {
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
        outputAlternations.push(fromX);
        if (x < toX) {
          outputAlternations.push(x);
        } else {
          outputAlternations.push(toX);
        }
      } else {
        outputAlternations.push(x);
      }
    }    
    if (prevInBounds) {
      if (x > toX) {
        if (on) {
          outputAlternations.push(toX);
        }
      } else {
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

}); // goog.scope