export function decoratePaper(raphaelPaper) {
  raphaelPaper.line = function (x, y, x1, y1) {
    var o = raphaelPaper.path(["M", x, y, "L", x1, y1]);
    o.x = x;
    o.y = y;
    o.x1 = x1;
    o.y1 = y1;
    o.redraw = function () {
      o.attr('path', ["M", o.x, o.y, "L", o.x1, o.y1]);
    };
    return o;
  };

  raphaelPaper.leftArrow = function (x, y, w, h) {
    var path = "M" + x + "," + y;
    path += "L" + (x + w) + "," + (y - h);
    path += "L" + (x + w) + "," + (y + h);
    path += "L" + x + "," + y;
    return raphaelPaper.path(path);
  };

  raphaelPaper.rightArrow = function (x, y, w, h) {
    var path = "M" + (x + w) + "," + y;
    path += "L" + x + "," + (y - h);
    path += "L" + x + "," + (y + h);
    path += "L" + (x + w) + "," + y;
    return raphaelPaper.path(path);
  };

  return raphaelPaper;
}