import React from 'react';
import { shallow } from 'enzyme';
import { stub, spy } from 'sinon';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import _ from 'lodash';
import { assertProp, stubContext } from './utils';

describe('ray', () => {
  let Ray, Point, Arrow, deps, wrapper;


  let mkWrapper = (props, context) => {

    let onMove = stub();
    let onToggleSelect = stub();

    let defaults = {
      domain: { min: 0, max: 1 },
      selected: false,
      correct: false,
      empty: false,
      direction: 'positive',
      position: 1,
      onMove: onMove,
      interval: 10,
      width: 100,
      onToggleSelect: onToggleSelect
    }

    props = _.merge(defaults, props);
    let opts = _.merge({ context: stubContext }, { context: context });
    return shallow(<Ray {...props} />, opts);
  }

  beforeEach(() => {

    let less = stub();
    less['@noCallThru'] = true;
    Point = stub()
    Point['@noCallThru'] = true;
    Arrow = stub();
    Arrow['@noCallThru'] = true;

    deps = {
      './ray.less': less,
      './point': Point,
      '../arrow': Arrow
    };

    Ray = proxyquire('../../../../src/number-line/graph/elements/ray', deps).default;
  });

  describe('init', () => {
    beforeEach(() => {
      wrapper = mkWrapper();
    });

    it('sets the className', () => {
      expect(wrapper.find('g').hasClass('ray')).to.be.true;
    });

    it('sets the transform', () => {
      let g = wrapper.find('g');
      expect(wrapper.find('g').prop('transform')).to.eql('translate(0, 0)');
    });

    describe('line', () => {
      let assert = assertProp.bind(null, () => wrapper.find('line'));

      assert('x1', 1);
      assert('x2', 92);
    });

    describe('Point', () => {
      let assert = assertProp.bind(null, () => wrapper.find(Point));
      assert('disabled', false);
      assert('correct', false);
      assert('selected', false);
      assert('empty', false);
      assert('interval', 10);
      assert('bounds', { left: -1, right: 0 });
    });
  });

  describe('className', () => {

    assertProp(() => mkWrapper({ selected: true }).find('g'), 'className', 'ray selected incorrect');
    assertProp(() => mkWrapper({ selected: true, correct: true }).find('g'), 'className', 'ray selected correct');
  });

  describe('Arrow.arrowDirection', () => {
    assertProp(() => mkWrapper().find(Arrow), 'direction', 'right');
    assertProp(() => mkWrapper({ direction: 'negative' }).find(Arrow), 'direction', 'left');
  });

  describe('drag', () => {

    it('sets does not set state.dragPosition if position < domain.min', () => {
      wrapper.instance().drag(-5);
      expect(wrapper.state('dragPosition')).to.eql(null);
    });

    it('sets does not set state.dragPosition if position > domain.max', () => {
      wrapper.instance().drag(100);
      expect(wrapper.state('dragPosition')).to.eql(null);
    });

    it('sets state.dragPosition', () => {
      wrapper.instance().drag(0);
      expect(wrapper.state('dragPosition')).to.eql(0);
    });
  });

  describe('stopDrag', () => {
    it('sets state.dragPosition', () => {
      wrapper.instance().drag(0);
      expect(wrapper.state('dragPosition')).to.eql(0);
      wrapper.instance().stopDrag();
      expect(wrapper.state('dragPosition')).to.eql(null);
    });
  });
});