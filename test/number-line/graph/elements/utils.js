import { stub, spy } from 'sinon';
import { expect } from 'chai';

export const assertProp = (getEl, name, expected) => {
  it(`sets ${name} to ${expected}`, () => expect(getEl().prop(name)).to.eql(expected));
}

export const stubContext = {
  xScale: spy(function (n) {
    return n;
  }),
  snapValue: stub()
}

