import React from 'react';
import ReactDOM from 'react-dom';
import NumberLine from './number-line';
require('./index.less');

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
      this._session.answer = this._session.answer || [];
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
    this._session.answer.push(data);
    this._render();
  }

  moveElement(index, el, position) {
    let answer = this._session.answer[index];
    if (!answer) {
      throw new Error('cant find element at index: ', index);
    }

    answer.position = position;

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
        console.log(JSON.stringify(this._session.answer));
        let props = {
          model: this._model,
          session: this._session,
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