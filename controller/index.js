import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';

let getCorrected = (answer, correctResponse) => {

  let matches = (a) => {
    return (v) => {
      return isEqual(a, v);
    }
  }

  return answer.reduce((acc, a, index) => {

    let { correct, incorrect, notInAnswer } = acc;

    let match = find(notInAnswer, matches(a));

    if (match) {
      correct.push(index);
      notInAnswer.splice(notInAnswer.indexOf(match), 1);
    } else {
      incorrect.push(index);
    }

    return {
      correct: correct,
      incorrect: incorrect,
      notInAnswer: notInAnswer
    }
  }, {
      correct: [],
      incorrect: [],
      notInAnswer: correctResponse
    });
}

export function model(question, session, env) {

  if (!question) {
    return Promise.reject(new Error('question is null'));
  }

  return new Promise((resolve, reject) => {
    let { model } = question;
    if (model.config) {

      let correctResponse = cloneDeep(question.correctResponse);
      let corrected = env.mode === 'evaluate' ?
        getCorrected(session ? session.answer || [] : [], correctResponse) :
        null;

      let exhibitOnly = question.model.config ? question.model.config.exhibitOnly : null;
      let disabled = env.mode !== 'gather' || exhibitOnly === true;
      resolve({
        config: model.config,
        disabled,
        corrected: corrected,
        correctResponse: env.mode  === 'evaluate' ? question.correctResponse : null 
      });
    }
    else {
      reject(new Error('config is undefined'));
    }
  });
}

export function outcome() {
  return Promise.resolve({});
}