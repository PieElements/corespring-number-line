import chai from 'chai';
const { expect } = chai;
chai.use(require('chai-shallow-deep-equal'));
import _ from 'lodash';

let question = {
  correctResponse: [
    {
      type: 'point',
      pointType: 'full',
      domainPosition: 1
    }
  ],
  model: {
    config: {
      domain: [0, 1]
    }
  }
};

let correctSession = {
  answer: question.correctResponse
};

let incorrectSession = {
  answer: [
    { type: 'point', pointType: 'empty', domainPosition: 1 }
  ]
};

let controller = require('../index');

let mode = (m) => ({ mode: m });

describe('controller', () => {

  describe('outcome', () => {
    it('returns score of 1.0 for correct answer', () => {
      return controller.outcome(question, correctSession)
        .then(o => {
          expect(o).to.eql({
            score: {
              scaled: 1.0
            }
          });
        });
    });

    it('returns score of 0.0 for incorrect answer', () => {
      return controller.outcome(question, incorrectSession)
        .then(o => {
          expect(o).to.eql({
            score: {
              scaled: 0.0
            }
          });
        });
    });

    it('returns score of 0.0 for incorrect answer that also has correct answer', () => {
      let s = _.cloneDeep(incorrectSession);
      s.answer = s.answer.concat(correctSession.answer);
      return controller.outcome(question, s)
        .then(o => {
          expect(o).to.eql({
            score: {
              scaled: 0.0
            }
          });
        });
    });

    it('returns score of -1 for an unanswered answer', () => {
      let s = _.cloneDeep(incorrectSession);
      s.answer = [];
      return controller.outcome(question, s)
        .then(o => {
          expect(o).to.eql({
            score: {
              scaled: -1.0
            }
          });
        });
    });

    describe('with partial scoring', () => {
      it('returns a partial score', () => {
        let q = _.cloneDeep(question);

        q.partialScoring = [{
          numberOfCorrect: 1,
          scorePercentage: 21
        }];

        q.allowPartialScoring = true;
        q.correctResponse.push({
          type: 'point', domainPosition: 2, pointType: 'full'
        });

        return controller.outcome(q, correctSession)
          .then(o => {
            expect(o).to.eql({
              score: {
                scaled: 0.21
              }
            });
          });
      });
    });
  });

  describe('model', () => {

    let assertModel = (msg, question, session, env, expected) => {
      question = _.merge(question, {
        model: {
          config: {}
        }
      });
      session = _.merge(session, {});
      env = _.merge(env, {});

      it(msg, () => {
        return controller.model(question, session, env)
          .then(o => {
            if (_.isFunction(expected)) {
              expected(o);
            } else {
              expect(o).to.shallowDeepEqual(expected);
            }
          })
          .catch(e => {
            console.log(e);
            throw new Error('Create Model spec error')
          });
      });
    }

    assertModel('empty', {}, {}, {}, {
      config: {},
      disabled: true,
      colorContrast: 'black_on_white'
    });

    describe('disabled', () => {
      assertModel('disabled is missing in gather mode', {}, {}, { mode: 'gather' }, (r) => {
        expect(r.disabled).to.be.undefined;
      });

      assertModel('disabled is true if exhibitOnly is true', {
        model: {
          config: {
            exhibitOnly: true
          }
        }
      },
        {},
        { mode: 'gather' }, (r) => {
          expect(r.disabled).to.be.true;
        });
    });

    describe('config', () => {
      assertModel('config is returned', { model: { config: { domain: [0, 1] } } }, {}, {},
        {
          config: {
            domain: [0, 1]
          }
        });
    });

    describe('corrected', () => {
      assertModel('corrected.correct has answer index 0', question, correctSession, { mode: 'evaluate' }, {
        corrected: {
          correct: [0],
          incorrect: [],
          notInAnswer: []
        }
      });

      assertModel('corrected.incorrect has answer index 0', question, incorrectSession, { mode: 'evaluate' }, {
        corrected: {
          correct: [],
          incorrect: [0],
          notInAnswer: []
        }
      });
    });

    describe('correctResponse', () => {
      assertModel('correctResponse is empty if correct',
        question,
        correctSession,
        mode('evaluate'),
        { correctResponse: undefined });

      assertModel('correctResponse is not empty if correct',
        question,
        incorrectSession, mode('evaluate'),
        { correctResponse: question.correctResponse });
    });

    describe('feedback', () => {
      let assertFeedback = (s, fbType) => {
        assertModel(fbType,
          question,
          s,
          mode('evaluate'), {
            feedback: {
              type: fbType,
              message: controller.DEFAULT_FEEDBACK[fbType]
            }
          });
      }
      assertFeedback(correctSession, 'correct');
      assertFeedback(incorrectSession, 'incorrect');
      assertFeedback({ answer: [] }, 'unanswered');
    });

    describe('color contrast', () => {

      let assertDefault = (c) => {
        assertModel(`returns ${c}`, question, {}, { accessibility: { colorContrast: c } }, {
          colorContrast: c
        });
      }
      assertDefault('black_on_white');
      assertDefault('white_on_black');
      assertDefault('black_on_rose');
    });
  });
});  