import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';

let getCorrected = (answer, correctResponse) => {

  let matches = (a) => {
    return (v) => isEqual(a, v);
  }

  return answer.reduce((acc, a) => {

    let match = find(correctResponse, matches(a));

    if (match) {
      correctResponse.splice(correctResponse.indexOf(match), 1);
      a.correct = true;
    } else {
      a.correct = false;
    }

    return {
      elements: acc.elements.concat([a]),
      correctResponse: correctResponse
    }

  }, { elements: [], correctResponse: correctResponse });
}

export function model(question, session, env) {

  if (!question) {
    return Promise.reject(new Error('question is null'));
  }
  console.log('question', question);
  return new Promise((resolve, reject) => {
    let { model } = question;
    if (model.config) {

      let correctResponse = cloneDeep(question.correctResponse);
      let corrected = getCorrected(session ? session.answer || [] : [], question.correctResponse);
      console.log('corrected:', corrected);

      let disabled = env.mode !== 'gather';
      resolve({
        config: model.config,
        disabled,
        elements: corrected.elements,
        missingResponses: []
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