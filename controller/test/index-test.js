import chai from 'chai';
const { expect } = chai;
chai.use(require('chai-shallow-deep-equal'));
import _ from 'lodash';
describe('controller', () => {

  let controller;

  let assertModel = (question, session, env, expected) => {
    question = _.merge(question, {
      model: {
        config: {}
      }
    });
    session = _.merge(session, {});
    env = _.merge(env, {});

    it('creates model', () => {
      return controller.model(question, session, env)
        .then(o => {
          console.log('result: ', o);
          expect(o).to.shallowDeepEqual(expected);
        })
        .catch(e => {
          console.log(e);
          throw new Error('Create Model spec error')
        })

    });
  }

  beforeEach(() => {
    controller = require('../index');
  });

  assertModel({}, {}, {}, {});
});