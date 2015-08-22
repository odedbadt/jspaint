goog.provide('fixel.mask.MaskTest')

goog.require('goog.asserts');
goog.require('goog.object');
goog.require('fixel.Rectangle');
goog.require('fixel.mask.Mask');
goog.require('fixel.mask.MaskLineTest');

goog.scope(function() {
var mask = fixel.mask;
var assertMaskLineEquals = fixel.mask.MaskLineTest.assertMaskLineEquals;
var Mask = fixel.mask.Mask;

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
    throw(new Error('Key arrays differ in size.'));
  }
  for (var k in keysA) {
    assertMaskLineEquals(a[k], b[k]);
  }
  for (var k in keysB) {
    assertMaskLineEquals(a[k], b[k]);
  }
  if (!!a.boundingBox != !!b.boundingBox) {
    console.log('Expected', a, 'Got', b);
    throw(new Error('Bounding boxes differ.'));
  }
  for (var k in a.boundingBox) {
    goog.asserts.assert(a.boundingBox[k] == b.boundingBox[k], 'Expected %s = %s, got %s.', k, String(a.boundingBox[k]), String(b.boundingBox[k]));
  }
  for (var k in b.boundingBox) {
    goog.asserts.assert(a.boundingBox[k] == b.boundingBox[k], 'Expected %s = %s, got %s.', k, String(a.boundingBox[k]), String(b.boundingBox[k]));
  }
};


fixel.mask.MaskTest.testCreate = function() {  
  try {
    assertMaskEquals(null, mask.create(null));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskEquals(
      {alternations: {0: [5, 10, 15, 20]},
       boundingBox: {fromX: 5, fromY: 0, toX: 20, toY: 1}},
      mask.create({0: [5, 10, 15, 20]}));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
};


fixel.mask.MaskTest.testMerge = function() {  
  try {
    assertMaskEquals(mask.create({0: [0, 15]}),
    mask.merge(mask.create({0: [0, 10]}), mask.create({0: [5, 15]})));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskEquals(mask.create({"-10": [-30, 0], 10: [0, 15]}),
    mask.merge(mask.create({"-10": [-30, 0]}), mask.create({10: [0, 15]})));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskEquals(mask.create({0: [0, 10], 1: [5, 15]}),
        mask.merge(mask.create({0: [0, 10]}), mask.create({1: [5, 15]})));
    assertMaskEquals(mask.create({0: [0, 5], 1: [10, 20]}),
        mask.merge(mask.create({0: [0, 5]}), mask.create({0: [0, 10]}), 10, 1));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
    assertMaskEquals(mask.create({10: [10, 20]}),
        mask.merge(null, mask.create({0: [0, 10]}), 10, 10));
    assertMaskEquals(null, mask.merge({alternations: {}}, {alternations: {}}));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
};


fixel.mask.MaskTest.testClip = function() {  
  try {
  assertMaskEquals(mask.create({0: [0, 15]}),
      mask.clip(mask.create({0: [0, 20]}), fixel.createRectangle(0, 0, 15, 1)));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskEquals(mask.create({0: [0, 15]}),
      mask.clip(mask.create({0: [-10, 20]}),
          fixel.createRectangle(0, 0, 15, 1)));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {

  assertMaskEquals(mask.create({1: [0, 10], 2: [5, 10], 3: [0, 10]}),
    mask.clip(mask.create({0: [-10, 50], 1: [0, 20], 2: [5, 15], 3: [-100, 10],
        4: [0, 50]}), fixel.createRectangle(0, 1, 10, 4)));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {

  assertMaskEquals(mask.create({0: [5, 10, 15, 20]}),
      mask.clip(mask.create({0: [0, 10, 15, 30]}),
          fixel.createRectangle(5, 0, 20, 1)));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }
  try {
  assertMaskEquals(mask.create({0: [5, 10, 15, 20]}),
      mask.clip(mask.create({0: [5, 10, 15, 20]}),
          fixel.createRectangle(0, 0, 100, 1)));
  } catch(e) {
    console.log(e);
    console.log(e.stack);
  }

};


fixel.mask.MaskTest.testAll = function() {
    mask.MaskTest.testCreate();
    mask.MaskTest.testMerge();
    mask.MaskTest.testClip();
    mask.MaskLineTest.testMerge();
    mask.MaskLineTest.testClip();
};

});