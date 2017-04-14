import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

export const maxScore = 1;

function partialScore(question, session) {
  return 0;
}

function weightedScore(question, session) {
  console.log('session', session);
  return 0;
}

function defaultScore(question, session) {
  return 0;
}

export function getCorrected(answer, correctResponse) {
  return answer.reduce((acc, selection, index) => {
    let { correct, incorrect, notInAnswer } = acc;
    let match = notInAnswer.find(correctSelection => isEqual(selection, correctSelection));

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
    notInAnswer: cloneDeep(correctResponse)
  });
}

export function scoree(question, session) {
  let partialScoring = false;
  let weightedScoring = question.correctResponse.find(response => response.weight !== undefined) !== undefined;
  if (weightedScoring) {
    return weightedScore(question, session);
  } else if (partialScoring) {
    return partialScore(question, session);
  }
  return defaultScore(question, session);
}