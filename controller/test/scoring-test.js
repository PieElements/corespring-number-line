import cloneDeep from 'lodash/cloneDeep';
import range from 'lodash/range';
import merge from 'lodash/merge';
import times from 'lodash/times';
import chai, { expect } from 'chai';
import { score, maxScore, getCorrected, getCorrectness } from '../scoring.js';

describe('getCorrected', () => {

  let correctResponse = [
    {
      "weight": 0.5,
      "type": "point",
      "pointType": "full",
      "domainPosition": 1
    },
    {
      "weight": 0.5,
      "type": "line",
      "leftPoint": "full",
      "rightPoint": "empty",
      "domainPosition": 1,
      "size": 2
    }
  ];

  let withoutWeight = (choice) => {
    let rv = cloneDeep(choice);
    delete rv.weight;
    return rv;
  }

  describe('with all correct', () => {
    let answer = cloneDeep(correctResponse).map(withoutWeight);
    let response = getCorrected(answer, correctResponse);

    it('returns all indexes in correct', () => {
      expect(response.correct).to.eql(range(correctResponse.length));
    });

    it('returns empty incorrect', () => {
      expect(response.incorrect).to.be.empty;
    });

    it('returns empty notInAnswer', () => {
      expect(response.notInAnswer).to.be.empty;
    })
  });

  describe('with some correct, no incorrect', () => {
    let correctIndexes = [0];
    let answer = correctIndexes.reduce((acc, index) => {
      acc.push(withoutWeight(correctResponse[index]));
      return acc;
    }, []);
    let response = getCorrected(answer, correctResponse);

    it('returns correctIndexes in correct', () => {
      expect(response.correct).to.eql(correctIndexes);
    });

    it('returns empty incorrect', () => {
      expect(response.incorrect).to.be.empty;
    });

    it('returns missing responses in notInAnswer', () => {
      let notInAnswer = cloneDeep(correctResponse)
        .filter((_, index) => !correctIndexes.includes(index)).map(withoutWeight);
      expect(response.notInAnswer).to.eql(notInAnswer);
    });

  });

  describe('with some incorrect', () => {
    let incorrectIndexes = [0];
    let answer = cloneDeep(correctResponse)
      .map((choice, index) => {
        return withoutWeight(incorrectIndexes.includes(index) ? (() => {
          let rv = cloneDeep(choice);
          rv.domainPosition = rv.domainPosition + 1;
          return rv;
        })() : cloneDeep(choice));
      });
    let response = getCorrected(answer, correctResponse);

    it('returns incorrect indexes in incorrect', () => {
      expect(response.incorrect).to.eql(incorrectIndexes);
    });

  });

});

describe('getCorrectness', () => {
  
  describe('all answers correct', () => {
    let reponse = getCorrectness({
      correct: [0,1],
      incorrect: [],
      notInAnswer: []
    });
    it('should return "correct"', () => {
      expect(reponse).to.eql("correct");
    });
  }); 

  describe('with some answers correct, some incorrect', () => {
    let response = getCorrectness({
      correct: [0],
      incorrect: [1],
      notInAnswer: []
    });
    it('should return "partial"', () => {
      expect(response).to.eql("partial");
    });
  });

  describe('with all answers incorrect', () => {
    let response = getCorrectness({
      correct: [],
      incorrect: [0, 1],
      notInAnswer: []
    });
    it('should return "incorrect"', () => {
      expect(response).to.eql("incorrect");
    });
  });

});

describe('score', () => {
  let correctResponse = [
    {
      "type": "point",
      "pointType": "full",
      "domainPosition": 1
    },
    {
      "type": "line",
      "leftPoint": "full",
      "rightPoint": "empty",
      "domainPosition": 1,
      "size": 2
    },
    {
      "type": "point",
      "pointType": "full",
      "domainPosition": 2
    },
  ];

  let baseQuestion = {
    correctResponse: correctResponse
  };
  
  describe('default scoring', () => {
    let question = cloneDeep(baseQuestion);
    
    describe('empty answer', () => {
      let session = {
        answer: []
      };

      it('returns 0', () => {
        expect(score(question, session)).to.eql(0);
      });
    });

    describe('correct answer', () => {
      let session = {
        answer: cloneDeep(correctResponse)
      };

      it('returns 1', () => {
        expect(score(question, session)).to.eql(1);
      });

    });

    describe('incorrect answer', () => {
      let session = {
        answer: [
          {
            "type": "point",
            "pointType": "full",
            "domainPosition": 3
          }
        ]
      };

      it('returns 0', () => {
        expect(score(question, session)).to.eql(0);
      });
    });

  });

  describe('partial scoring', () => {
    let partialScoring = [
      {
        numCorrect: 1,
        weight: 0.5
      }, {
        numCorrect: 2,
        weight: 0.75
      }
    ];
    let question = merge(cloneDeep(baseQuestion), {
      partialScoring: partialScoring
    });

    range(2).map(n => n + 1).forEach((numCorrect) => {
      
      describe(`${numCorrect} correct`, () => {
        let session = {
          answer: cloneDeep(correctResponse).slice(0, numCorrect)
        };

        it('returns weight * maxScore from appropriate partial scoring', () => {
          expect(score(question, session)).to.eql(
            partialScoring.find(p => p.numCorrect === numCorrect).weight * maxScore);
        });
      });

    });

    describe('all correct', () => {
      let session = {
        answer: cloneDeep(correctResponse)
      };

      it('returns maxScore', () => {
        expect(score(question, session)).to.eql(maxScore);
      });
    });

  });

  describe('weighted scoring', () => {
    let weightedScoring = times(3, Math.random);
    let question = (() => {
      let rv = cloneDeep(baseQuestion);
      rv.correctResponse.forEach((response, index) => {
        response.weight = weightedScoring[index];
      });
      return rv;
    })();

    describe('some correct', () => {
      let session = {};
      
      function sessionForCorrect(correct) {
        return {
          answer: correct.map(index => {
            let rv = cloneDeep(correctResponse[index]);
            delete rv.weight;
            return rv;
          })
        };
      }

      it ('should return the sum of weights for correct choices', () => {
        const correctChoices = [0, 2];
        let session = sessionForCorrect(correctChoices);
        let expectedScore = correctChoices.map((index) => {
          return question.correctResponse[index].weight;
        }).reduce((a, b) => a + b, 0);

        expect(score(question, session)).to.eql(expectedScore);
      });

    });

    describe('none correct', () => {
      let session = {
        answer: [{}]
      };

      it('should return 0', () => {
        expect(score(question, session)).to.eql(0);
      });

    });


  });

});