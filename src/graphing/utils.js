import ScaleUtils from './scale';
import GraphElementFactory from './element-factory';
import RaphaelDecorator from './raphael-decorator';
import Raphael from 'raphael';
import _ from 'lodash';

export function GraphUtils(element, options) {

  var PLANE_SIZE = 30;

  var that = this;

  var graphElementFactory = new GraphElementFactory(that, options);

  options = options || {};
  _.defaults(options, {
    margin: { top: 0, right: 30, bottom: 30, left: 30 },
    numberOfPlanes: 3,
    axisHeight: 20,
    domain: [0, 20],
    range: [0, 20],
    applyCallback: function () {
    },
    clickAreaMouseDown: function () {
    },
    tickLabelClick: function (tick) {
    },
    selectionChanged: function () {
    }
  });
  _.defaults(options, {
    width: (options.horizontalAxisLength + options.margin.left + options.margin.right),
    height: (options.verticalAxisLength + options.margin.top + options.margin.bottom) + options.axisHeight
  });

  this.elements = [];

  this.coordsToDomainRange = function (x, y) {
    var dp = this.horizontalAxis.scale.invert(x - options.margin.left);
    dp = this.horizontalAxis.scale.snapToTicks(this.horizontalAxis.ticks, dp, options.snapPerTick + 1);
    var rp = this.horizontalAxis.scale.invert(options.verticalAxisLength - y);
    return [dp, rp];
  };

  this.updateOptions = function (newOptions) {
    var allOptionsEqual = _.every(newOptions, function (v, k) {
      return _.isEqual(options[k], v);
    });
    if (allOptionsEqual) {
      return;
    }

    options.verticalAxisLength = newOptions.explicitHeight || options.numberOfPlanes * PLANE_SIZE;
    options.height = (options.verticalAxisLength + options.margin.top + options.margin.bottom) + options.axisHeight + 10;

    $(element).width(options.width);
    $(element).height(options.height);

    if (this.paper) {
      this.paper.remove();
    }

    this.paper = RaphaelDecorator.decoratePaper(Raphael(element, options.width, options.height));
    this.paper.rect(0, 0, options.width, options.height);

    this.width = options.width;
    this.height = options.height;
    this.margin = options.margin;

    options = _.extend(options, newOptions);
    options.range = [0, options.numberOfPlanes - 1];
    if (that.horizontalAxis) {
      that.horizontalAxis.reCalculate();
    }
    if (that.verticalAxis) {
      that.verticalAxis.reCalculate();
    }
    that.redraw();
  };

  this.getSelectedElements = function () {
    var selectedElements = [];
    _.each(this.elements, function (e) {
      if (e.selected) {
        selectedElements.push(e.model);
      }
    });
    return selectedElements;
  };

  this.clear = function () {
    _.each(that.elements, function (element) {
      if (element.detach) {
        element.detach();
      }
    });
    if (that.paper) {
      that.paper.clear();
    }
    this.elements = [];
    this.redraw();
  };

  this.redraw = function () {
    _.each(that.elements, function (element) {
      if (element.detach) {
        element.detach();
      }
    });
    if (that.paper) {
      that.paper.clear();
      var clickArea = that.paper.rect(options.margin.left - 10, 0, options.margin.left + options.horizontalAxisLength, options.height - options.margin.bottom - 10);
      clickArea.attr('fill', 'black').attr('opacity', 0);
      clickArea.mousedown(function (ev) {
        var offX = ev.offsetX || ((ev.pageX - $(ev.target).offset().left) + options.margin.left - 10);
        var offY = ev.offsetY || ((ev.pageY - $(ev.target).offset().top));
        options.clickAreaMouseDown({ offX: offX, offY: offY });
        //https://developer.mozilla.org/en-US/docs/Web/API/Touch?
        if (typeof Touch !== "undefined" && ev instanceof Touch) {
          // Cancel the subsequent mousedown after touch
          ev.stopPropagation();
          ev.preventDefault();
        }
      });

      if (that.horizontalAxis) {
        that.horizontalAxis.draw(that.paper);
      }
      if (that.verticalAxis) {
        that.verticalAxis.draw(that.paper);
      }
      _.each(that.elements, function (element) {
        element.draw(that.paper);
      });
    }
  };

  this.getUnitSize = function () {
    var domainSize = Math.abs(options.domain[1] - options.domain[0]);
    var dp = domainSize / (options.tickFrequency - 1);

    return dp;
  };

  this.addHorizontalAxis = function (position, axisOptions) {
    if (that.horizontalAxis) {
      that.horizontalAxis.remove();
    }
    that.horizontalAxis = new graphElementFactory.HorizontalAxis(position, axisOptions, options);
  };

  this.addVerticalAxis = function (position, axisOptions) {
    if (that.verticalAxis) {
      that.verticalAxis.remove();
    }
    that.verticalAxis = new graphElementFactory.VerticalAxis(position, axisOptions, options);
  };

  this.addMovablePoint = function (pointModel, pointOptions) {
    that.elements.push(new graphElementFactory.MovablePoint(pointModel, pointOptions));
  };

  this.addMovableLineSegment = function (lineModel, lineOptions) {
    that.elements.push(new graphElementFactory.MovableLineSegment(lineModel, lineOptions));
  };

  this.addMovableRay = function (lineModel, lineOptions) {
    that.elements.push(new graphElementFactory.MovableRay(lineModel, lineOptions));
  };
};
