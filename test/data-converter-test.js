const chai = require('chai');
const { expect } = chai;
const { stub, match, assert, spy } = require('sinon');

describe('data-converter', () => {
  let converter;

  beforeEach(() => {
    converter = require('../src/data-converter');
  });

  describe('switchGraphLine', () => {

    it('does not switch if not needed', () => {
      let line = {
        type: 'line',
        leftPoint: 'empty', rightPoint: 'full', position: {
          left: -2,
          right: -1
        }
      };

      let result = converter.switchGraphLine(line);
      expect(result).to.eql(line);
    });

    it('switches', () => {
      let line = {
        type: 'line',
        leftPoint: 'empty', rightPoint: 'full', position: {
          left: 0,
          right: -1
        }
      };

      let result = converter.switchGraphLine(line);
      expect(result).to.eql({
        type: 'line',
        leftPoint: 'full', rightPoint: 'empty', position: {
          left: -1,
          right: 0
        }
      });
    });
  });

  describe('format', () => {
    let graph = {
      point: {
        position: 1,
        type: 'point',
        pointType: 'full'
      },
      ray: {
        position: 1,
        direction: 'positive',
        pointType: 'full',
        type: 'ray'
      },
      line: {
        type: 'line',
        leftPoint: 'full',
        rightPoint: 'empty',
        position: {
          left: 0,
          right: 1
        }
      }
    }

    let session = {
      line: {
        type: 'line',
        leftPoint: 'full',
        rightPoint: 'empty',
        domainPosition: 0,
        size: 1
      },
      point: {
        type: 'point',
        domainPosition: 1,
        pointType: 'full'
      },
      ray: {
        type: 'ray',
        domainPosition: 1,
        direction: 'positive',
        pointType: 'full'
      }
    }

    describe('toSessionFormat', () => {
      let toSessionFormat;

      beforeEach(() => {
        toSessionFormat = converter.toSessionFormat;
      });

      it('converts line', () => {
        expect(toSessionFormat(graph.line)).to.eql(session.line);
      });

      it('converts point', () => {
        expect(toSessionFormat(graph.point)).to.eql(session.point);
      });

      it('converts ray', () => {
        expect(toSessionFormat(graph.ray)).to.eql(session.ray);
      });
    });

    describe('toGraphFormat', () => {
      let toGraphFormat;

      beforeEach(() => {
        toGraphFormat = converter.toGraphFormat;
      });

      it('converts line', () => {
        expect(toGraphFormat(session.line)).to.eql(graph.line);
      });

      it('converts point', () => {
        expect(toGraphFormat(session.point)).to.eql(graph.point);
      });

      it('converts ray', () => {
        expect(toGraphFormat(session.ray)).to.eql(graph.ray);
      });

    });
  });
});