const connection = require('../config/dataAccess');

function Repository() {
    this.getAllCategories = (callback) => {
        var cat = [];
        connection.query(
            'SELECT * FROM categories WHERE cat_enable = 1',
            function (err, results, fields) {
                if (err)
                    return callback(err);

                var index = 1;
                results.forEach(row => {
                    cat.push({ categoryId: index, description: row.cat_description, dbId: row.cat_id })
                    index++;
                });

                callback(null, cat)
            }
        )
    };

    this.getQuestionsByCategoryId = (id, callback) => {
        var questions = [];
        connection.query(
            'SELECT * FROM question_cards q inner join categories c on q.cat_id = c.cat_id WHERE q.cat_id = ? AND c.cat_enable=1', id,
            function (err, results) {
                if(err)
                    return callback(err);

                results.forEach(row => {
                    questions.push({
                        id: row.que_id,
                        categoryId: row.cat_id,
                        question: row.que_description,
                        correctAlternativeAnswer: row.que_correct,
                        alternative1: row.que_alternative_1,
                        alternative2: row.que_alternative_2,
                        alternative3: row.que_alternative_3,
                        alternative4: row.que_alternative_4
                    })
                });
                callback(null, questions)
            }
        )
    };
  
    // this.getCategoryById = (id) => {
    //     var category;
    //     connection.query(
    //         'SELECT * FROM categories WHERE cat_id = ?', id,
    //         (err, results) => {
    //             category = { id: results[0].cat_id, description: results[0].cat_description };
    //         }
    //     )
    // };
}
module.exports = Repository;

