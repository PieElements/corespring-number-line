const chai = require('chai');
const { expect } = chai;
const { stub, match, assert, spy } = require('sinon');
const proxyquire = require('proxyquire');
chai.use(require('chai-shallow-deep-equal'));

describe('ticks', () => {

  let mod;

  beforeEach(() => {
    mod = require('../../src/number-line/graph/tick-utils');
  });

  let assertTicks = (min, max, input, expected) => {
    let paramsDescription = JSON.stringify(input);
    input = Object.assign(input, { min: min, max: max });
    it(`converts: ${paramsDescription} to ${JSON.stringify(expected)}`, () => {
      let result = mod.convertFrequencyToInterval(input, input.tickFrequency, input.betweenTickCount);
      expect(result).to.shallowDeepEqual(expected);
    });
  }

  describe('buildTickModel', () => {

    let scaleFn = spy(function (v) {
      return v;
    });

    it.only('??', () => {
      let result = mod.buildTickModel({ min: 0, max: 4 }, { interval: 0.66, steps: 2 }, scaleFn)
      expect(result).to.eql([]);
    });
  });
  describe('convertFrequencyToInterval', () => {

    describe('with bad params', () => {
      it('throws an error if min > max', () => {
        expect(() => {
          let result = mod.convertFrequencyToInterval({ min: 11, max: 10, tickFrequency: 1, betweenTickCount: 0 }, { interval: 10, major: 10 });
          console.log('result: ', result);
        }).to.throw(Error);
      });

      it('throws an error if min = max', () => {
        expect(() => {
          let result = mod.convertFrequencyToInterval({ min: 10, max: 10, tickFrequency: 1, betweenTickCount: 0 }, { interval: 10, major: 10 });
          console.log('result: ', result);
        }).to.throw(Error);
      });
    });
    describe('with domain 0 -> 1', () => {
      let a = assertTicks.bind(null, 0, 1);
      a({ tickFrequency: 11, betweenTickCount: 9 }, { interval: 0.01, major: 0.1 });
    });

    describe('with domain 0 -> 10', () => {
      let a = assertTicks.bind(null, 0, 10);


      it('throws an error if the tick frequency is less than 2', () => {
        expect(() => {
          let result = mod.convertFrequencyToInterval({ min: 0, max: 10, tickFrequency: 1, betweenTickCount: 0 }, { interval: 10, major: 10 });
          console.log('result: ', result);
        }).to.throw(Error);
      });

      a({ tickFrequency: 2, betweenTickCount: 9 }, { interval: 1, major: 10, counts: { interval: 10, major: 1 } });
      a({ tickFrequency: 2, betweenTickCount: 0 }, { interval: 10, major: 10 });
      a({ tickFrequency: 3, betweenTickCount: 0 }, { interval: 5, major: 5 });
      a({ tickFrequency: 3, betweenTickCount: 1 }, { interval: 2.5, major: 5 });
      a({ tickFrequency: 4, betweenTickCount: 0 }, { interval: 3.33, major: 3.33 });
      a({ tickFrequency: 5, betweenTickCount: 0 }, { interval: 2.5, major: 2.5 });
      a({ tickFrequency: 6, betweenTickCount: 0 }, { interval: 2, major: 2 });
      a({ tickFrequency: 7, betweenTickCount: 0 }, { interval: 1.67, major: 1.67 });
      a({ tickFrequency: 8, betweenTickCount: 0 }, { interval: 1.43, major: 1.43 });
      a({ tickFrequency: 9, betweenTickCount: 0 }, { interval: 1.25, major: 1.25 });
      a({ tickFrequency: 10, betweenTickCount: 0 }, { interval: 1.11, major: 1.11 });
      a({ tickFrequency: 11, betweenTickCount: 0 }, { interval: 1, major: 1 });
      a({ tickFrequency: 11, betweenTickCount: 1 }, { interval: 0.5, major: 1 });
      a({ tickFrequency: 11, betweenTickCount: 2 }, { interval: 0.33, major: 1 });
    });

    describe('with domain 0 -> 100', () => {
      let a = assertTicks.bind(null, 0, 100);
      a({ tickFrequency: 11, betweenTickCount: 1 }, { interval: 5, major: 10 });
      a({ tickFrequency: 101, betweenTickCount: 0 }, { interval: 1, major: 1 });
    });

    describe('with domain -5 - 5', () => {
      let a = assertTicks.bind(null, -5, 5);
      a({ tickFrequency: 11, betweenTickCount: 0 }, { interval: 1, major: 1 });
    });

    describe('with domain 0 - 5', () => {
      let a = assertTicks.bind(null, 0, 5);
      a({ min: 0, max: 5, tickFrequency: 11, betweenTickCount: 0 }, { interval: 0.5, major: 0.5 });
      a({ min: 0, max: 5, tickFrequency: 11, betweenTickCount: 2 }, { interval: 0.17, major: 0.5 });
      a({ min: 0, max: 5, tickFrequency: 11, betweenTickCount: 1 }, { interval: 0.25, major: 0.5 });
    });
  });
});