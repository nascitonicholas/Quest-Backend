function Question() {
    //TODO: criar function a ser invocada ao subir o servidor trazendo todas as pergurntas do banco 
    var questionsC1 = [];
    var questionsC2 = [];
    var questionsC3 = [];
    var questionsC4 = [];
    const questionCategories = []; 

    this.getAllCategories = () => {
        return questionCategories;
    }

    this.getCategory = (categoryId = 0) => {
        if(categoryId===0)
            return questionsCategory[Math.floor(Math.random()* questionsCategory.length) + 1];
  
        return questionsCategory[categoryId];
    }

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

    }

    this.getOne = (room, categoryId = 0) => {
        var category = this.getCategory(categoryId);
        var alreadyAskedQuestions = room.stateMachine.alreadAsked;
        var question; 

        switch (category.id) {
            case 1: 
            do{
                index = Math.floor(Math.random()* questionsC1.length +1);
                questionId = questionsC1[ndex].id;
            } while (alreadyAskedQuestions.find(questionId));
            
            alreadyAskedQuestions.push(questionId);
            question = questionsC1[questionId];
            break;
            
            case 2: 
            do{
                index = Math.floor(Math.random()* questionsC2.length +1);
                questionId = questionsC2[ndex].id;
            } while (alreadyAskedQuestions.find(questionId));
            
            alreadyAskedQuestions.push(questionId);
            question = questionsC2[questionId];
            break;

            case 3: 
            do{
                index = Math.floor(Math.random()* questionsC3.length +1);
                questionId = questionsC3[ndex].id;
            } while (alreadyAskedQuestions.find(questionId));
            
            alreadyAskedQuestions.push(questionId);
            question = questionsC3[questionId];
            break;
            case 4: 
            do{
                index = Math.floor(Math.random()* questionsC4.length +1);
                questionId = questionsC4[ndex].id;
            } while (alreadyAskedQuestions.find(questionId));
            
            alreadyAskedQuestions.push(questionId);
            question = questionsC4[questionId];
            break; 

            default:
            //TODO return error
        }
        return {
            id : question.id,
            category : category[categoryId],
            description : question.description,
            a : question.alternativeA,
            b : question.alternativeB,
            c : question.alternativeC,
            d : question.alternativeD,
        };
    }


}
module.exports = Question;