import Feedback from './feedback';
import Graph from './graph';
import PT from 'prop-types';
import PointChooser from './point-chooser';
import React from 'react';
import Toggle from 'corespring-correct-answer-toggle';
import { buildElementModel } from './graph/elements/builder';
import cloneDeep from 'lodash/cloneDeep';
import { getInterval } from './graph/tick-utils';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';

require('./index.less');

export default class NumberLine extends React.Component {

  constructor(props, context) {
    super(props, context);

    let initialType = props.model.config ? props.model.config.initialType : null;
    initialType = initialType ? initialType.toLowerCase() : PointChooser.DEFAULT_TYPE;

    this.state = {
      selectedElements: [],
      elementType: initialType
    }
  }

  toggleElement(index, el) {
    let selected = [];
    if (this.state.selectedElements.indexOf(index) === -1) {
      selected = this.state.selectedElements.concat([index]);
    } else {
      selected = this.state.selectedElements.filter(e => e !== index);
    }
    this.setState({ selectedElements: selected });
  }

  elementTypeSelected(t) {
    this.setState({ elementType: t });
  }

  getDomain() {
    let config = this.props.model.config;
    let { domain } = config;
    if (domain.length !== 2) {
      throw new Error('Invalid domain array must have 2 values');
    } else {
      const [min, max] = domain;
      return { min, max };
    }
  }

  getTicks() {
    let config = this.props.model.config;
    return {
      major: config.tickFrequency || 2,
      minor: config.snapPerTick || 0,
    }
  }

  addElement(x) {

    if (this.hasMaxNoOfPoints()) {
      this.setState({ showMaxPointsWarning: true });
      setTimeout(() => {
        this.setState({ showMaxPointsWarning: false })
      }, 2000);
      return;
    }

    let domain = this.getDomain();
    let interval = getInterval(domain, this.getTicks());
    let elementData = buildElementModel(x, this.state.elementType, domain, interval);

    if (elementData) {
      this.props.onAddElement(elementData);
    }
  }

  hasMaxNoOfPoints() {
    let { answer, model: { config: { maxNumberOfPoints } } } = this.props

    return isNumber(maxNumberOfPoints) &&
      maxNumberOfPoints > 0 &&
      (answer || []).length >= maxNumberOfPoints;
  }

  componentWillReceiveProps() {
    this.setState({ showCorrectAnswer: false });
  }

  deselectElements() {
    this.setState({ selectedElements: [] });
  }

  getSize(type, min, max, defaultValue) {
    const { model: { config } } = this.props;

    if (config && config[type]) {
      return Math.max(min, Math.min(max, config[type]));
    } else {
      return defaultValue;
    }
  }

  render() {

    let { model, answer } = this.props;
    let { selectedElements, showCorrectAnswer } = this.state;
    let { corrected = { correct: [], incorrect: [] }, disabled } = model;
    let addElement = this.addElement.bind(this);
    let elementsSelected = !disabled && this.state.selectedElements && this.state.selectedElements.length > 0;
    const width = this.getSize('width', 400, 1600, 600);
    const height = this.getSize('height', 300, 800, 400);


    let domain = this.getDomain();
    let ticks = this.getTicks();

    let graphProps = {
      disabled,
      domain,
      ticks,
      interval: getInterval(domain, ticks),
      width,
      height
    }

    let getAnswerElements = () => {
      return (answer || []).map((e, index) => {
        let out = cloneDeep(e);
        out.selected = this.state.selectedElements.indexOf(index) !== -1;
        out.correct = corrected.correct.includes(index) ? true : (corrected.incorrect.includes(index) ? false : undefined);
        return out;
      });
    }

    let getCorrectAnswerElements = () => {
      return (model.correctResponse || []).map(r => {
        r.correct = true;
        return r;
      });
    }

    let elements = showCorrectAnswer ?
      getCorrectAnswerElements() :
      getAnswerElements();

    let maxPointsMessage = () => `You can only add ${model.config.maxNumberOfPoints} elements`;

    let deleteElements = () => {
      this.props.onDeleteElements(this.state.selectedElements);
      this.setState({ selectedElements: [] });
    }

    let getIcons = () => {
      if (model.config.availableTypes) {
        return Object.keys(model.config.availableTypes)
          .filter(k => model.config.availableTypes[k])
          .map(k => k.toLowerCase());
      }
    }

    let onShowCorrectAnswer = (show) => {
      this.setState({ showCorrectAnswer: show })
    }

    let adjustedWidth = graphProps.width - 20;

    return <div className={`view-number-line ${model.colorContrast || ''}`}>
      <div className="interactive-graph">
        <div className="toggle-holder" style={{ width: adjustedWidth }}>
          <Toggle
            show={isArray(model.correctResponse) && !model.emptyAnswer}
            toggled={showCorrectAnswer}
            onToggle={onShowCorrectAnswer}
            initialValue={false} />
        </div>
        {!disabled &&
          <PointChooser
            elementType={this.state.elementType}
            showDeleteButton={elementsSelected}
            onDeleteClick={deleteElements}
            onElementType={this.elementTypeSelected.bind(this)}
            icons={getIcons()}
          />
        }
        <Graph
          {...graphProps}
          elements={elements}
          onAddElement={addElement}
          onMoveElement={this.props.onMoveElement}
          onToggleElement={this.toggleElement.bind(this)}
          onDeselectElements={this.deselectElements.bind(this)}
          debug={false} />
        {this.state.showMaxPointsWarning &&
          <Feedback type="info"
            width={adjustedWidth}
            message={maxPointsMessage()} />}
        {model.feedback &&
          <Feedback
            {...model.feedback}
            width={adjustedWidth} />}
      </div>
    </div>
  }
}

NumberLine.propTypes = {
  onMoveElement: PT.func.isRequired,
  onDeleteElements: PT.func.isRequired,
  onAddElement: PT.func.isRequired
}