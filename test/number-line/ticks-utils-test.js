const chai = require('chai');
const { expect } = chai;
const { stub, match, assert, spy } = require('sinon');
const proxyquire = require('proxyquire');
chai.use(require('chai-shallow-deep-equal'));

let tick = (isMajor, v) => ({
  major: isMajor,
  value: v,
  x: v
});

let major = tick.bind(null, true);
let minor = tick.bind(null, false);

describe('ticks', () => {

  let mod;

  beforeEach(() => {
    mod = require('../../src/number-line/graph/tick-utils');
  });


  describe('buildTickModel', () => {

    let scaleFn;

    beforeEach(() => {
      scaleFn = spy(function (v) {
        return v;
      });
    });

    it('builds major only ticks', () => {
      let result = mod.buildTickModel({ min: 0, max: 2 }, { minor: 0 }, 1, scaleFn)
      expect(result).to.eql([
        major(0),
        major(1),
        major(2),
      ]);
    });

    it('builds minor + major ticks', () => {
      let result = mod.buildTickModel({ min: 0, max: 2 }, { minor: 1 }, 0.5, scaleFn)
      expect(result).to.eql([
        major(0),
        minor(0.5),
        major(1),
        minor(1.5),
        major(2),
      ]);
    });

  });

  describe('snapTo', () => {
    let assertSnapTo = (min, max, interval, value, expected) => {
      it(`snaps ${value} to ${expected} with domain ${min}<->${max} with interval: ${interval} `, () => {
        let result = mod.snapTo(min, max, interval, value);
        expect(result).to.eql(expected);
      });
    }

    describe('with 0, 10, 0.25', () => {
      let a = assertSnapTo.bind(null, 0, 10, 0.25);
      a(1, 1);
      a(1.2, 1.25);
      a(0.2, 0.25);
      a(5.2, 5.25);
      a(5.125, 5.25);
      a(5.124, 5);
    });

    describe('with 0, 10, 1', () => {
      let a = assertSnapTo.bind(null, 0, 10, 1);
      a(0, 0);
      a(10, 10);
      a(100, 10);
      a(1, 1);
      a(1.2, 1);
      a(0.2, 0);
      a(5.2, 5);
      a(5.001, 5);
    });
  });

  describe('getInterval', () => {

    let assertGetInterval = (min, max, ticks, expected) => {
      let paramsDescription = JSON.stringify(ticks);
      it(`converts: ${paramsDescription} to ${JSON.stringify(expected)}`, () => {
        let result = mod.getInterval({ min: min, max: max }, ticks);
        expect(result).to.shallowDeepEqual(expected);
      });
    }

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
      let a = assertGetInterval.bind(null, 0, 1);
      a({ major: 2, minor: 0 }, 1);
      a({ major: 2, minor: 1 }, 0.5);
    });

    describe('with domain 0 -> 10', () => {
      let a = assertGetInterval.bind(null, 0, 10);


      it('throws an error if the tick frequency is less than 2', () => {
        expect(() => {
          let result = mod.convertFrequencyToInterval({ min: 0, max: 10, tickFrequency: 1, betweenTickCount: 0 }, { interval: 10, major: 10 });
          console.log('result: ', result);
        }).to.throw(Error);
      });

      a({ major: 2, minor: 9 }, 1);
      a({ major: 2, minor: 0 }, 10);
      a({ major: 3, minor: 0 }, 5);
      a({ major: 3, minor: 1 }, 2.5);
      a({ major: 4, minor: 0 }, 3.3333);
      a({ major: 5, minor: 0 }, 2.5);
      a({ major: 6, minor: 0 }, 2);
      a({ major: 7, minor: 0 }, 1.6667);
      a({ major: 8, minor: 0 }, 1.4286);
      a({ major: 9, minor: 0 }, 1.25);
      a({ major: 10, minor: 0 }, 1.1111);
      a({ major: 11, minor: 0 }, 1);
      a({ major: 11, minor: 1 }, 0.5);
      a({ major: 11, minor: 2 }, 0.3333);
    });

    describe('with domain 0 -> 100', () => {
      let a = assertGetInterval.bind(null, 0, 100);
      a({ major: 11, minor: 1 }, 5);
      a({ major: 101, minor: 0 }, 1);
    });

    describe('with domain -5 - 5', () => {
      let a = assertGetInterval.bind(null, -5, 5);
      a({ major: 11, minor: 0 }, 1);
    });

    describe('with domain 0 - 5', () => {
      let a = assertGetInterval.bind(null, 0, 5);
      a({ major: 11, minor: 0 }, 0.5);
      a({ major: 11, minor: 2 }, 0.1667);
      a({ major: 11, minor: 1 }, 0.25);
    });
  });
});