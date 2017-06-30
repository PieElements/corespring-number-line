import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { blue500, green500, green700, grey400, grey500, red500 } from 'material-ui/styles/colors';
import { lineIsSwitched, switchGraphLine, toGraphFormat, toSessionFormat } from 'corespring-number-line/src/data-converter';

import Checkbox from 'material-ui/Checkbox';
import FeedbackConfig from 'corespring-feedback-config/src/index.jsx';
import FeedbackSelector from 'corespring-feedback-config/src/feedback-selector.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NumberLine from 'corespring-number-line/src/number-line';
import NumberLineGraph from 'corespring-number-line/src/number-line/graph';
import NumberTextField from './number-text-field';
import PointConfig from 'corespring-number-line/src/number-line/point-config';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import TextField from 'material-ui/TextField';
import { buildElementModel } from 'corespring-number-line/src/number-line/graph/elements/builder';
import cloneDeep from 'lodash/cloneDeep';
import { getInterval } from 'corespring-number-line/src/number-line/graph/tick-utils';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

require('./main.less');

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: green500,
    primary2Color: green700,
    primary3Color: grey400,
  }
});

const domainBegin = "domainBegin";
const domainEnd = "domainEnd";

const defaultConfig = {
  domain: [0, 5],
  width: 500,
  height: 40,
  tickFrequency: 6,
  showMinorTicks: true,
  snapPerTick: 1,
  tickLabelOverrides: [],
  initialType: "PF",
  exhibitOnly: false,
  availableTypes: {
    PF: true,
    PE: true,
    LFF: true,
    LEF: true,
    LFE: true,
    LEE: true,
    RFN: true,
    RFP: true,
    REN: true,
    REP: true
  },
  initialElements: [
  ]
};

const types = ['PF', 'PE', 'LFF', 'LEF', 'LFE', 'LEE', 'RFN', 'RFP', 'REN', 'REP'];

class Main extends React.Component {

  constructor(props) {
    super(props);
  }

  domainChange(event, value) {
    let newValue = parseInt(value, 10);
    if (event.target.name === domainBegin) {
      this.props.model.model.config.domain[0] = newValue;
    } else {
      this.props.model.model.config.domain[1] = newValue;
    }
    this.props.onDomainChange(this.props.model.model.config.domain);
  }

  getDomain() {
    let config = this.props.model.model.config;
    let domainArray = config.domain;
    return {
      min: domainArray[0],
      max: domainArray[1]
    }
  }

  setDefaults() {
    this.props.model.model.config = _.cloneDeep(defaultConfig);
    this.props.onConfigChange(this.props.model.model.config);
  }

  getTicks() {
    let config = this.props.model.model.config;
    return {
      major: config.tickFrequency || 2,
      minor: config.snapPerTick || 0,
    }
  }

  exhibitChanged(event, value) {
    this.props.model.model.config.exhibitOnly = value;
    this.props.onConfigChange(this.props.model.model.config);
  }

  moveCorrectResponse(index, el, position) {
    el.position = position;
    let update = toSessionFormat((el.type === 'line' && lineIsSwitched(el)) ?
      switchGraphLine(el) : el);
    this.props.model.correctResponse[index] = update;
    this.props.onCorrectResponseChange(this.props.model.correctResponse);
  }

  moveInitialView(index, el, position) {
    el.position = position;
    let update = toSessionFormat((el.type === 'line' && lineIsSwitched(el)) ?
      switchGraphLine(el) : el);
    this.props.model.model.config.initialElements[index] = update;
    this.props.onInitialElementsChange(this.props.model.model.config.initialElements);
  }

  availableTypesChange(availableTypes) {
    let toPointType = (response) => {
      function rest(response) {
        if (response.pointType) {
          if (response.direction) {
            return `${response.pointType[0]}${response.direction[0]}`;
          }
          return response.pointType[0];
        } else {
          return `${response.leftPoint[0]}${response.rightPoint[0]}`;
        }
      }
      return `${response.type[0]}${rest(response)}`.toUpperCase();
    }
    new Set(this.props.model.correctResponse.map(toPointType)).forEach((pointType) => {
      availableTypes[pointType] = true;
    });
    this.props.onAvailableTypesChange(availableTypes);
  }

  deleteCorrectResponse(indices) {
    this.props.model.correctResponse = this.props.model.correctResponse.filter((v, index) => {
      return !indices.some(d => d === index);
    });
    this.props.onCorrectResponseChange(this.props.model.correctResponse);
  }

  deleteInitialView(indices) {
    this.props.model.model.config.initialElements = this.props.model.model.config.initialElements.filter((v, index) => {
      return !indices.some(d => d === index);
    });
    this.props.onInitialElementsChange(this.props.model.model.config.initialElements);
  }

  addCorrectResponse(data) {
    this.props.model.correctResponse.push(toSessionFormat(data));
    this.props.onCorrectResponseChange(this.props.model.correctResponse);
  }

