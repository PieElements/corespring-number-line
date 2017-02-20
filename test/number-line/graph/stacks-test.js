const { expect } = require('chai');


let typeLabel = (el) => {
  switch (el.type) {
    case 'point': return `[${el.position}]`;
    case 'line': return `[${el.position.left}--${el.position.right}]`;
    case 'ray': {
      if (el.direction === 'n') {
        return `<---[${el.position}]`;
      } else {
        return `[${el.position}]--->`;
      }
    }
  }
}

describe('stacks', () => {
  let mod;

  before(() => {
    mod = require('../../../src/number-line/graph/stacks');
  });

  describe('stacks', () => {
    let stacks;

    describe('basics', () => {
      before(() => {
        stacks = new mod.default({ min: 0, max: 3 });
      });

      it('returns 0 for point:1', () => {
        expect(stacks.add({ type: 'point', position: 1 })).to.eql(0);
      });

      it('returns 1 for next point:1', () => {
        expect(stacks.add({ type: 'point', position: 1 })).to.eql(1);
      });

      it('returns 2 for next point:1', () => {
        expect(stacks.add({ type: 'point', position: 1 })).to.eql(2);
      });

      it('returns 0 for ray:2', () => {
        expect(stacks.add({ type: 'ray', direction: 'positive', position: 2 })).to.eql(0);
      });

      it('returns 0 for ray:0', () => {
        expect(stacks.add({ type: 'ray', direction: 'negative', position: 0 })).to.eql(0);
      });
    });

    describe('sample', () => {
      before(() => {
        stacks = new mod.default({ min: -5, max: 5 });
      });
      it('one', () => {
        expect(stacks.add({ type: 'ray', direction: 'positive', position: '3.5' })).to.eql(0);
        expect(stacks.add({ type: 'point', position: '2' })).to.eql(0);
      });
    });
  });

  describe('stack', () => {
    let Stack;
    let assertAddElement = (domain, initialStack, el, expected) => {
      let negative = expected ? '' : 'not ';

      let candidate = typeLabel(el);
      let stack = initialStack.map(typeLabel).join('-');
      it(`${negative}add ${candidate} to |${domain.min}|--${stack}--|${domain.max}|`, () => {
        let stack = new mod.Stack(domain);

        initialStack.forEach(o => stack.add(o));

        let result = stack.add(el);
        expect(result).to.be[expected];
      });
    }

    let assertAddPoint = (domain, initialStack, position, expected) => {
      let el = { type: 'point', position: position };
      assertAddElement(domain, initialStack, el, expected);
    }

    let assertAddLine = (domain, initialStack, left, right, expected) => {
      let el = { type: 'line', position: { left, right } };
      assertAddElement(domain, initialStack, el, expected);
    }

    let assertAddRay = (domain, initialStack, direction, position, expected) => {
      direction = direction.length === 1 ? (direction === 'p' ? 'positive' : 'negative') : direction;
      let el = { type: `ray`, direction: direction, position: position };
      assertAddElement(domain, initialStack, el, expected);
    }

    describe('add', () => {

      let stack, zero, one, oneB, two, three;

      describe('point on point', () => {
        let addPoint = assertAddPoint.bind(null,
          { min: 0, max: 2 }, [{ type: 'point', position: 1 }]);
        addPoint(-1, false);
        addPoint(0, true);
        addPoint(1, false);
        addPoint(2, true);
        addPoint(3, false);
      });

      describe('point on line', () => {
        let addPoint = assertAddPoint.bind(null, { min: 0, max: 3 }, [{ type: 'line', position: { left: 0, right: 2 } }]);
        addPoint(0, false);
        addPoint(1, false);
        addPoint(2, false);
        addPoint(3, true);
      });

      describe('point on ray', () => {
        let addPoint = assertAddPoint.bind(null, { min: 0, max: 3 }, [{ type: 'ray', direction: 'positive', position: 2 }]);
        addPoint(0, true);
        addPoint(1, true);
        addPoint(2, false);
        addPoint(3, false);
      });

      describe('line on point', () => {
        let addLine = assertAddLine.bind(null, { min: 0, max: 3 }, [{ type: 'point', position: 1 }]);
        addLine(1, 3, false);
        addLine(0, 1, false);
        addLine(2, 3, true);
        addLine(0, 0, true);
      });

      describe('line on line', () => {
        let addLine = assertAddLine.bind(null, { min: 0, max: 5 }, [{ type: 'line', position: { left: 2, right: 3 } }]);
        addLine(0, 1, true);
        addLine(0, 2, false);
        addLine(0, 5, false);
        addLine(2, 5, false);
        addLine(3, 5, false);
        addLine(4, 5, true);
      });

      describe('line on ray', () => {

        let addLine = assertAddLine.bind(null, { min: 0, max: 5 }, [{ type: 'ray', direction: 'positive', position: 3 }]);

        addLine(0, 1, true);
        addLine(0, 2, true);
        addLine(0, 3, false);
        addLine(0, 5, false);
        addLine(1, 5, false);
        addLine(2, 5, false);
        addLine(3, 5, false);

      });

      describe('ray on point', () => {
        let addRay = assertAddRay.bind(null, { min: 0, max: 5 }, [{ type: 'point', position: 1 }]);
        addRay('p', 0, false);
        addRay('p', 1, false);
        addRay('p', 2, true);
        addRay('p', 3, true);
        addRay('n', 0, true);
        addRay('n', 1, false);
        addRay('n', 2, false);
      });

      describe('ray on line', () => {
        let addRay = assertAddRay.bind(null, { min: 0, max: 5 }, [{ type: 'line', position: { left: 1, right: 3 } }]);
        addRay('p', 0, false);
        addRay('p', 1, false);
        addRay('p', 2, false);
        addRay('p', 3, false);
        addRay('p', 4, true);
        addRay('p', 5, true);

        addRay('n', 0, true);
        addRay('n', 1, false);
        addRay('n', 2, false);
        addRay('n', 3, false);
        addRay('n', 4, false);
        addRay('n', 5, false);
      });

      describe('ray on ray', () => {
        let addRay = assertAddRay.bind(null, { min: 0, max: 5 }, [{ type: 'ray', direction: 'positive', position: 4 }]);

        addRay('p', 0, false);
        addRay('p', 1, false);
        addRay('p', 2, false);
        addRay('p', 3, false);
        addRay('p', 4, false);
        addRay('p', 5, false);

        addRay('n', 0, true);
        addRay('n', 1, true);
        addRay('n', 2, true);
        addRay('n', 3, true);
        addRay('n', 4, false);
        addRay('n', 5, false);

      });
    });

  });
});