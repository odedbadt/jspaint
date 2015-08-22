goog.provide('fixel.mask.MaskLineTest')

goog.require('fixel.mask.MaskLine');

goog.scope(function() {
var mask = fixel.mask;

fixel.mask.MaskLineTest.assertMaskLineEquals = function(a, b) {
  if (a == null) {
    if (b == null) {
      return;
    }
    throw ('Only first array is null.');
  }
  if (!!a != !!b) {
    console.log('Expected', a, 'Got', b);
    throw(new Error('Arrays differ.'));
  }
  if (a.length != b.length) {
    console.log('Expected', a, 'Got', b);
    throw(new Error('Arrays differ in size.'));
  }
  for (var i = 0; i < a.length; ++i) {
    if (a[i] != b[i]) {
      console.log('Expected', a, 'Got', b);
      throw(new Error('Arrays differ in position [' + i +'].'));
    }
  }
};
var assertMaskLineEquals = mask.MaskLineTest.assertMaskLineEquals;

fixel.mask.MaskLineTest.testMerge = function() {  
  try {
  assertMaskLineEquals([0, 15], mask.mergeMaskLine([0, 10], [5, 15]));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 10, 15, 25], mask.mergeMaskLine([0, 10], [15, 25]));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 25], mask.mergeMaskLine([0, 25], [10, 15]));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 5], mask.mergeMaskLine([0, 5], [0, 5]));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([-5, 5], mask.mergeMaskLine([-5, 0], [0, 5]));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 10], mask.mergeMaskLine([0, 10], null));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 10], mask.mergeMaskLine([0, 10], undefined));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 10], mask.mergeMaskLine(null, [0, 10]));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 10], mask.mergeMaskLine(undefined, [0, 10]));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {

  assertMaskLineEquals([0, 15], mask.mergeMaskLine([0, 10], [5, 15], 0, 0));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {

  assertMaskLineEquals([0, 15], mask.mergeMaskLine([0, 10], [0, 10], 5));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([0, 10, 15, 25], mask.mergeMaskLine([0, 10], [0, 10], 15));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([10, 20], mask.mergeMaskLine([], [0, 10], 10));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals([10, 20], mask.mergeMaskLine(null, [0, 10], 10));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskLineEquals(null, mask.mergeMaskLine(null, null, 10));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
};


fixel.mask.MaskLineTest.testClip = function() {  
  try {
    assertMaskLineEquals([5, 15], fixel.mask.clipMaskLine([5, 15], 5, 15));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskLineEquals([5, 15], fixel.mask.clipMaskLine([5, 15], 0, 20));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskLineEquals([5, 15], fixel.mask.clipMaskLine([0, 20], 5, 15));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskLineEquals([5, 15, 20, 25], fixel.mask.clipMaskLine([0, 15, 20, 30], 5, 25));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskLineEquals([5, 15], fixel.mask.clipMaskLine([0, 15, 20, 30], 5, 15));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
};

}); // goog.scope