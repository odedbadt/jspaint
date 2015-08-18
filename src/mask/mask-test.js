goog.provide('mask.MaskTest')

goog.require('goog.asserts');
goog.require('goog.object');
goog.require('mask');
goog.require('mask.Mask');
goog.require('mask.MaskLineTest');

goog.scope(function() {

var assertMaskLineEquals = mask.MaskLineTest.assertMaskLineEquals;
var Mask = mask.Mask;

var assertMaskEquals = function(a, b) {
  if (a == null) {
    if (b == null) {
      return;
    }
    throw ('Only first array is null.');
  }
  var keysA = goog.object.getKeys(a);
  var keysB = goog.object.getKeys(b);
  if (keysA.length != keysB.length) {
    console.log('Expected', a, 'Got', b);
    throw('Key arrays differ in size.');
  }
  for (var k in keysA) {
    assertMaskLineEquals(a[k], b[k]);
  }
  for (var k in keysB) {
    assertMaskLineEquals(a[k], b[k]);
  }
  if (!!a.boundingBox != !!b.boundingBox) {
    console.log('Expected', a, 'Got', b);
    throw('Bounding boxes differ.');
  }
  for (var k in a.boundingBox) {
    goog.asserts.assert(a.boundingBox[k] == b.boundingBox[k], 'Expected %s = %s, got %s.', k, String(a.boundingBox[k]), String(b.boundingBox[k]));
  }
  for (var k in b.boundingBox) {
    goog.asserts.assert(a.boundingBox[k] == b.boundingBox[k], 'Expected %s = %s, got %s.', k, String(a.boundingBox[k]), String(b.boundingBox[k]));
  }
};

mask.MaskTest.testMerge = function() {  
  assertMaskEquals({
    alternations: {0: [0, 15]},
    boundingBox: {minX: 0, maxX: 15, minY: 0, maxY: 0}},
  mask.merge(mask.create({0: [0, 10]}), mask.create({0: [5, 15]})));

  assertMaskEquals({
    alternations: {0: [0, 15]},
    boundingBox: {minX: -30, maxX: 15, minY: -10, maxY: 10}},
  mask.merge(mask.create({"-10": [-30, 0]}), mask.create({10: [0, 15]})));

  assertMaskEquals(mask.create({0: [0, 10], 1: [5, 15]}), mask.merge(mask.create({0: [0, 10]}), mask.create({1: [5, 15]})));
  assertMaskEquals(mask.create({0: [0, 5], 1: [10, 20]}), mask.merge(mask.create({0: [0, 5]}), mask.create({0: [0, 10]}), 10, 1));

  assertMaskEquals(mask.create({10: [10, 20]}), mask.merge(null, mask.create({0: [0, 10]}), 10, 10));
  assertMaskEquals(null, mask.merge({alternations: {}}, {alternations: {}}));
};

});