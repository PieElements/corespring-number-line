export function model(question, session, env) {

  if (!question) {
    return Promise.reject(new Error('question is null'));
  }
  console.log('question', question);
  return new Promise((resolve, reject) => {
    let { model } = question;
    if (model.config) {
      resolve({
        config: model.config
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