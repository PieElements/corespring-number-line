import React from 'react';
import { shallow } from 'enzyme';
import { stub, spy, assert } from 'sinon';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import _ from 'lodash';
import { assertProp, stubContext } from './utils';
import Draggable from '../../../../src/draggable';

describe('point', () => {
  let Point, deps, wrapper;

  let mkWrapper = (props, context) => {

    let onMove = stub();
    let onClick = stub();
    let onDragStart = stub();
    let onDragStop = stub();
    let onDrag = stub();

    let defaults = {
      interval: 10,
      position: 1,
      bounds: {
        left: -1,
        right: 9
      },
      selected: false,
      disabled: false,
      correct: false,
      empty: false,
      y: 0,
      onMove,
      onClick,
      onDragStart,
      onDragStop,
      onDrag
    }

    props = _.merge(defaults, props);
    let opts = _.merge({ context: stubContext }, { context: context });
    return shallow(<Point {...props} />, opts);
  }

  beforeEach(() => {

    let less = stub();
    less['@noCallThru'] = true;

    deps = {
      './point.less': less
    };

    Point = proxyquire('../../../../src/number-line/graph/elements/point', deps).default;
  });


  describe('className', () => {
    let f = (opts) => () => mkWrapper(opts).find('circle');

    assertProp(f({ selected: true }), 'className', 'point selected incorrect');
    assertProp(f({ selected: false }), 'className', 'point incorrect');
    assertProp(f({ selected: true, correct: true }), 'className', 'point selected correct');
    assertProp(f({ empty: true, selected: true, correct: true }), 'className', 'point selected correct empty');
  });

  describe('Draggable', () => {
    let f = (opts) => () => mkWrapper(opts).find(Draggable);
    assertProp(f(), 'axis', 'x');
    assertProp(f(), 'grid', [10]);
    assertProp(f(), 'bounds', { left: -1, right: 9 });

    describe('onStart', () => {
      let w;
      beforeEach(() => {
        w = mkWrapper();
        w.find(Draggable).prop('onStart')({ clientX: 0 });
      });

      it('sets state.startX', () => {
        expect(w.state('startX')).to.eql(0);
      });

      it('calls onDragStart callback', () => {
        assert.called(w.instance().props.onDragStart);
      });

    });

    describe('onStop', () => {

      let w;
      beforeEach(() => {
        w = mkWrapper({ position: 1 });
        w.setState({ startX: 0 });
        w.find(Draggable).prop('onStop')({ clientX: 100 }, { lastX: 100 });
      });

      it('calls onDragStop callback', () => {
        assert.called(w.instance().props.onDragStop);
      });

      it('calls onMove callback', () => {
        assert.calledWith(w.instance().props.onMove, 101);
      })
    });

    describe('onDrag', () => {
      let w;
      beforeEach(() => {
        w = mkWrapper();
        w.find(Draggable).prop('onDrag')({}, { x: 10 });
      });

      it('calls onDrag callback', () => {
        assert.calledWith(w.instance().props.onDrag, 11);
      });
    });
  });

});