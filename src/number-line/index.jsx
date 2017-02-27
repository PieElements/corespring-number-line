import React, { PropTypes as PT } from 'react';
import PointChooser from './point-chooser';
import Graph from './graph';
import { getInterval } from './graph/tick-utils';
import cloneDeep from 'lodash/cloneDeep';
import { buildElementModel } from './graph/elements/builder';
import Toggle from 'corespring-correct-answer-toggle';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import Feedback from './feedback';

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
    let { domain: domainArray } = config;
    return {
      min: domainArray[0],
      max: domainArray[1]
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

  render() {

    let { model, answer } = this.props;
    let { selectedElements, showCorrectAnswer } = this.state;
    let { corrected = { correct: [], incorrect: [] }, disabled } = model;
    let addElement = this.addElement.bind(this);
    let elementsSelected = !disabled && this.state.selectedElements && this.state.selectedElements.length > 0;

    let domain = this.getDomain();
    let ticks = this.getTicks();

    let graphProps = {
      disabled,
      domain,
      ticks,
      interval: getInterval(domain, ticks),
      width: 600,
      height: 400
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