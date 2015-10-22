goog.provide('fixel.mask.MaskTest')

goog.scope(function() {
var mask = fixel.mask;
var Mask = fixel.mask.Mask;

describe("Test Create Mask", function() {
  it("A mask with no alternations should be null.", function() {
    expect(mask.create(null)).toBe(null);
  });
  it("A single line mask should be created properly.", function() {
    expect(mask.create({0: [5, 10, 15, 20]}))
        .toEqual(
            {alternations: {0: [5, 10, 15, 20]},
            boundingBox: {fromX: 5, fromY: 0, toX: 20, toY: 1},
            isSimple: false})
  });
  it("A mask made of couples should be simple.", function() {
    expect(mask.create({0: [5, 10], 1: [15, 20]}).isSimple).toEqual(true);
  });
  it("A mask made of non couples should not be simple.", function() {
    expect(mask.create({0: [5, 10, 15, 20], 1: [15, 20]}).isSimple)
        .toEqual(false)
  });
});

describe("Test Merge Mask Line", function() {
  it("Merging two adjacent lines.", function() {
    expect(mask.mergeMaskLines([10, 20], [0, 10])).toEqual([0, 20]);
  });
  it("Merging two identical lines.", function() {
    expect(mask.mergeMaskLines([0, 10], [0, 10])).toEqual([0, 10]);
  });
  it("Merging two identical disjoint masks.", function() {
    expect(mask.mergeMaskLines([0, 10, 20, 30], [0, 10, 20, 30]))
        .toEqual([0, 10, 20, 30]);
  });
  it("Merging two masks with an identical first range.", function() {
    expect(mask.mergeMaskLines([0, 10, 20, 30], [0, 10, 25, 35]))
        .toEqual([0, 10, 20, 35]);
  });
  it("Merging two identical tiny lines.", function() {
    expect(mask.mergeMaskLines([1, 2], [1, 2])).toEqual([1, 2]);
  });
  it("Merging one line containing the other, sharing right boundary.",
      function() {
        expect(mask.mergeMaskLines([0, 20], [5, 15])).toEqual([0, 20]);
      });
  it("Merging one line containing the other, sharing right boundary.",
      function() {
        expect(mask.mergeMaskLines([0, 20], [5, 20])).toEqual([0, 20]);
      });
  it("Merging one line containing the other, sharing left boundary.",
      function() {
        expect(mask.mergeMaskLines([0, 15], [0, 20])).toEqual([0, 20]);
      });
  it("Merging two non intersecting ranges.",
      function() {
        expect(mask.mergeMaskLines([0, 10], [15, 25])).toEqual([0, 10, 15, 25]);
      });
  it("Merging two adject ranges, the second to the left of the first.",
      function() {
        expect(mask.mergeMaskLines([-5, 0], [0, 5])).toEqual([-5, 5]);
      });
  it("The first line is null.",
      function() {
        expect(mask.mergeMaskLines(null, [0, 10])).toEqual([0, 10]);
      });
  it("The second line is null.",
      function() {
        expect(mask.mergeMaskLines([0, 10], null)).toEqual([0, 10]);
      });
  it("The first line is empty, not null.",
      function() {
        expect(mask.mergeMaskLines([], [0, 10])).toEqual([0, 10]);
      });
  it("The first line is empty, with offset.",
      function() {
        expect(mask.mergeMaskLines([], [0, 10], 10)).toEqual([10, 20]);
      });
  it("The second line is empty.",
      function() {
        expect(mask.mergeMaskLines([0, 10], null)).toEqual([0, 10]);
      });
  it("The second line is empty, not null.",
      function() {
        expect(mask.mergeMaskLines([0, 10], [])).toEqual([0, 10]);
      });
  it("Two nulls, with offset.",
      function() {
        expect(mask.mergeMaskLines(null, null, 10)).toEqual(null);
      });
  it("The first line is undefined.",
      function() {
        expect(mask.mergeMaskLines(undefined, [0, 10])).toEqual([0, 10]);
      });
  it("The second line is undefined.",
      function() {
        expect(mask.mergeMaskLines([0, 10], undefined)).toEqual([0, 10]);
      });
  it("Merging two intersecting ranges, with explicit zero offset.",
      function() {
        expect(mask.mergeMaskLines([0, 10], [5, 15], 0)).toEqual([0, 15]);
      });
  it("Merging with offset.",
      function() {
        expect(mask.mergeMaskLines([0, 10], [0, 10], 5)).toEqual([0, 15]);
      });
  it("Merging with offset, no intersection.",
      function() {
        expect(mask.mergeMaskLines([0, 10], [0, 10], 15))
            .toEqual([0, 10, 15, 25]);
      });
  it("Encountered bug #1.", function() {
    expect(mask.mergeMaskLines([1, 2], [0, 1], 1)).toEqual([1, 2])
  });
  it("Encountered bug #2.", function() {
    expect(mask.mergeMaskLines([-99,99], [-100,100], 1)).toEqual([-99, 101])
  });
});

describe("Test Clip", function() {
  it("Clip a mask with anull rectangle.", function() {
    expect(fixel.mask.clip(mask.create({0: [10, 20]}), null).toBeNull();
  });
});
describe("Test Clip Mask Line", function() {

  it("Clip single section line.", function() {
    expect(fixel.mask.clipMaskLine([10, 20], 5, 35))
      .toEqual([10, 20]);
  });

  it("Clip multi section line.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 498, 530], 490, 552))
      .toEqual([498, 530]);
  });

  it("Clip multi section line in the middle of a section.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40], 15, 35))
      .toEqual([15, 20, 30, 35]);
  });

  it("Clip multi section line in the middle of a non section.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40, 50, 60], 25, 45))
      .toEqual([30, 40]);
  });

  it("Clip multi section line with range starting on range end.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40], 20, 45))
      .toEqual([30, 40]);
  });
  it("Clip multi section line with range whose starting point is identical to that of a range in the mask.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40], 10, 25))
      .toEqual([10, 20]);
  });
  it("Clip multi section line with range whose starting point is identical to that of a range in the mask and end point within the next range.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40], 10, 35))
      .toEqual([10, 20, 30, 35]);
  });
  it("Clip multi section line with range whose starting point is identical to that of a range in the mask and end point after the next range.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40, 50, 60], 10, 55))
      .toEqual([10, 20, 30, 40, 50, 55]);
  });
  it("Clip multi section line with range identical to a range in the mask.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40], 10, 20))
      .toEqual([10, 20]);
  });
  it("Clip multi range line with clip range ending at range start.", function() {
    expect(fixel.mask.clipMaskLine([10, 20, 30, 40, 50, 60], 25, 50))
        .toEqual([30, 40]);
  });
  it("Bug #1.", function() {
    expect(fixel.mask.clipMaskLine(
        [59, 94, 169, 211, 226, 239, 488, 541, 543, 559, 645, 702, 950, 971],
        466, 543)).toEqual([488, 541]);
  });
  it("Bug #2.", function() {
    expect(fixel.mask.clipMaskLine([670,680], 216, 420)).toBeNull();
  });
  

});
// 

