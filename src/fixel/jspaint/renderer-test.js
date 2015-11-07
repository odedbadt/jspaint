goog.require('fixel.color');

goog.scope(function() {

describe("Test Rendering", function() {
  var renderer = fixel.jspaint.renderer;
  var mask = fixel.mask;
  var shapes = fixel.shapes;
  var rectangle = fixel.rectangle;
  var Mask = fixel.mask.Mask;
  it("Basic scene rendering", function() {
    var holder = {};
    var stub = {
      createImageData: function(width, height) {
        return {
          data: []
        }
      },
      putImageData: function(writableContext, x, y) {
        holder.writableContext = writableContext;
        holder.x = x;
        holder.y = y;
      }
    };
    var scene = {
      layers: [
        {
          mask: shapes.rectangle(0, 0, 3, 3),
          texture: function(x, y) { return color.create(100, 0, 0);}
        },
        {
          mask: shapes.rectangle(1, 1, 2, 2),
          texture: function(x, y) { return color.create(0, 100, 0);}
        }]

    };
    renderer.renderScene(scene, rectangle.create(0, 0, 3, 3), rectangle.create(0, 0, 3, 3), stub);
    expect(holder.writableContext.x).toEqual(0);
    expect(holder.writableContext.y).toEqual(0);
    expect(holder.writableContext.data).toEqual([
        100, 0, 0, 255,
        100, 0, 0, 255,
        100, 0, 0, 255,

        100, 0, 0, 255,
        0, 100, 0, 255,
        100, 0, 0, 255,

        100, 0, 0, 255,
        100, 0, 0, 255,
        100, 0, 0, 255
      ]);
  });

  it("Scene rendering only diff", function() {
    var holder = {};
    var stub = {
      createImageData: function(width, height) {
        return {
          data: []
        }
      },
      putImageData: function(writableContext, x, y) {
        holder.writableContext = writableContext;
        holder.x = x;
        holder.y = y;
      }
    };
    var scene = {
      layers: [
        {
          mask: shapes.rectangle(0, 0, 3, 3),
          texture: function(x, y) { return color.create(100, 0, 0);}
        },
        {
          mask: shapes.rectangle(1, 1, 2, 2),
          texture: function(x, y) { return color.create(0, 100, 0);}
        }]

    };
    renderer.renderScene(scene, rectangle.create(1, 0, 3, 3), rectangle.create(0, 0, 3, 3), stub);
    expect(holder.writableContext.x).toEqual(1);
    expect(holder.writableContext.y).toEqual(0);
    expect(holder.writableContext.data).toEqual([
        100, 0, 0, 255,
        100, 0, 0, 255,

        0, 100, 0, 255,
        100, 0, 0, 255,

        100, 0, 0, 255,
        100, 0, 0, 255
      ]);
  });
});
}); // goog.scope