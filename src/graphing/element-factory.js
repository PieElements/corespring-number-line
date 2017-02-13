const BASE_COLOR = "#000";
const DEFAULT_POINT_RADIUS = 5;
const DEFAULT_TICK_SIZE = 20;
const SELECTED_COLOR = "#aaf";
const EMPTY_COLOR = "#fff";
const DEFAULT_STROKE_WIDTH = 3;
const DEFAULT_LINE_THICKNESS = 5;

import ScaleUtils from './scale';

export default function GraphElementFactory(graph, options) {

  function cancelEvent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  var that = graph;
  var factory = this;

  this.MovablePoint = function (pointModel, pointOptions) {
    var thisPoint = this;
    this.model = pointModel;
    this.options = pointOptions;
    this.selected = false;
    pointOptions = pointOptions || {};
    pointOptions = _.defaults(pointOptions || {}, {
      size: DEFAULT_POINT_RADIUS,
      strokeColor: BASE_COLOR,
      fillColor: pointOptions.pointType === 'empty' ? EMPTY_COLOR : BASE_COLOR,
      selectedFillColor: pointOptions.pointType === 'empty' ? EMPTY_COLOR : SELECTED_COLOR,
      selectedStrokeColor: SELECTED_COLOR
    });
    if (pointOptions.pointType === 'empty') {
      pointOptions.fillColor = EMPTY_COLOR;
    }

    this.detach = function () {
      this.point = undefined;
    };
    this.remove = function () {
      if (this.point) {
        this.point.remove();
      }
      this.detach();
    };
    this.moveTo = function (d, r) {
      var tickDp = that.horizontalAxis.scale.snapToTicks(that.horizontalAxis.ticks, d, options.snapPerTick + 1);
      if (tickDp !== pointModel.domainPosition) {
        pointModel.domainPosition = tickDp;
        this.draw();
      }
    };
    this.draw = function () {
      var start = function (x, y, ev) {
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
        this.animate({ r: pointOptions.size + 5, opacity: 0.25 }, 200, ">");
        this.hasMoved = false;
        cancelEvent(ev);
      };

      var move = function (dx, dy) {
        var newX = (this.ox + dx - options.margin.left);
        var dp = that.horizontalAxis.scale.invert(newX);
        var tickDp = that.horizontalAxis.scale.snapToTicks(that.horizontalAxis.ticks, dp, options.snapPerTick + 1);
        var dpx = that.horizontalAxis.scale(tickDp) + options.margin.left;
        this.attr({ cx: dpx });
        if (pointModel.domainPosition !== tickDp) {
          pointModel.domainPosition = tickDp;
          if (pointOptions.onMove) {
            pointOptions.onMove(tickDp);
          }
          options.applyCallback();
          this.hasMoved = true;
        }

      };
      var up = function (ev) {
        this.animate({ r: pointOptions.size, opacity: 1 }, 200, ">");
        if (!this.hasMoved) {
          thisPoint.selected = !thisPoint.selected;
          thisPoint.draw();
          if (pointOptions.onSelectionChanged) {
            pointOptions.onSelectionChanged(thisPoint.selected);
          }
          options.selectionChanged();
        } else {
          if (pointOptions.onMoveFinished) {
            pointOptions.onMoveFinished({
              type: 'point',
              pointType: pointOptions.pointType,
              domainPosition: pointModel.domainPosition,
              rangePosition: pointModel.rangePosition
            });
          }
        }
        cancelEvent(ev);
      };

      var x = that.horizontalAxis.scale(pointModel.domainPosition);
      var y = that.verticalAxis.scale(pointModel.rangePosition);
      if (_.isUndefined(this.point)) {
        this.point = that.paper.circle(x + options.margin.left, options.height - options.margin.bottom - options.axisHeight - y, pointOptions.size);
        if (!options.exhibitOnly) {
          this.point.drag(move, start, up);
          this.point.click(cancelEvent);
        }
      }
      this.point.attr("cx", x + options.margin.left);
      this.point.attr("cy", options.height - options.margin.bottom - options.axisHeight - y);
      this.point.attr("r", pointOptions.size);
      this.point.attr("fill", thisPoint.selected ? pointOptions.selectedFillColor : pointOptions.fillColor);
      this.point.attr("stroke", thisPoint.selected ? pointOptions.selectedStrokeColor : pointOptions.strokeColor);
      this.point.attr("stroke-width", DEFAULT_STROKE_WIDTH);

    };
    return this;
  };

  this.MovableLineSegment = function (lineModel, lineOptions) {
    lineOptions = _.defaults(lineOptions || {}, {
      size: 10,
      strokeColor: BASE_COLOR
    });

    var domainSize = Math.abs(options.domain[1] - options.domain[0]);
    var dp = domainSize / (options.tickFrequency - 1);

    lineModel.size = lineModel.size || dp;

    var thatLI = this;
    this.selected = false;
    this.model = lineModel;
    this.options = lineOptions;
    function updateLineModel() {
      lineModel.domainPosition = thatLI.p1.model.domainPosition;
      lineModel.rangePosition = thatLI.p1.model.rangePosition;
      lineModel.size = thatLI.p2.model.domainPosition - thatLI.p1.model.domainPosition;

      options.applyCallback();
    }

    var p1Opts = {
      strokeColor: lineOptions.strokeColor,
      fillColor: lineOptions.leftPoint === "empty" ? EMPTY_COLOR : lineOptions.strokeColor,
      selectedFillColor: lineOptions.leftPoint === "empty" ? EMPTY_COLOR : lineOptions.strokeColor,
      onMove: function (newPos) {
        thatLI.drawLine();
        updateLineModel();
      },
      onMoveFinished: function () {
        if (thatLI.p1.model.domainPosition > thatLI.p2.model.domainPosition) {
          var d1 = thatLI.p1.model.domainPosition;
          var d2 = thatLI.p2.model.domainPosition;
          thatLI.p2.moveTo(d1);
          thatLI.p1.moveTo(d2);
          var temp = lineModel.leftPoint;
          lineModel.leftPoint = lineModel.rightPoint;
          lineModel.rightPoint = temp;
          updateLineModel();
        }
        if (lineOptions.onMoveFinished) {
          lineOptions.onMoveFinished({
            type: 'line',
            leftPoint: lineOptions.leftPoint,
            rightPoint: lineOptions.rightPoint,
            domainPosition: thatLI.p1.model.domainPosition,
            rangePosition: thatLI.p1.model.rangePosition,
            size: lineModel.size
          });
        }
      },
      onSelectionChanged: function (sel) {
        thatLI.selected = sel;
        thatLI.p1.selected = sel;
        thatLI.p2.selected = sel;
        thatLI.draw();
      }
    };
    var p2Opts = _.extend(_.clone(p1Opts), {
      fillColor: lineOptions.rightPoint === "empty" ? EMPTY_COLOR : lineOptions.strokeColor,
      selectedFillColor: lineOptions.rightPoint === "empty" ? EMPTY_COLOR : lineOptions.strokeColor
    });

    this.p1 = new factory.MovablePoint({ domainPosition: lineModel.domainPosition, rangePosition: lineModel.rangePosition }, p1Opts);

    this.p2 = new factory.MovablePoint({ domainPosition: lineModel.domainPosition + lineModel.size, rangePosition: lineModel.rangePosition }, p2Opts);

    this.detach = function () {
      this.line = undefined;
      this.p1.detach();
      this.p2.detach();
    };

    this.remove = function () {
      if (this.line) {
        this.line.remove();
      }
      this.p1.remove();
      this.p2.remove();
      this.detach();
    };

    this.drawLine = function () {
      var x = options.margin.left + that.horizontalAxis.scale(this.p1.model.domainPosition);
      var x1 = options.margin.left + that.horizontalAxis.scale(this.p2.model.domainPosition);
      x += (x < x1) ? DEFAULT_POINT_RADIUS : -DEFAULT_POINT_RADIUS;
      var y = options.height - options.margin.bottom - options.axisHeight - that.verticalAxis.scale(lineModel.rangePosition);

      if (!this.line) {
        this.grabber = that.paper.line(x, y, x1, y);
        this.line = that.paper.line(x, y, x1, y);
        var start = function (x, y, ev) {
          this.ox = this.attr("cx");
          this.oy = this.attr("cy");
          this.op1d = thatLI.p1.model.domainPosition;
          this.op2d = thatLI.p2.model.domainPosition;
          this.hasMoved = false;
          thatLI.line.animate({ "stroke-width": 10, opacity: 0.25 }, 200, ">");
          cancelEvent(ev);
        };
        var move = function (dx, dy) {
          var domainSize = Math.abs(options.domain[1] - options.domain[0]);
          var dp = (dx / options.horizontalAxisLength) * domainSize;

          var p1d = Math.min(Math.max(this.op1d + dp, options.domain[0]), options.domain[1] - lineModel.size);
          thatLI.p1.moveTo(p1d, 0);
          thatLI.p2.moveTo(p1d + lineModel.size, 0);
          thatLI.grabber.x = thatLI.line.x = that.horizontalAxis.scale(thatLI.p1.model.domainPosition) + options.margin.left;
          thatLI.grabber.x1 = thatLI.line.x1 = that.horizontalAxis.scale(thatLI.p2.model.domainPosition) + options.margin.left;
          thatLI.line.redraw();
          thatLI.grabber.redraw();

          this.hasMoved = true;

        };
        var up = function (ev) {
          thatLI.line.animate({ "stroke-width": 6, opacity: 1 }, 200, ">");
          updateLineModel();

          if (!this.hasMoved) {
            thatLI.selected = thatLI.p1.selected = thatLI.p2.selected = !thatLI.selected;
            thatLI.draw();
            options.selectionChanged();
          } else {
            if (lineOptions.onMoveFinished) {
              lineOptions.onMoveFinished({
                type: 'line',
                leftPoint: lineOptions.leftPoint,
                rightPoint: lineOptions.rightPoint,
                domainPosition: thatLI.p1.model.domainPosition,
                rangePosition: thatLI.p1.model.rangePosition,
                size: lineModel.size
              });
            }
          }
          cancelEvent(ev);
        };

        if (!options.exhibitOnly) {
          this.line.drag(move, start, up);
          this.line.click(cancelEvent);
          this.grabber.drag(move, start, up);
          this.grabber.click(cancelEvent);
        }
      }
      this.grabber.x = this.line.x = x;
      this.grabber.y = this.line.y = y;
      this.grabber.x1 = this.line.x1 = x1;
      this.grabber.y1 = this.line.y1 = y;
      this.grabber.attr({ "stroke-width": "30", "stroke": "#9aa", opacity: 0 });
      this.grabber.redraw();
      this.line.attr({ "stroke-width": DEFAULT_LINE_THICKNESS, "stroke": thatLI.selected ? SELECTED_COLOR : lineOptions.strokeColor });
      this.line.redraw();
    };

    this.draw = function () {
      this.drawLine();
      this.p1.draw();
      this.p2.draw();
    };

    return this;
  };

  this.MovableRay = function (lineModel, lineOptions) {
    lineOptions = _.defaults(lineOptions || {}, {
      direction: "positive",
      strokeColor: BASE_COLOR
    });
    var thatLI = this;

    this.selected = false;
    this.model = lineModel;
    this.options = lineOptions;

    function updateLineModel() {
      lineModel.domainPosition = thatLI.p1.model.domainPosition;
      lineModel.rangePosition = thatLI.p1.model.rangePosition;
      options.applyCallback();
    }

    this.p1 = new factory.MovablePoint({ domainPosition: lineModel.domainPosition, rangePosition: lineModel.rangePosition }, {
      strokeColor: lineOptions.strokeColor,
      fillColor: lineOptions.pointType === "empty" ? EMPTY_COLOR : lineOptions.strokeColor,
      selectedFillColor: lineOptions.pointType === "empty" ? EMPTY_COLOR : lineOptions.strokeColor,
      onMove: function (newPos) {
        thatLI.drawLine();
        updateLineModel();

      },
      onMoveFinished: function () {
        if (lineOptions.onMoveFinished) {
          lineOptions.onMoveFinished({
            type: 'ray',
            pointType: lineOptions.pointType,
            domainPosition: thatLI.p1.model.domainPosition,
            rangePosition: thatLI.p1.model.rangePosition,
            direction: lineOptions.direction
          });
        }
      },
      onSelectionChanged: function (sel) {
        thatLI.selected = sel;
        thatLI.draw();
      }
    });

    this.detach = function () {
      this.line = undefined;
      this.p1.detach();
    };

    this.remove = function () {
      if (this.line) {
        this.line.remove();
      }
      this.p1.remove();
      this.detach();
    };

    this.drawLine = function () {
      var x = options.margin.left + that.horizontalAxis.scale(this.p1.model.domainPosition);
      var x1 = options.margin.left + that.horizontalAxis.scale(options.domain[lineOptions.direction === "positive" ? 1 : 0]);
      var y = options.height - options.margin.bottom - options.axisHeight - that.verticalAxis.scale(lineModel.rangePosition);

      var dx = lineOptions.direction === "positive" ? 10 : -10;

      if (!this.line) {
        this.grabber = that.paper.line(x, y, x1 + dx, y);
        this.line = that.paper.line(x, y, x1 + dx, y);
        var adx = dx + (lineOptions.direction === "positive" ? 8 : 0);
        var arrowFn = lineOptions.direction === "positive" ? that.paper.rightArrow : that.paper.leftArrow;
        this.arrow = arrowFn(x1 + adx - 8, y, 8, 8).attr({ stroke: BASE_COLOR, fill: BASE_COLOR });

        var fn = function (ev) {
          thatLI.selected = thatLI.p1.selected = !thatLI.selected;
          thatLI.draw();
          options.selectionChanged();
          cancelEvent(ev);
        };
        if (!options.exhibitOnly) {
          this.line.mousedown(fn);
          this.grabber.mousedown(fn);
        }

      }
      this.grabber.x = this.line.x = x;
      this.grabber.y = this.line.y = y;
      this.grabber.x1 = this.line.x1 = x1 + dx;
      this.grabber.y1 = this.line.y1 = y;
      this.line.redraw();
      this.grabber.redraw();
      var color = this.selected ? SELECTED_COLOR : lineOptions.strokeColor;
      this.line.attr({ "stroke-width": "6", "stroke": color });
      this.grabber.attr({ "stroke-width": "20", "opacity": 0 });
      this.arrow.attr({ stroke: color, fill: color });

    };
    this.draw = function (paper) {
      this.drawLine();
      this.p1.draw(paper);

    };
    return this;
  };

  this.HorizontalAxis = function (position, axisOptions) {
    var thatHA = this;
    this.elements = [];
    axisOptions = _.defaults(axisOptions || {}, {
      tickFrequency: 20,
      snapPerTick: 4,
      visible: true,
      axisColor: '#000000'
    });

    this.reCalculate = function () {
      this.scale = ScaleUtils.linear().domain(options.domain).range([0, options.horizontalAxisLength]);
      if (axisOptions.ticks) {
        this.ticks = _.map(axisOptions.ticks, function (t) {
          return t.value;
        });
        this.tickLabels = _.map(axisOptions.ticks, function (t) {
          return t.label;
        });
      } else {
        this.ticks = this.scale.ticks(Math.max(axisOptions.tickFrequency - 1, 1));
        this.tickLabelOverrides = axisOptions.tickLabelOverrides;
      }
    };

    this.reCalculate();

    this.remove = function () {
      _.each(thatHA.element, function (e) {
        e.remove();
      });
    };

    this.draw = function (paper) {
      var y;
      switch (position) {
        case "top":
          y = options.margin.top + options.axisHeight;
          break;
        case "middle":
          y = options.margin.top + options.verticalAxisLength / 2;
          break;
        default:
          y = options.height - options.margin.bottom - options.axisHeight;
          break;
      }
      thatHA.elements.push(paper.leftArrow(options.margin.left - 18, y, 8, 5).attr({
        fill: axisOptions.axisColor,
        stroke: axisOptions.axisColor
      }));
      thatHA.elements.push(paper.rightArrow(options.margin.left + options.horizontalAxisLength + 10, y, 8, 5).attr({
        fill: axisOptions.axisColor,
        stroke: axisOptions.axisColor
      }));
      thatHA.elements.push(paper.line(options.margin.left - 10, y, options.margin.left + options.horizontalAxisLength + 20, y).attr({
        stroke: axisOptions.axisColor
      }));


      var scale = thatHA.scale;
      var tickSize = DEFAULT_TICK_SIZE;

      _(thatHA.ticks).each(function (tick, idx) {
        var x = scale(tick);

        thatHA.elements.push(paper.line(options.margin.left + x, y - tickSize / 2, options.margin.left + x, y + tickSize / 2).attr({
          stroke: axisOptions.axisColor
        }));

        var override = _.find(thatHA.tickLabelOverrides, function (t) {
          return t.tick === tick;
        });
        var tickLabel = override ? override.label : tick.toFixed(2).replace(/\.00/, '');
        var label = thatHA.tickLabels ? thatHA.tickLabels[idx] : tickLabel;

        if (_.isEmpty(label.toString()) && !_.isUndefined(options.placeholderForEmptyTickLabel)) {
          label = options.placeholderForEmptyTickLabel;
        }

        var text = paper.text(options.margin.left + x, options.height - options.margin.bottom, label);

        // Below is a workaround for a RaphaelJS bug. See https://github.com/DmitryBaranovskiy/raphael/issues/772
        $('tspan', text.node).attr('dy', 0);

        if (options.labelCursor) {
          text.attr('cursor', options.labelCursor);
        }

        text.click(function (event) {
          if (_.isFunction(options.tickLabelClick)) {
            options.tickLabelClick(tick, x);
            event.stopImmediatePropagation();
          }
        });
        thatHA.elements.push(text);

        var snapPerTick = axisOptions.snapPerTick + 1;
        var d = Math.abs(thatHA.ticks[idx + 1] - thatHA.ticks[idx]) / snapPerTick;

        if (axisOptions.showMinorTicks && idx < thatHA.ticks.length - 1) {
          for (var i = 1; i < snapPerTick; i++) {
            thatHA.elements.push(paper.line(options.margin.left + scale(tick + d * i), y - tickSize / 4, options.margin.left + scale(tick + d * i), y + tickSize / 4).attr({
              stroke: axisOptions.axisColor
            }));
          }
        }
      });
    };

    return this;
  };

  this.VerticalAxis = function (position, axisOptions) {
    var thatVA = this;
    thatVA.elements = [];
    axisOptions = _.defaults(axisOptions || {}, {
      tickFrequency: 10,
      visible: true
    });
    this.reCalculate = function () {
      this.scale = ScaleUtils.linear().domain(options.range).range([0, options.verticalAxisLength]);
    };
    this.reCalculate();

    this.detach = function () {
    };

    this.remove = function () {
      _.each(thatVA.element, function (e) {
        e.remove();
      });
    };

    this.draw = function (paper) {
      if (!axisOptions.visible) {
        return;
      }
      var x;
      switch (position) {
        case "left":
          x = 30;
          break;
        case "middle":
          x = options.margin.left + options.horizontalAxisLength / 2;
          break;
        default:
          x = options.margin.left + options.horizontalAxisLength;
          break;
      }
      thatVA.elements.push(paper.line(x, options.margin.top, x, options.margin.top + options.verticalAxisLength));

      var scale = thatVA.scale;
      var ticks = scale.ticks(axisOptions.tickFrequency);
      var tickSize = 10;

      _.each(ticks, function (tick, idx) {
        var y = scale(tick);
        thatVA.elements.push(paper.line(x - 5, options.margin.top + y, x + 5, options.margin.top + y));
        thatVA.elements.push(paper.text(x - 15, options.height - options.margin.bottom - 20 - y, tick));
      });

    };

    return this;
  };


  return this;
};
