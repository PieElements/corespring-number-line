import React from 'react';
import ReactDOM from 'react-dom';
import NumberLine from './number-line';
import cloneDeep from 'lodash/cloneDeep';
import { toSessionFormat, toGraphFormat } from './data-converter';

export default class CorespringNumberLine extends HTMLElement {

  constructor() {
    super();
  }

  set model(m) {
    this._model = m;
    this._applyInitialElements();
    this._render();
  }

  set session(s) {
    this._session = s;
    this._applyInitialElements();
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


  _applyInitialElements() {
    if (this._model &&
      this._model.config &&
      this._model.config.initialElements && this._session && !this._session.answer) {
      this._session.answer = cloneDeep(this._model.config.initialElements);
    }
  }

  _render() {
    try {
      if (this._model && this._session) {
        let answer = (this._session.answer || []).map(toGraphFormat);
        let model = cloneDeep(this._model);
        model.correctResponse = model.correctResponse && model.correctResponse.map(toGraphFormat);


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