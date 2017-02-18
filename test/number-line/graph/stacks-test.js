const { expect } = require('chai');

describe('stacks', () => {

  let Stack;
  let assertAddElement = (domain, initialStack, el, expected) => {
    let negative = expected ? '' : 'not ';
    it(`${negative}add ${JSON.stringify(el)} to <-${domain.min} ${JSON.stringify(initialStack)} ${domain.max}->`, () => {

      let stack = new Stack(domain);

      initialStack.forEach(o => stack.add(o));

      let result = stack.add(el);
      expect(result).to.be[expected];
    });
  }

  let assertAddPoint = (domain, initialStack, position, expected) => {
    let el = { type: 'pe', position: position };
    assertAddElement(domain, initialStack, el, expected);
  }

  let assertAddLine = (domain, initialStack, left, right, expected) => {
    let el = { type: 'l', position: { left, right } };
    assertAddElement(domain, initialStack, el, expected);
  }

  beforeEach(() => {
    Stack = require('../../../src/number-line/graph/stacks').default;
  });

  describe('add', () => {

    let stack, zero, one, oneB, two, three;
    beforeEach(() => {
      stack = new Stack({ min: 0, max: 2 });
    });

    describe('point to point', () => {
      let addPoint = assertAddPoint.bind(null,
        { min: 0, max: 2 }, [{ type: 'pe', position: 1 }]);
      addPoint(-1, false);
      addPoint(0, true);
      addPoint(1, false);
      addPoint(2, true);
      addPoint(3, false);
    });

    describe('point on line', () => {
      let addPoint = assertAddPoint.bind(null, { min: 0, max: 3 }, [{ type: 'lef', position: { left: 0, right: 2 } }]);
      addPoint(0, false);
      addPoint(1, false);
      addPoint(2, false);
      addPoint(3, true);
    });

    describe('line on point', () => {
      let addLine = assertAddLine.bind(null, { min: 0, max: 3 }, [{ type: 'pe', position: 1 }]);
      addLine(1, 3, false);
      addLine(0, 1, false);
      addLine(2, 3, true);
      addLine(0, 0, true);
    });
  });
});