const uuid = require('uuidv4');
const dbQuery = require('../database/dbQuery');

const findByLink = async (link) => {
  const result = await dbQuery.executeQuery('SELECT * FROM tests WHERE link = $1::text', [link]);
  return result.rows[0] ? result.rows[0] : null;
};

const findById = async (id) => {
  const result = await dbQuery.executeQuery('SELECT * FROM tests WHERE id = $1::text', [id]);
  return result.rows[0] ? result.rows[0] : null;
};

const findQuestionById = async (id) => {
  const result = await dbQuery.executeQuery('SELECT * FROM questions WHERE id = $1::text', [id]);
  return result.rows[0] ? result.rows[0] : null;
};

const findWithQuestionsByLink = async (link) => {
  const result = await dbQuery.executeQuery(`SELECT q.id as "questionId" , 
                                                          q.text as "questionText",
                                                          pa.id as "answerId", 
                                                          pa.text as "answerText",
                                                          t.id as "testId"
                                                    FROM tests as t
                                                    LEFT JOIN questions as q ON t.id = q.test_id
                                                    LEFT JOIN possible_answers as pa ON q.id = pa.question_id
                                                    WHERE t.link = $1::text
                                                    ORDER BY q.id`, [link]);

  const transformResults = (array) => {
    const result = {};
    result.testId = array[0].testId;
    result.questions = {};

    array.forEach((elem) => {
      const { questions } = result;
      if (!questions[elem.questionId]) {
        questions[elem.questionId] = {};
        questions[elem.questionId].text = elem.questionText;
        questions[elem.questionId].answers = [];
      }

      questions[elem.questionId].answers.push({
        answerId: elem.answerId,
        answerText: elem.answerText,
      });
    });

    return result;
  };

  return result.rows.length !== 0 ? transformResults(result.rows) : null;
};

const getResultsOfQuestionById = async (id, questionId) => {
  let result = await dbQuery.executeQuery(`SELECT un.user_id as "userId",
                                                        un.name as "userName",
                                                        ua.answer_id as "answerId"
                                                    FROM questions as q
                                                    LEFT JOIN tests as t ON t.id = q.test_id
                                                    LEFT JOIN user_answers as ua ON q.id = ua.question_id
                                                    LEFT JOIN possible_answers as pa ON pa.id = ua.answer_id
                                                    LEFT JOIN user_names_to_tests as un ON un.test_id = t.id AND ua.user_id = un.user_id
                                                    WHERE q.test_id = $1::bigint AND q.id = $2::bigint
                                                    ORDER BY un.name, un.user_id`, [id, questionId]);
  result = result.rows;

  let possibleAnswers = await dbQuery.executeQuery(`SELECT q.text as "questionName", pa.id as "answerId", pa.text as "answerText"
                                                            FROM questions as q
                                                            LEFT JOIN possible_answers as pa ON pa.question_id = q.id
                                                            WHERE q.test_id = $1::bigint AND q.id = $2::bigint
                                                            ORDER BY pa.id`, [id, questionId]);
  possibleAnswers = possibleAnswers.rows;

  const transformResults = (array) => {
    const result = {};
    result.questionId = questionId;
    result.question = possibleAnswers[0].questionName;
    result.possibleAnswers = possibleAnswers.map(pa => ({ id: pa.answerId, text: pa.answerText }));
    result.answers = [];

    array.forEach((elem) => {
      result.answers.push({
        userId: elem.userId,
        userName: elem.userName,
        answerId: elem.answerId,
      });
    });

    return result;
  };

  return transformResults(result);
};

const create = async (questions) => {
  const link = uuid();
  const result = await dbQuery.executeQuery('INSERT INTO tests VALUES (DEFAULT, $1::text) RETURNING id', [link]);
  const testId = result.rows[0].id;

  for (const questionName in questions) {
    if ({}.hasOwnProperty.call(questions, questionName)) {
      const result = await dbQuery.executeQuery('INSERT INTO questions VALUES (DEFAULT, $1::bigint, $2::text) RETURNING ID', [testId, questionName]);
      const questionId = result.rows[0].id;

      const answers = questions[questionName];
      await Promise.all(
        answers.map(a => dbQuery.executeQuery('INSERT INTO possible_answers VALUES (DEFAULT, $1::bigint, $2::text) RETURNING ID', [questionId, a])),
      );
    }
  }

  return findByLink(link);
};

module.exports = {
  create,
  findWithQuestionsByLink,
  findByLink,
  findById,
  findQuestionById,
  getResultsOfQuestionById,
};
