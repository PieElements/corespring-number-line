import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

export const maxScore = 1;

function partialScore(question, session) {
  let corrected = getCorrected(session.answer, question.correctResponse);
  let allCorrect = corrected.correct.length === question.correctResponse.length && corrected.incorrect.length === 0;
  if (allCorrect) {
    return maxScore;
  }
  if (question.partialScoring) {
    let scoring = question.partialScoring.find(({ numCorrect, weight }) => numCorrect === corrected.correct.length);
    return scoring ? (scoring.weight * maxScore) : 0;
  }
  return 0;
}

function weightedScore(question, session) {
  return question.correctResponse.filter((response) => {
    let choice = cloneDeep(response);
    delete choice.weight;
    return session.answer.find(value => isEqual(value, choice)) !== undefined;
  }).reduce((acc, { weight }) => {
    return acc + (weight !== undefined ? weight * maxScore : 0);
  }, 0);
}

function defaultScore(question, session) {
  let corrected = getCorrected(session.answer, question.correctResponse);
  let correctness = getCorrectness(corrected);
  return correctness === 'correct' ? maxScore : 0;
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

    return acc;
  }, {
    correct: [],
    incorrect: [],
    notInAnswer: cloneDeep(correctResponse).map((choice) => {
      delete choice.weight;
      return choice;
    })
  });
}

export function getCorrectness(corrected) {
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

export function score(question, session) {
  let weightedScoring = question.correctResponse.find(response => response.weight !== undefined) !== undefined;
  if (weightedScoring) {
    return weightedScore(question, session);
  } else if (question.partialScoring !== undefined) {
    return partialScore(question, session);
  }
  return defaultScore(question, session);
}