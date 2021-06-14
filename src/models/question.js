const repository = new (require('../data/repository'))();

function Question() {
    var questionsC1 = [];
    var questionsC2 = [];
    var questionsC3 = [];
    var questionsC4 = [];

    var questionCategories = [];

    this.getAllCategories = (error, success) => {

        repository.getAllCategories((error, success) =>{
            if(error)
                return console.log('Falha ao buscar Categorias na base. Erro: ', error)
            
            questionCategories = success;
            console.log("categories: ", questionCategories)
            return questionCategories;
        })
    };

    this.getAllQuestionCards = (error, success) => {

        repository.getQuestionsByCategoryId('1', (error, success) => {
            if (error)
                return console.log('Falha ao buscar os Cards de Questao da base. Erro: ', error)

            questionsC1 = success;
            console.log("questions1: ",questionsC1);
            return questionsC1;
        });

        repository.getQuestionsByCategoryId('2', (err, success) => {
            if (err)
                return console.log('Falha ao buscar os Cards de Questao da base')

            questionsC2 = success;
            console.log("questions2: ", questionsC2);
            return questionsC2;
        });

        repository.getQuestionsByCategoryId('3', (err, success) => {
            if (err)
                return console.log('Falha ao buscar os Cards de Questao da base')

            questionsC3 = success;
            console.log("questions3: ", questionsC3);
            return questionsC3;
        });

        repository.getQuestionsByCategoryId('4', (err, success) => {
            if (err)
                return console.log('Falha ao buscar os Cards de Questao da base')

            questionsC4 = success;
            console.log("questions4: ", questionsC4);
            return questionsC4;
        });
    };

    this.getCategory = (categoryId = 0) => {
        if (categoryId === 0)
            return questionCategories[Math.floor(Math.random() * questionCategories.length) + 1];

        return questionCategories[categoryId];
    };

    this.findById = (questionId, categoryId) => {
        var question;
        switch (categoryId) {
            case 1:
                question = questionsC1.find(x => x.id == questionId);
                break;
            case 2:
                question = questionsC2.find(x => x.id == questionId);
                break;
            case 3:
                question = questionsC3.find(x => x.id == questionId);
                break;
            case 4:
                question = questionsC4.find(x => x.id == questionId);
                break;
        }
        return question;

    };

    this.getOne = (room, categoryId = 0) => {
        var category = this.getCategory(categoryId);
        var alreadyAskedQuestions = room.stateMachine.alreadAsked;
        var question;

        switch (category.id) {
            case 1:
                do {
                    index = Math.floor(Math.random() * questionsC1.length + 1);
                    questionId = questionsC1[ndex].id;
                } while (alreadyAskedQuestions.find(questionId));

                alreadyAskedQuestions.push(questionId);
                question = questionsC1[questionId];
                break;

            case 2:
                do {
                    index = Math.floor(Math.random() * questionsC2.length + 1);
                    questionId = questionsC2[ndex].id;
                } while (alreadyAskedQuestions.find(questionId));

                alreadyAskedQuestions.push(questionId);
                question = questionsC2[questionId];
                break;

            case 3:
                do {
                    index = Math.floor(Math.random() * questionsC3.length + 1);
                    questionId = questionsC3[ndex].id;
                } while (alreadyAskedQuestions.find(questionId));

                alreadyAskedQuestions.push(questionId);
                question = questionsC3[questionId];
                break;
            case 4:
                do {
                    index = Math.floor(Math.random() * questionsC4.length + 1);
                    questionId = questionsC4[ndex].id;
                } while (alreadyAskedQuestions.find(questionId));

                alreadyAskedQuestions.push(questionId);
                question = questionsC4[questionId];
                break;

            default:
                console.log('categoria nao encontrada');
        }
        return {
            id: question.id,
            category: category[categoryId],
            description: question.description,
            a: question.alternativeA,
            b: question.alternativeB,
            c: question.alternativeC,
            d: question.alternativeD,
        };
    };
}
module.exports = Question;