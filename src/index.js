import { lineIsSwitched, switchGraphLine, toGraphFormat, toSessionFormat } from './data-converter';

import NumberLine from './number-line';
import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';

export default class CorespringNumberLine extends HTMLElement {

  constructor() {
    super();
  }

  set model(m) {
    this._model = m;
    this._applyInitialElements();
    this._render();
    this.dispatch('model-set');
  }

  set session(s) {
    this._session = s;
    this._applyInitialElements();
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  isComplete() {
    return this._session ? (this._session.answer || []).length > 0 : false
  }

  dispatch(type) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      detail: {
        complete: this.isComplete()
      }
    }));
  }

  dispatchSessionChanged() {
    this.dispatch('session-changed');
  }

  addElement(data) {
    if (!this._session) {
      return;
    }

    this._session.answer = this._session.answer || [];
    this._session.answer.push(toSessionFormat(data));
    this.dispatchSessionChanged();
    this._render();
  }

  moveElement(index, el, position) {

    let answer = this._session.answer[index];

    if (!answer) {
      throw new Error('cant find element at index: ', index);
    }


    if (el.type === 'line' && position.left === position.right) {
      this._render();
      return;
    }

    //set the new position
    el.position = position;

    let update = (el.type === 'line' && lineIsSwitched(el)) ?
      switchGraphLine(el) : el;

    this._session.answer.splice(index, 1, toSessionFormat(update));

    this.dispatchSessionChanged();
    this._render();
  }

  deleteElements(indices) {
    this._session.answer = this._session.answer.filter((v, index) => {
      return !indices.some(d => d === index);
    });
    this.dispatchSessionChanged();
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