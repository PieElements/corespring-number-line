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


const DEFAULT_FEEDBACK = {
  correct: 'Correct!',
  incorrect: 'Good try but that is not the correct answer.',
  partial: 'Almost!'
}

let getFeedback = (correctness, feedback) => {
  let message = (key, defaultFeedback) => {
    let type = feedback[`${key}Type`];
    if (type === 'none') {
      return null;
    } else if (type === 'default') {
      return defaultFeedback;
    } else if (type === 'custom') {
      return feedback[key];
    }
  }

  let key = `${correctness}Feedback`;

  let msg = message(key, DEFAULT_FEEDBACK[key]);

  if (message) {
    return { type: correctness, message: message };
  }
}

let getCorrectness = (corrected) => {
  let { incorrect, correct, notInAnswer } = corrected;

  if (incorrect.length === 0 && notInAnswer.length === 0) {
    return 'correct';
  }

  if (incorrect.length > 0 || notInAnswer.length > 0) {
    if (correct.length > 0) {
      return 'partial';
    } else {
      return 'incorrect';
    }
  }

  return 'unknown';
}


export function model(question, session, env) {

  if (!question) {
    return Promise.reject(new Error('question is null'));
  }

  return new Promise((resolve, reject) => {
    let { model } = question;
    if (model.config) {

      let evaluateMode = env.mode === 'evaluate';

      let correctResponse = cloneDeep(question.correctResponse);
      let corrected = evaluateMode ?
        getCorrected(session ? session.answer || [] : [], correctResponse) :
        null;

      let exhibitOnly = question.model.config ? question.model.config.exhibitOnly : null;
      let disabled = env.mode !== 'gather' || exhibitOnly === true;

      let correctness = getCorrectness(corrected);
      let feedback = evaluateMode && getFeedback(correctness, question.feedback);

      resolve({
        config: model.config,
        disabled,
        corrected: corrected,
        correctResponse: evaluateMode ? question.correctResponse : null,
        feedback
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