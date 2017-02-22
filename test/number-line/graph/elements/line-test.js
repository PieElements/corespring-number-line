import React from 'react';
import { shallow } from 'enzyme';
import { stub, spy, assert } from 'sinon';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import _ from 'lodash';
import { assertProp, stubContext } from './utils';
import Draggable from '../../../../src/draggable';

describe('line', () => {
  let Line, Point, deps, wrapper;

  let mkWrapper = (props, context) => {

    let onMoveLine = stub();
    let onToggleSelect = stub();
    let onDragStart = stub();
    let onDragStop = stub();

    let defaults = {
      domain: {
        min: 0, max: 10
      },
      empty: {
        left: true, right: false
      },
      position: {
        left: 2, right: 3
      },
      y: 0,
      selected: false,
      disabled: false,
      correct: false,
      interval: 10,
      onMoveLine,
      onToggleSelect,
      onDragStart,
      onDragStop
    }

    props = _.merge(defaults, props);
    let opts = _.merge({ context: stubContext }, { context: context });
    let out = shallow(<Line {...props} />, opts);
    return out;
  }

  beforeEach(() => {

    let less = stub();
    less['@noCallThru'] = true;

    Point = stub();
    Point['@noCallThru'] = true;

    deps = {
      './line.less': less,
      './point': Point
    };

    Line = proxyquire('../../../../src/number-line/graph/elements/line', deps).default;
  });

  describe('className', () => {
    let f = (opts) => () => mkWrapper(opts).find('g').first();
    assertProp(f({ selected: true }), 'className', 'line selected incorrect');
    assertProp(f({ selected: false }), 'className', 'line incorrect');
    assertProp(f({ selected: true, correct: true }), 'className', 'line selected correct');
  });

  describe('onMove', () => {
    let w;

    beforeEach(() => {
      w = mkWrapper();
    });

    describe('left', () => {
      beforeEach(() => {
        w.find(Point).first().prop('onMove')(1);
      });

      it('calls onMoveLine callback', () => {
        assert.calledWith(w.instance().props.onMoveLine, { left: 1, right: 3 });
      });
    });

    describe('right', () => {
      beforeEach(() => {
        w.find(Point).get(1).props.onMove(4);
      });

      it('calls onMoveLine callback', () => {
        assert.calledWith(w.instance().props.onMoveLine, { left: 2, right: 4 });
      });
    });

    describe('line', () => {
      beforeEach(() => {
        w.find(Draggable).prop('onStop')({ clientX: 0 }, { lastX: 2 });
      });

      it('calls onMoveLine callback', () => {
        assert.calledWith(w.instance().props.onMoveLine, { left: 4, right: 5 });
      });
    });
  });

  describe('onToggleSelect', () => {
    let w;
    beforeEach(() => {
      w = mkWrapper();
      w.find('rect').props().onClick();
    });

    it('calls onToggleSelect callback', () => {
      assert.called(w.instance().props.onToggleSelect);
    });
  });

  describe('onDrag', () => {
    let w;
    beforeEach(() => {
      w = mkWrapper();
      w.instance().onDrag('left', 0);
    });

    it('sets drag state', () => w.state('left', 0));
  });
});