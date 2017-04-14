import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import omitBy from 'lodash/omitBy';

import { maxScore, score, getCorrected, getCorrectness } from './scoring.js';

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
    resolve({
      score: {
        scaled: score(question, session)
      }
    });
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

export function model(question, session, env) {

  if (!question) {
    return Promise.reject(new Error('question is null'));
  }

  return new Promise((resolve, reject) => {
    let { model } = question;
    if (model.config) {
      let evaluateMode = env.mode === 'evaluate';

      let corrected = evaluateMode && getCorrected(session ? session.answer || [] : [], question.correctResponse);
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
