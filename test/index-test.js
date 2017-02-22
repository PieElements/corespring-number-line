const proxyquire = require('proxyquire');
const { expect } = require('chai');
const { stub, assert } = require('sinon');

describe('number-line', () => {

  let el, instance;


  let point = {
    session: (n) => ({
      type: 'point',
      domainPosition: n,
      pointType: 'full'
    }),
    graph: (n) => ({
      type: 'point',
      position: n,
      pointType: 'full'
    })
  }

  let getStubInstance = () => {
    let out = new el.default();
    out._render = stub();
    out._applyInitialElements = stub();
    return out;
  }

  beforeEach(() => {

    let numberLine = stub();
    numberLine['@noCallThru'] = true;

    el = proxyquire('../src/index', {
      'react': {},
      'react-dom': {},
      './number-line': numberLine,
      './data-converter': {}
    });
  });

  describe('constructor', () => {
    it('inits', () => {
      instance = new el.default();
      expect(instance).not.to.be.null;
    });
  });

  describe('setters', () => {

    beforeEach(() => {
      instance = getStubInstance();
    });

    describe('session', () => {

      beforeEach(() => {
        instance.session = {};
      });

      it('calls _applyInitialElements', () => {
        assert.called(instance._applyInitialElements);
      });

      it('calls _render', () => {
        assert.called(instance._render);
      });
    });

    describe('model', () => {

      beforeEach(() => {
        instance.model = {};
      });

      it('calls _applyInitialElements', () => {
        assert.called(instance._applyInitialElements);
      });

      it('calls _render', () => {
        assert.called(instance._render);
      });
    });
  });

  describe('addElement', () => {

    beforeEach(() => {
      instance = getStubInstance();
      instance.session = {};
      instance.addElement({ type: 'point', position: 1, pointType: 'full' });
    });

    it('adds session formatted element to answer array', () => {
      expect(instance._session.answer[0]).to.eql({ type: 'point', domainPosition: 1, pointType: 'full' });
    });
  });

  describe('moveElement', () => {
    beforeEach(() => {
      instance = getStubInstance();
      instance.session = {
        answer: [{ type: 'point', domainPosition: 1, pointType: 'full' }]
      };
      instance.moveElement(0, { type: 'point', position: 1, pointType: 'full' }, 2);
    });

    it('updates the session answer', () => {
      expect(instance._session.answer.length).to.eql(1);
      expect(instance._session.answer[0]).to.eql({ type: 'point', domainPosition: 2, pointType: 'full' });
    });
  });

  describe('deleteElements', () => {

    beforeEach(() => {
      instance = getStubInstance();
      instance.session = {
        answer: [
          point.session(1),
          point.session(2),
          point.session(3)
        ]
      }
      instance.deleteElements([0, 2]);
    });

    it('removes 2 elements', () => {
      expect(instance._session.answer.length).to.eql(1);
    });

    it('keeps the remaining point', () => {
      expect(instance._session.answer).to.eql([point.session(2)]);
    })
  });

});

