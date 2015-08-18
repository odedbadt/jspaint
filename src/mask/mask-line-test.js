goog.provide('mask.MaskLineTest')

goog.require('mask.MaskLine');

goog.scope(function() {

mask.MaskLineTest.assertMaskLineEquals = function(a, b) {
  if (a == null) {
    if (b == null) {
      return;
    }
    throw ('Only first array is null.');
  }
  if (a.length != b.length) {
    console.log('Expected', a, 'Got', b);
    throw('Arrays differ in size.');
  }
  for (var i = 0; i < a.length; ++i) {
    if (a[i] != b[i]) {
      console.log('Expected', a, 'Got', b);
      throw('Arrays differ in position [' + i +'].');
    }
  }
  console.log('Success!', a, b);
};
var assertMaskLineEquals = mask.MaskLineTest.assertMaskLineEquals;

mask.MaskLineTest.testMerge = function() {  
  assertMaskLineEquals([0, 15], mask.MaskLine.merge([0, 10], [5, 15]));
  assertMaskLineEquals([0, 10, 15, 25], mask.MaskLine.merge([0, 10], [15, 25]));
  assertMaskLineEquals([0, 25], mask.MaskLine.merge([0, 25], [10, 15]));
  assertMaskLineEquals([0, 5], mask.MaskLine.merge([0, 5], [0, 5]));
  assertMaskLineEquals([-5, 5], mask.MaskLine.merge([-5, 0], [0, 5]));
  assertMaskLineEquals([0, 10], mask.MaskLine.merge([0, 10], null));
  assertMaskLineEquals([0, 10], mask.MaskLine.merge([0, 10], undefined));
  assertMaskLineEquals([0, 10], mask.MaskLine.merge(null, [0, 10]));
  assertMaskLineEquals([0, 10], mask.MaskLine.merge(undefined, [0, 10]));

  assertMaskLineEquals([0, 15], mask.MaskLine.merge([0, 10], [5, 15], 0, 0));

  assertMaskLineEquals([0, 15], mask.MaskLine.merge([0, 10], [0, 10], 5));
  assertMaskLineEquals([0, 10, 15, 25], mask.MaskLine.merge([0, 10], [0, 10], 15));

  assertMaskLineEquals([10, 20], mask.MaskLine.merge([], [0, 10], 0, 10));

};

}); // goog.scope