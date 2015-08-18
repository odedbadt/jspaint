goog.provide('mask.MaskLine');
goog.provide('mask.MaskLine.Alternations');

goog.require('goog.array');

goog.scope(function() {



/**
 * Assumed to be sorted.
 * @typedef {!Array<number>}
 */
mask.MaskLine.Alternations;
var Alternations = mask.MaskLine.Alternations;

/**
 * Merges the mask with another mask
 * @param {Alternations} maskA
 * @param {Alternations} maskB
 * @return {Alternations}
 */
mask.MaskLine.merge = function(maskA, maskB, offset) {
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
  while (true) {
    if (iA < maskA.length && (iB >= maskB.length ||
        iB < maskB.length && maskA[iA] < maskB[iB] + offset)) {
      // take A.
      if (iA % 2 == 0) {
        if (lit == 0) {
          output.push(maskA[iA]);
        }
        lit++;
      } else {
        lit--;
        if (lit == 0) {
          output.push(maskA[iA]);
        }
      }
      iA++;
    } else if (iB < maskB.length) {
      // take B.
      if (iB % 2 == 0) {
        if (lit == 0) {
          output.push(maskB[iB] + offset);
        }
        lit++;
      } else {
        lit--;
        if (lit == 0) {
          output.push(maskB[iB] + offset);
        }
      }
      iB++;
    } else {
      // Done.
      break;
    }
  }
  return output;
};

}); // goog.scope
