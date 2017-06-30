import { assert, spy, stub } from 'sinon';

import React from 'react';
import _ from 'lodash';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import { shallow } from 'enzyme';

describe('NumberLine', () => {

  let NumberLine, Graph, deps;

  let mkWrapper = (props, context) => {

    let onMoveElement = stub();
    let onDeleteElements = stub();
    let onAddElement = stub();

    let defaults = {
      model: {
        config: {
          domain: [0, 1]
        }
      },
      onMoveElement,
      onDeleteElements,
      onAddElement
    };

    props = _.merge(defaults, props);
    let opts = _.merge({ context: context });
    let out = shallow(<NumberLine {...props} />, opts);
    return out;
  }

  let mkStub = () => {
    const out = stub();
    out['@noCallThru'] = true;
    return out;
  }

  beforeEach(() => {

    let less = mkStub();

    let Feedback = mkStub();

    Graph = () => { };
    Graph['@noCallThru'] = true;

    deps = {
      './index.less': less,
      './feedback': Feedback,
      './graph': Graph,
      './point-chooser': mkStub(),
      './graph/elements/builder': mkStub(),
      './graph/tick-utils': {
        getInterval: stub().returns(1)
      },
      'corespring-correct-answer-toggle': mkStub()
    };

    NumberLine = proxyquire('../../src/number-line', deps).default;
  });

  describe('getSize', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mkWrapper();
    });

    it('sets default width', () => {
      expect(wrapper.find(Graph).prop('width')).to.eql(600);
    });

    it('sets default height', () => {
      expect(wrapper.find(Graph).prop('height')).to.eql(400);
    });

    it('sets custom width', () => {
      expect(
        mkWrapper({ model: { config: { width: 1001 } } }).find(Graph).prop('width')
      ).to.eql(1001);
    });

    it('sets custom height', () => {
      expect(
        mkWrapper({ model: { config: { height: 701 } } }).find(Graph).prop('height')
      ).to.eql(701);
    })
  });

});