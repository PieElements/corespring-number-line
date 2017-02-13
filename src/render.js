/* global console, exports */

var main = [
  '$sce', '$log',
  function ($sce, $log) {

    "use strict";

    var def;

    var link = function (scope, element, attrs) {

      scope.editable = true;
      scope.response = {};
      scope.answerExpanded = false;


      scope.changeHandler = function () {
        if (_.isFunction(scope.answerChangeCallback)) {
          scope.answerChangeCallback();
        }
      };

      scope.noResponseOptions = {
        explicitHeight: 10
      };

      scope.containerBridge = {
        setPlayerSkin: function (skin) {
          scope.iconset = skin.iconSet;
          scope.colors = {
            correct: skin.colors['correct-background'],
            incorrect: skin.colors['incorrect-background'],
            axis: 'rgb(0, 0, 0)',
            disabled: 'rgb(150, 150, 150)'
          };
        },

        setDataAndSession: function (dataAndSession) {
          $log.debug("number line", dataAndSession);

          scope.model = dataAndSession.data.model;
          scope.correctModel = dataAndSession.data.model;
          scope.editable = !scope.model.config.exhibitOnly;
          scope.configuredInitialElements = _.cloneDeep(scope.model.config.initialElements) || [];
          scope.options = { exhibitOnly: scope.model.config.exhibitOnly };

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.response = dataAndSession.session.answers;
            scope.model.config.initialElements = _.cloneDeep(dataAndSession.session.answers);
          }
        },

        getSession: function () {
          return {
            answers: scope.response
          };
        },

        setInstructorData: function (data) {
          console.log('sid', data);
          var cr = _.cloneDeep(data.correctResponse);
          _.each(cr, function (c) {
            c.isCorrect = true;
          });
          this.setResponse({ correctness: 'correct', feedback: { elements: cr } });
          this.editable(false);
        },

        setResponse: function (response) {
          $log.debug('number line response ', response);
          if (_.isEmpty(response)) {
            scope.serverResponse = scope.correctModel = scope.correctModelDummyResponse = undefined;
          } else {
            scope.serverResponse = response;

            scope.correctModel = _.cloneDeep(scope.model);
            scope.correctModel.config.exhibitOnly = true;
            scope.correctModel.config.margin = {
              top: 30,
              right: 10,
              bottom: 30,
              left: 20
            };

            var i = 0;
            scope.correctModelDummyResponse = {
              feedback: {
                elements: _.map(response.correctResponse, function (cr) {
                  i++;
                  return _.extend(cr, {
                    rangePosition: i,
                    isCorrect: true
                  });
                })
              }
            };
          }
        },

        setMode: function (newMode) {
          if (newMode === 'gather' || newMode === 'view') {
            _.each(scope.response, function (o, level) {
              o.isCorrect = undefined;
            });
            if (scope.rebuildHook) {
              scope.rebuildHook();
            }
          }
        },

        reset: function () {
          scope.responsemodel = [];
          scope.serverResponse = 'reset';
          scope.answerExpanded = false;
        },

        isAnswerEmpty: function () {
          var answers = this.getSession().answers;
          return _.isEmpty(answers) || _.isEqual(answers, scope.configuredInitialElements);
        },

        answerChangedHandler: function (callback) {
          scope.answerChangeCallback = callback;
        },

        editable: function (e) {
          scope.editable = e;
        }
      };

      scope.$watch('answerExpanded', function () {
        scope.$broadcast('setVisible', scope.answerExpanded ? 1 : 0);
      });


      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      replace: true,
      restrict: 'EA',
      link: link,
      template: [
        '<div class="view-number-line">',
        '  <correct-answer-toggle visible="serverResponse && serverResponse.correctness === \'incorrect\'" toggle="answerExpanded"></correct-answer-toggle>',
        '  <response-wrapper ng-show="serverResponse.correctness !== \'warning\'">',
        '    <div interactive-graph',
        '        ngModel="model"',
        '        options="options"',
        '        responseModel="response"',
        '        serverResponse="serverResponse"',
        '        changeHandler="changeHandler()"',
        '        rebuildHook="rebuildHook"',
        '        editable="editable"',
        '        colors="colors">',
        '    </div>',
        '    <div class="solution" interactive-graph ng-if="serverResponse"',
        '        ngModel="correctModel"',
        '        serverResponse="correctModelDummyResponse"',
        '        responseModel="dummyResponse"',
        '        colors="colors">',
        '    </div>',
        '  </response-wrapper>',
        '  <div ng-if="serverResponse && serverResponse.correctness == \'warning\'" class="no-response">',
        '    <div interactive-graph',
        '         ngModel="correctModel"',
        '         responseModel="dummyResponse"',
        '         options="noResponseOptions"></div>',
        '  </div>',
        '  <div ng-if="!answerExpanded">',
        '    <div feedback="serverResponse.feedback.message" icon-set="{{iconset}}" correct-class="{{serverResponse.correctClass}}"></div>',
        '  </div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

var interactiveGraph = [
  '$log', 'ScaleUtils', 'GraphHelper', 'CsUndoModel',
  function ($log, ScaleUtils, GraphHelper, CsUndoModel) {

    "use strict";

    var groups = {
      "Point": ["PF", "PE"],
      "Line": ["LEE", "LEF", "LFE", "LFF"],
      "Ray": ["REP", "REN", "RFP", "RFN"]
    };

    var NUMBER_OF_PLANES = 6;
    var HORIZONTAL_AXIS_WIDTH = 480;

    var pointEqual = function (p1, p2) {
      return Math.abs(p1 - p2) < 0.01;
    };

    var pointLessThanOrEqual = function (p1, p2) {
      return p1 < p2 + 0.01;
    };

    var pointGreaterThanOrEqual = function (p1, p2) {
      return p1 > p2 - 0.01;
    };


    return {
      template: [
        '<div class="interactive-graph">',
        '  <div class="undo-button-row" ng-show="editable">',
        '    <span cs-undo-button-with-model ng-hide="options.undoDisabled"></span>',
        '    <span cs-start-over-button-with-model ></span>',
        '  </div>',
        '  <div class="clearfix"></div>',
        '  <ul ng-show="editable && config.groupingEnabled" class="nav nav-pills">',
        '    <li role="presentation" ng-show="isGroupEnabled(\'Point\')" ng-class="{active: isGroupActive(\'Point\')}"  ng-mousedown="selectGroup(\'Point\')"><a>Point</a></li>',
        '    <li role="presentation" ng-show="isGroupEnabled(\'Line\')" ng-class="{active: isGroupActive(\'Line\')}" ng-mousedown="selectGroup(\'Line\')"><a>Line</a></li>',
        '    <li role="presentation"  ng-show="isGroupEnabled(\'Ray\')" ng-class="{active: isGroupActive(\'Ray\')}" ng-mousedown="selectGroup(\'Ray\')"><a>Ray</a></li>',
        '  </ul>',
        '  <div ng-show="editable && !config.exhibitOnly && multipleInputTypes()" class="element-selector">',
        '    <span role="presentation" class="element-pf" ng-show="isGroupActive(\'Point\') && isTypeEnabled(\'PF\')"   ng-mousedown="select(\'PF\')"><a ng-class="{active: isActive(\'PF\')}">&nbsp;</a></span>',
        '    <span role="presentation" class="element-pe" ng-show="isGroupActive(\'Point\') && isTypeEnabled(\'PE\')"   ng-mousedown="select(\'PE\')"><a ng-class="{active: isActive(\'PE\')}">&nbsp;</a></span>',
        '    <span role="presentation" class="element-lff" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LFF\')"  ng-mousedown="select(\'LFF\')"><a ng-class="{active: isActive(\'LFF\')}">&nbsp;</a></span>',
        '    <span role="presentation" class="element-lef" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LEF\')"  ng-mousedown="select(\'LEF\')"><a ng-class="{active: isActive(\'LEF\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-lfe" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LFE\')"  ng-mousedown="select(\'LFE\')"><a ng-class="{active: isActive(\'LFE\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-lee" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LEE\')"  ng-mousedown="select(\'LEE\')"><a ng-class="{active: isActive(\'LEE\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-rfn" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'RFN\')"  ng-mousedown="select(\'RFN\')"><a ng-class="{active: isActive(\'RFN\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-rfp" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'RFP\')" ng-mousedown="select(\'RFP\')"><a ng-class="{active: isActive(\'RFP\')}" >&nbsp;</a></span>',
        '    <span role="presentation"  class="element-ren" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'REN\')"  ng-mousedown="select(\'REN\')"><a ng-class="{active: isActive(\'REN\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-rep" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'REP\')"  ng-mousedown="select(\'REP\')"><a ng-class="{active: isActive(\'REP\')}">&nbsp;</a></span>',
        '  </div>',
        '  <div class="remove-element"><a ng-click="removeSelectedElements()" ng-show="selected.length > 0"><i class="bin-icon fa fa-trash-o fa-lg"></i></a></div>',
        "  <div class='paper'></div>",
        "</div>"
      ].join(''),
      replace: true,
      scope: {
        colors: "=",
        model: "=ngmodel",
        responsemodel: "=",
        serverresponse: "=",
        editable: "=",
        options: "=",
        changehandler: "&changehandler",
        ticklabelclick: "=",
        rebuildhook: "=?"
      },
      controller: function ($scope) {
        //set default config to avoid npe
        $scope.config = {
          availableTypes: {}
        };
      },
      link: function (scope, elm, attr, ngModel) {
        var paperElement = $(elm).find('.paper');

        scope.undoModel = new CsUndoModel();
        scope.undoModel.setGetState(getState);
        scope.undoModel.setRevertState(revertState);

        $(document).keydown(function (e) {
          var selectedCount = scope.graph.getSelectedElements().length;
          if (selectedCount > 0 && (e.keyCode === 8 || e.keyCode === 46)) {
            e.stopPropagation();
            e.preventDefault();
            scope.removeSelectedElements();
            scope.$apply();
          }
        });

        scope.addElement = function (domainPosition, elementType) {
          if (!scope.editable || scope.model.config.exhibitOnly) {
            return;
          }
          if (scope.responsemodel.length >= (scope.config.maxNumberOfPoints || 3)) {
            return;
          }
          scope.responsemodel.push(element(elementType));
          rebuildGraph(_.last(scope.responsemodel));
          scope.undoModel.remember();
          scope.$apply();

          function element(elementType) {
            switch (elementType) {
              case "PF":
                return point({});
              case "PE":
                return point({
                  pointType: 'empty'
                });
              case "LEE":
                return line({});
              case "LEF":
                return line({
                  "rightPoint": "full"
                });
              case "LFE":
                return line({
                  "leftPoint": "full"
                });
              case "LFF":
                return line({
                  "leftPoint": "full",
                  "rightPoint": "full"
                });
              case "REN":
                return ray({
                  pointType: "empty",
                  direction: "negative"
                });
              case "REP":
                return ray({
                  pointType: "empty",
                  direction: "positive"
                });
              case "RFN":
                return ray({
                  pointType: "full",
                  direction: "negative"
                });
              case "RFP":
                return ray({
                  pointType: "full",
                  direction: "positive"
                });
            }
          }

          function point(params) {
            return _.extend({
              "type": "point",
              "pointType": "full",
              "domainPosition": domainPosition,
              "rangePosition": 0
            }, params);
          }

          function line(params) {
            return _.extend({
              "type": "line",
              "size": scope.graph.getUnitSize(),
              "domainPosition": domainPosition,
              "rangePosition": 0,
              "leftPoint": "empty",
              "rightPoint": "empty"
            }, params);
          }

          function ray(params) {
            return _.extend({
              "type": "ray",
              "domainPosition": domainPosition,
              "rangePosition": 0,
              "pointType": "empty"
            }, params);
          }
        };

        scope.graph = new GraphHelper(paperElement[0], {
          horizontalAxisLength: HORIZONTAL_AXIS_WIDTH,
          domain: [0, 10],
          range: [0, NUMBER_OF_PLANES],
          numberOfPlanes: NUMBER_OF_PLANES,
          applyCallback: function () {
            scope.$apply();
          },
          clickAreaMouseDown: function (event) {
            var offX = event.offX;
            var offY = event.offY;
            var dr = scope.graph.coordsToDomainRange(offX, offY);
            scope.addElement(dr[0], scope.selectedType);

          },
          tickLabelClick: function (dp, x) {
            if (_.isFunction(scope.ticklabelclick)) {
              scope.ticklabelclick(dp, x);
            }
          },
          selectionChanged: function () {
            scope.selected = scope.graph.getSelectedElements();
            scope.$apply();
          }
        });

        function isIntersecting(element, withElement) {
          if (element.rangePosition !== withElement.rangePosition) {
            return false;
          }
          if (element.type === 'point') {
            switch (withElement.type) {
              case 'point':
                return pointEqual(element.domainPosition, withElement.domainPosition);
              case 'line':
                return (pointGreaterThanOrEqual(element.domainPosition, withElement.domainPosition) && pointLessThanOrEqual(element.domainPosition, withElement.domainPosition + withElement.size));
              case 'ray':
                if (withElement.direction === 'positive') {
                  return pointGreaterThanOrEqual(element.domainPosition, withElement.domainPosition);
                } else {
                  return pointLessThanOrEqual(element.domainPosition, withElement.domainPosition);
                }
            }
          } else if (element.type === 'line') {
            switch (withElement.type) {
              case 'point':
                return isIntersecting(withElement, element);
              case 'line':
                return (pointGreaterThanOrEqual(element.domainPosition, withElement.domainPosition) && pointLessThanOrEqual(element.domainPosition, withElement.domainPosition + withElement.size)) ||
                  (pointGreaterThanOrEqual(withElement.domainPosition, element.domainPosition) && pointLessThanOrEqual(withElement.domainPosition, element.domainPosition + element.size));
              case 'ray':
                if (withElement.direction === 'positive') {
                  return pointGreaterThanOrEqual(element.domainPosition + element.size, withElement.domainPosition);
                } else {
                  return pointLessThanOrEqual(element.domainPosition, withElement.domainPosition);
                }
            }
          } else if (element.type === 'ray') {
            switch (withElement.type) {
              case 'point':
                return isIntersecting(withElement, element);
              case 'line':
                return isIntersecting(withElement, element);
              case 'ray':
                if (element.direction === withElement.direction) {
                  return true;
                }
                if (element.direction === 'positive') {
                  return pointGreaterThanOrEqual(withElement.domainPosition, element.domainPosition);
                } else {
                  return pointLessThanOrEqual(withElement.domainPosition, element.domainPosition);
                }
            }
          }
        }

        function repositionElements(lastMovedElement) {

          if (lastMovedElement) {
            while (intersectsWithAny(lastMovedElement)) {
              lastMovedElement.rangePosition++;
            }
          }
          var elementsSortedByRangePosition = _.sortBy(scope.responsemodel, function (e) {
            return e.rangePosition;
          });

          _.each(elementsSortedByRangePosition, function (e) {
            e.rangePosition = 0;
            while (intersectsWithAny(e)) {
              e.rangePosition++;
            }
          });

          function intersectsWithAny(e) {
            return _.any(scope.responsemodel, function (r) {
              return e !== r && isIntersecting(e, r);
            });
          }
        }

        // Clear out graph and rebuild it from the model
        function rebuildGraph(lastMovedElement) {
          scope.graph.clear();
          repositionElements(lastMovedElement);
          _.each(scope.responsemodel, function (o, level) {
            var options = _.cloneDeep(o);
            if (!_.isUndefined(o.isCorrect)) {
              options.fillColor = options.strokeColor = o.isCorrect ? scope.colors.correct : scope.colors.incorrect;
            } else if (scope.editable === false && scope.options.exhibitOnly === false) {
              options.fillColor = options.strokeColor = scope.colors.disabled;
            }
            options.onMoveFinished = function (element) {
              var lastMovedElement = _.find(scope.responsemodel, function (e) {
                return _.isEqual(e, element);
              });
              rebuildGraph(lastMovedElement);
              scope.$apply(function () {
                scope.undoModel.remember();
              });
            };
            switch (o.type) {
              case "point":
                scope.graph.addMovablePoint(o, options);
                break;
              case "line":
                scope.graph.addMovableLineSegment(o, options);
                break;
              case "ray":
                scope.graph.addMovableRay(o, options);
                break;
            }
          });
          scope.graph.redraw();
          scope.selected = [];
        }

        scope.startOver = function () {
          if (scope.options && scope.options.startOverClearsGraph) {
            scope.responsemodel = _.cloneDeep([]);
          } else {
            scope.responsemodel = _.cloneDeep(scope.model.config.initialElements);
          }
          scope.undoModel.init();
          rebuildGraph();
        };

        function getState() {
          return scope.responsemodel;
        }

        function revertState(state) {
          scope.responsemodel = state;
          rebuildGraph();
        }

        scope.removeElement = function (element) {
          var idx = _.findIndex(scope.responsemodel, function (e) {
            return (e.type === element.type && e.rangePosition === element.rangePosition && e.domainPosition === element.domainPosition);
          });
          if (idx >= 0) {
            scope.responsemodel.splice(idx, 1);
          }
          rebuildGraph();
          scope.undoModel.remember();
        };

        scope.removeSelectedElements = function () {
          var selectedElements = scope.graph.getSelectedElements();
          scope.selected = selectedElements;
          _.each(selectedElements, function (e) {
            scope.removeElement(e);
          });
        };

        scope.isActive = function (type) {
          return type === scope.selectedType;
        };

        scope.select = function (type) {
          scope.selectedType = type;
        };

        scope.multipleInputTypes = function () {
          if (scope.model) {
            return (_.chain(scope.model.config.availableTypes)
              .values()
              .filter(function (value) {
                return value === true;
              })
              .value().length) > 1;
          }
        };

        scope.isGroupEnabled = function (group) {
          return _.some(groups[group], function (type) {
            return scope.config.availableTypes[type] === true;
          });
        };

        scope.isGroupActive = function (group) {
          if (!scope.config.groupingEnabled) {
            return true;
          }
          return group === scope.selectedGroup;
        };

        scope.selectGroup = function (group) {
          scope.selectedGroup = group;
        };

        scope.isTypeEnabled = function (type) {
          return scope.config.availableTypes[type] === true;
        };

        scope.rebuildhook = rebuildGraph;

        scope.resetGraph = function (model) {
          scope.answerExpanded = false;
          scope.graph.updateOptions(_.merge(_.cloneDeep(model.config), scope.options));
          scope.graph.addHorizontalAxis("bottom", {
            ticks: model.config.ticks,
            tickLabelOverrides: model.config.tickLabelOverrides,
            tickFrequency: model.config.tickFrequency || 10,
            snapPerTick: model.config.snapPerTick,
            showMinorTicks: model.config.showMinorTicks,
            axisColor: scope.colors && scope.colors.axis
          });
          scope.graph.addVerticalAxis("left", {
            visible: false
          });

          scope.responsemodel = _.cloneDeep(model.config.initialElements) || [];
          scope.undoModel.init();
          rebuildGraph();

          scope.selectedType = scope.selectedType || model.config.initialType;
          if (model.config.availableTypes[scope.selectedType] !== true) {
            var foundAvailable = false;
            for (var k in model.config.availableTypes) {
              if (model.config.availableTypes[k] === true) {
                scope.selectedType = k;
                foundAvailable = true;
                break;
              }
            }
            if (!foundAvailable) {
              scope.selectedType = 'PF';
            }
          }

          scope.selectedGroup = _.find(_.keys(groups), function (g) {
            return _.contains(groups[g], scope.selectedType);
          });
        };

        scope.updatedModel = null;
        scope.updatedServerResponse = null;

        scope.renderModel = function (newModel) {
          //overwrite default config with real config
          if (newModel.config) {
            scope.config = newModel.config;
          }
          var render = function () {
            scope.resetGraph(newModel);
          };
          return render;
        };

        scope.resetServerResponse = function () {
          var render = function () {
            scope.resetGraph(scope.model);
          };
          return render;
        };

        scope.renderFeedback = function (newServerResponse) {
          var render = function () {
            scope.responsemodel = _.cloneDeep(newServerResponse.feedback.elements) || [];
            rebuildGraph();
            scope.graph.updateOptions({
              exhibitOnly: true
            });
          };
          return render;
        };

        scope.renderPreviousResponseModel = function () {
          var render = function () {
            var rm = _.cloneDeep(scope.responsemodel);
            scope.resetGraph(scope.model);
            scope.responsemodel = rm;
            rebuildGraph();
          };
          return render;
        };

        scope.updateGraph = function updateGraph() {
          var render;

          if (scope.updatedModel) {
            render = scope.renderModel(scope.updatedModel);
            scope.updatedModel = null;
          }

          if (scope.updatedServerResponse) {
            var newServerResponse = scope.updatedServerResponse.newValue;
            var oldServerResponse = scope.updatedServerResponse.oldValue;
            if (newServerResponse === 'reset') {
              render = scope.resetServerResponse();
              scope.updatedServerResponse = null;
            } else if (!_.isEmpty(newServerResponse) && !_.isEmpty(newServerResponse.feedback)) {
              render = scope.renderFeedback(newServerResponse);
            } else if (oldServerResponse) {
              render = scope.renderPreviousResponseModel();
            }
          }
          if (render) {
            render();
          }
        };

        scope.$watch('model', function (n) {
          if (n) {
            scope.updatedModel = n;
            scope.updateGraph();
          }
        }, true);

        scope.$watch('serverresponse', function (n, prev) {
          scope.updatedServerResponse = { newValue: n, oldValue: prev };
          scope.updateGraph();
        }, true);


        scope.$watch('editable', function (n) {
          if (!_.isUndefined(n)) {
            scope.graph.updateOptions({
              exhibitOnly: !n
            });
          }
          rebuildGraph();
        }, true);

        scope.$watch('responsemodel', function (n, prev) {
          if (!_.isEqual(n, prev)) {
            scope.changehandler();
          }
        }, true);


      }
    };

  }
];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'interactiveGraph',
    directive: interactiveGraph
  }
];