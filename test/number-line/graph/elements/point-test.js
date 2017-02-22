import React from 'react';
import { shallow } from 'enzyme';
import { stub, spy } from 'sinon';
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
      onDragStop
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
  });

});