  addInitialView(data) {
    this.props.model.model.config.initialElements.push(toSessionFormat(data));
    this.props.onCorrectResponseChange(this.props.model.model.config.initialElements);
  }

  render() {
    const numberFieldStyle = {
      width: '50px',
      margin: '0 10px'
    };

    let noOp = () => { };

    let correctResponse = cloneDeep(this.props.model.correctResponse).map(toGraphFormat);
    let initialView = cloneDeep(this.props.model.model.config.initialElements).map(toGraphFormat);

    return <MuiThemeProvider muiTheme={muiTheme}>
      <div className="corespring-choice-config-root">
        <p>In this interaction, students plot points, line segments or rays on a number line.</p>
        <h2>Number Line Attributes</h2>
        <p>
          Set up the number line by entering the domain and number of tick marks to display. Labels on the number
          line can be edited or removed by clicking on the label.
        </p>
        <NumberLineGraph
          elements={[]}
          domain={this.getDomain()}
          ticks={this.getTicks()}
          interval={getInterval(this.getDomain(), this.getTicks())}
          width={defaultConfig.width}
          height={defaultConfig.height}
          onAddElement={noOp}
          onMoveElement={noOp}
          onToggleElement={noOp}
          onDeselectElements={noOp} />
        <div className="domain">
          Domain =
          <NumberTextField
            value={this.props.model.model.config.domain[0]}
            name={domainBegin}
            style={numberFieldStyle}
            onChange={this.domainChange.bind(this)} /> to
          <NumberTextField
            value={this.props.model.model.config.domain[1]}
            name={domainEnd}
            style={numberFieldStyle}
            onChange={this.domainChange.bind(this)} />
        </div>
        Number of Ticks:
        <NumberTextField
          value={this.props.model.model.config.tickFrequency}
          name="numberOfTicks"
          min={2}
          style={numberFieldStyle}
          onChange={this.props.onTickFrequencyChange.bind(this)} />
        <Checkbox
          checked={this.props.model.model.config.showMinorTicks}
          label="Display minor tick marks"
          onCheck={this.props.onMinorTicksChanged.bind(this)} />
        {
          this.props.model.model.config.showMinorTicks && (
            <div>
              Minor Tick Frequency:
              <NumberTextField
                name="snapPerTick"
                style={numberFieldStyle}
                value={this.props.model.model.config.snapPerTick}
                onChange={this.props.onSnapPerTickChange.bind(this)} />
            </div>
          )
        }
        <div className="reset-defaults">
          <RaisedButton label="Reset to default values" onClick={this.setDefaults.bind(this)} />
        </div>
        {
          !this.props.model.model.config.exhibitOnly && (
            [
              <h2 key='header'>Correct Response</h2>,
              <p key='prompt'>
                Select answer type and place it on the number line. Intersecting points, line segments and/or rays will appear above the number
                line. <i>Note: A maximum of 20 points, line segments or rays may be plotted.</i>
              </p>,
              <NumberLine key='number-line'
                onMoveElement={this.moveCorrectResponse.bind(this)}
                onDeleteElements={this.deleteCorrectResponse.bind(this)}
                onAddElement={this.addCorrectResponse.bind(this)}
                answer={correctResponse}
                model={this.props.model.model} />,
              <Card key='display-card'>
                <CardHeader title="Display" showExpandableButton={true} />
                <CardText expandable={true}>
                  <p>Click on the input options to be displayed to the students. All inputs will display by default.</p>
                  <div className="point-type-chooser">
                    <PointConfig
                      onSelectionChange={this.availableTypesChange.bind(this)}
                      selection={this.props.model.model.config.availableTypes} />
                  </div>
                </CardText>
              </Card>
            ]
          )
        }
        <Card>
          <CardHeader title="Initial view/Make Exhibit" showExpandableButton={true} />
          <CardText expandable={true}>
            <p>Use this number line to set a starting point, line segment or ray. This is optional.</p>
            <p>This number line may also be used to make an exhibit number line, which can not be manipulated by a student.</p>
            <NumberLine
              onMoveElement={this.moveInitialView.bind(this)}
              onDeleteElements={this.deleteInitialView.bind(this)}
              onAddElement={this.addInitialView.bind(this)}
              answer={initialView}
              model={this.props.model.model} />
            <Checkbox
              label="Make exhibit"
              checked={this.props.model.model.config.exhibitOnly}
              onCheck={this.exhibitChanged.bind(this)}
            />
          </CardText>
        </Card>
        {
          !this.props.model.model.config.exhibitOnly && (
            <FeedbackConfig
              feedback={this.props.model.feedback}
              onChange={this.props.onFeedbackChange.bind(this)}
              defaultCorrectFeedback="Correct"
              defaultPartialFeedback="Almost!"
              defaultIncorrectFeedback="Incorrect" />
          )
        }
      </div>
    </MuiThemeProvider>
  }
}

export default Main;