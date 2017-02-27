import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import omitBy from 'lodash/omitBy';

let score = (number) => {
  return {
    score: {
      scaled: number
    }
  }
}

let getPartialScore = (corrected, ps) => {
  let { correct } = corrected;
  let rule = ps.find(r => r.numberOfCorrect === correct.length);

  if (rule) {
    return 1.0 * (rule.scorePercentage / 100);
  } else {
    return 0;
  }
}

export function outcome(question, session) {
  session.answer = session.answer || [];

  return new Promise((resolve, reject) => {

    let corrected = getCorrected(session.answer, cloneDeep(question.correctResponse));
    let correctness = getCorrectness(corrected);

    if (correctness === 'correct') {
      resolve(score(1.0));
    } else if (correctness === 'incorrect') {
      resolve(score(0.0));
    } else if (correctness === 'partial') {
      let { allowPartialScoring, partialScoring } = question;
      let ps = (partialScoring || []).filter(o => !isEmpty(o));
      let canDoPartialScoring = allowPartialScoring && ps.length > 0;
      if (canDoPartialScoring) {
        resolve(score(getPartialScore(corrected, ps)))
      } else {
        resolve(score(0.0));
      }
    } else {
      resolve({ score: { scaled: -1 } });
    }
  });
}

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


export const DEFAULT_FEEDBACK = {
  correct: 'Correct!',
  incorrect: 'Good try but that is not the correct answer.',
  partial: 'Almost!',
  unanswered: 'You have not entered a response'
}

let getFeedback = (correctness, feedback) => {

  let message = (key, defaultFeedback) => {
    let type = feedback ? feedback[`${key}Type`] : 'default';

    if (type === 'none') {
      return null;
    } else if (type === 'default') {
      return defaultFeedback;
    } else if (type === 'custom') {
      return feedback[key];
    }
  }

  if (correctness === 'unanswered') {
    return {
      type: 'unanswered',
      message: DEFAULT_FEEDBACK.unanswered
    }
  }

  let key = `${correctness}Feedback`;

  let msg = message(key, DEFAULT_FEEDBACK[correctness]);

  if (msg) {
    return { type: correctness, message: msg };
  }
}

let getCorrectness = (corrected) => {
  let { incorrect, correct, notInAnswer } = corrected;

  if (incorrect.length === 0 && correct.length === 0) {
    return 'unanswered';
  }

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
      let corrected = evaluateMode && getCorrected(session ? session.answer || [] : [], correctResponse);
      let correctness = evaluateMode && getCorrectness(corrected);

      let exhibitOnly = question.model.config ? question.model.config.exhibitOnly : null;
      let disabled = env.mode !== 'gather' || exhibitOnly === true;

      let feedback = evaluateMode && getFeedback(correctness, question.feedback);

      let out = {
        config: model.config,
        disabled,
        corrected,
        correctResponse: evaluateMode && ['unanswered', 'correct'].indexOf(correctness) === -1 && question.correctResponse,
        feedback,
        colorContrast: env.accessibility && env.accessibility.colorContrast || 'black_on_white'
      };

      resolve(omitBy(out, v => !v));
    }
    else {
      reject(new Error('config is undefined'));
    }
  });
}
