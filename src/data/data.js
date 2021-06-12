const connection = require('../config/dataAccess');

function getAllCategories() {
    var categories = [];
    connection.query(
        'SELECT * FROM categories',
        function (err, results, fields) {
            results.forEach(row => {
                categories.push({ id: row.cat_id, description: row.cat_description })
            });
            console.log(categories)
        }
    )
}

function getCategoryById(id) {
    var category;
    connection.query(
        'SELECT * FROM categories WHERE cat_id = ?', id,
        (err, results) => {
            category = { id: results[0].cat_id, description: results[0].cat_description };
        }
    )
}

function getQuestionsByCategoryId(id) {
    var questionsC1 = [];
    connection.query(
        'SELECT * FROM question_cards WHERE cat_id = ?', 1,
        (err, results) => {
            results.forEach(row => {
                questionsC1.push({
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
        }
    )
}


