import React from 'react';
import ReactDOM from 'react-dom';
import NumberLine from './number-line';
import cloneDeep from 'lodash/cloneDeep';
import { toSessionFormat, toGraphFormat } from './data-converter';

require('./index.less');

const NOT_SUPPORTED = [ 
  'model.config.tickLabelOverrides'
];

export default class CorespringNumberLine extends HTMLElement {

  constructor() {
    super();
  }

  set model(m) {
    this._model = m;
    this._render();
  }

  set session(s) {
    this._session = s;
    if (s) {
      this._session.answer = s.answer || [];
    }
    this._render();
  }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('pie.register', { bubbles: true }));
    this._render();
  }

  addElement(data) {
    if (!this._session) {
      return;
    }
    this._session.answer = this._session.answer || [];
    this._session.answer.push(toSessionFormat(data));
    this._render();
  }

  moveElement(index, el, position) {

    let answer = this._session.answer[index];

    if (!answer) {
      throw new Error('cant find element at index: ', index);
    }

    let graphAnswer = toGraphFormat(answer);

    if (el.type === 'line' && position.left === position.right) {
      this._render();
      return;
    }

    if (el.type === 'line' && position.left > position.right && el.leftPoint !== el.rightPoint) {
      let old = cloneDeep(graphAnswer);
      graphAnswer.leftPoint = old.rightPoint;
      graphAnswer.rightPoint = old.leftPoint;
    }

    graphAnswer.position = position;

    this._session.answer.splice(index, 1, toSessionFormat(graphAnswer));

    this._render();
  }

  deleteElements(indices) {
    this._session.answer = this._session.answer.filter((v, index) => {
      return !indices.some(d => d === index);
    });
    this._render();
  }

  _render() {
    try {
      if (this._model && this._session) {
        let answer = (this._session.answer || []).map(toGraphFormat);
        let model = cloneDeep(this._model);
        model.correctResponse = model.correctResponse ? model.correctResponse.map(toGraphFormat) : null;


        let props = {
          model, answer,
          onAddElement: this.addElement.bind(this),
          onMoveElement: this.moveElement.bind(this),
          onDeleteElements: this.deleteElements.bind(this)
        };

        let el = React.createElement(NumberLine, props)
        ReactDOM.render(el, this);
      }
    } catch (e) {
      console.log(e.stack);
      console.log('!!', e.message);
    }
  }
}