describe("Test Merge Mask", function() {
  it("Merging two one line mask with the same line.", function() {
    expect(mask.merge(mask.create({0: [0, 10]}), mask.create({0: [5, 15]})))
        .toEqual(mask.create({0: [0, 15]}));
  });
  it("Merging masks with the first one having a negative key.", function() {
    expect(mask.merge(mask.create({"-10": [-30, 0]}), mask.create({10: [0, 15]})))
        .toEqual(mask.create({"-10": [-30, 0], 10: [0, 15]}));
  });
  it("Merging one line masks along different lines.", function() {
    expect(mask.merge(mask.create({0: [0, 10]}), mask.create({1: [5, 15]})))
        .toEqual(mask.create({0: [0, 10], 1: [5, 15]}));
  });
  it("Masks with consecutive keys should merge properly.", function() {
    expect(mask.merge(mask.create({0: [0, 10]}), mask.create({1: [5, 15]})))
        .toEqual(mask.create({0: [0, 10], 1: [5, 15]}));
  });
  it("Merging two one line mask with the same line, one containing the other.", function() {
    expect(mask.merge(mask.create({0: [0, 5]}), mask.create({0: [0, 10]}), 10, 1))
        .toEqual(mask.create({0: [0, 5], 1: [10, 20]}));
  });
  it("Merging a null mask with a non null mask with offset.", function() {
    expect(mask.merge(null, mask.create({0: [0, 10]}), 10, 10))
        .toEqual(mask.create({10: [10, 20]}));
  });
  it("Merging two empty masks.", function() {
    expect(mask.merge({alternations: {}}, {alternations: {}}))
        .toBe(null);
  });
  it("Encountered bug #1.", function() {
    expect(mask.merge(mask.create({
      0: [0, 1],
      1: [0, 1],
      2: [0, 2],
      3: [1, 2]
    }), mask.create({0: [0, 1], 1: [0, 1]}), 1, 3))
        .toEqual(mask.create({
      0: [0, 1],
      1: [0, 1],
      2: [0, 2],
      3: [1, 2],
      4: [1, 2]
    }));
  });
});
describe("Test Mask Line", function() {
  var pixelCursor = mask.create({0: [0, 1]});
  it("A 1 pixel line.", function() {
    expect(mask.line(pixelCursor, 0, 0, 0, 0))
        .toEqual(pixelCursor);
  });
  it("An offseted 1 pixel line.", function() {
    expect(mask.line(pixelCursor, 10, 10, 10, 10))
        .toEqual(mask.create({10: [10, 11]}));
  });
  var twoPixelDiagonalLine = mask.create({0: [0, 1], 1: [1, 2]});
  it("A diagonal tiny line.", function() {
    expect(mask.line(pixelCursor, 0, 0, 1, 1)).toEqual(twoPixelDiagonalLine);
  });
  it("A diagonal tiny line drawn backwards.", function() {
    expect(mask.line(pixelCursor, 1, 1, 0, 0)).toEqual(twoPixelDiagonalLine);
  });
  it("A diagonal tiny line: top right to bottom left.", function() {
    expect(mask.line(pixelCursor, 1, 0, 0, 1)).toEqual(
        mask.create({0: [1, 2], 1: [0, 1]}));
  });
  it("A diagonal tiny line: top right to bottom left, drawn backwards.", function() {
    expect(mask.line(pixelCursor, 0, 1, 1, 0)).toEqual(
        mask.create({0: [1, 2], 1: [0, 1]}));
  });
  it("A non trivial diagonal 1 pixel wide line, top to bottom.", function() {
    expect(mask.line(pixelCursor, 0, 0, 1, 3))
        .toEqual(mask.create({
          0: [0, 1],
          1: [0, 1],
          2: [1, 2],
          3: [1, 2]
        }));
  });
  it("A non trivial diagonal 1 pixel wide line, left to right.", function() {
    expect(mask.line(pixelCursor, 0, 0, 3, 1))
        .toEqual(mask.create({
          0: [0, 2],
          1: [2, 4]
        }));
  });
  var twoPixelCursor = mask.create({0: [0, 1], 1: [0, 1]});
  it("A 2 pixel line.", function() {
    expect(mask.line(twoPixelCursor, 0, 0, 1, 1))
        .toEqual(mask.create({0: [0, 1], 1: [0, 2], 2: [1, 2]}));
  });
  it("A 2 pixel non trivial line, top to bottom.", function() {
    expect(mask.line(twoPixelCursor, 0, 0, 1, 3))
        .toEqual(mask.create({
           0: [0, 1],
           1: [0, 1],
           2: [0, 2],
           3: [1, 2],
           4: [1, 2]
         }));
  });
  it("A 2 pixel non trivial line, left to right.", function() {
    expect(mask.line(twoPixelCursor, 0, 0, 3, 1))
        .toEqual(mask.create({
           0: [0, 2],
           1: [0, 4],
           2: [2, 4]
         }));
  });
  var almostVerticalCursor = mask.create({0:[0, 1], 1: [0, 1], 2: [0, 2]});
  it("A diagonal line with an almost vertical cursor.", function() {
    expect(mask.line(almostVerticalCursor, 0, 0, 1, 5))
        .toEqual(mask.create({
           0: [0, 1],
           1: [0, 1],
           2: [0, 2],
           3: [0, 2],
           4: [0, 2],
           5: [1, 3],
           6: [1, 3],
           7: [1, 3]
         }));
  });
});
});