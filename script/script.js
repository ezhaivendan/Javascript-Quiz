// Utils
function enableContainer(id) {
    document.getElementById(id).style.display = 'block';
}

function disableContainer(id) {
    document.getElementById(id).style.display = 'none';
}

function enableAnswerContainer(className) {
    let elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'block';
    };
}

// Get category starts here
class loadCategoryQuiz {
    constructor(category) {
        this.category = category;
    }
    // set category into html select box.
    loadCategoryIntoHtml() {
        let defaultOption = [];
        defaultOption.push('<option value="default">Select type</options>');
        let categoryHtml = this.category.map(options => `<option value=${options.id}>${options.name}</options>`);
        defaultOption.push(...categoryHtml);
        document.getElementById('quiz-category').innerHTML = defaultOption.join("");
    }
}

async function fetchCategoryFromAPI() {
    let jsonRes = await fetch('https://opentdb.com/api_category.php');
    let response = await jsonRes.json();
    return formCategoryResponse(response);
}

function formCategoryResponse(categories) {
    new loadCategoryQuiz(categories.trivia_categories).loadCategoryIntoHtml();
}


function userSelectedCategory() {
    disableContainer('question-form-container');
    disableContainer('result-container');
    return fetchCategoryLevelsFromAPI(document.getElementById("quiz-category").value);
}

// Get category ends here

// Get levels starts here
class loadCategoryLevelsQuiz {
    constructor(levels) {
        this.levels = levels.category_question_count;
    }
    loadCategoryLevelsIntoHtml() {
        let categoryLevelHtml = [
            `<option value="default">Select type</options>`,
            `<option value="easy">Easy: ${this.levels.total_easy_question_count}</options>`,
            `<option value='medium'>Medium: ${this.levels.total_medium_question_count}</options>`,
            `<option value='hard'>Hard: ${this.levels.total_hard_question_count}</options>`
        ];
        document.getElementById('quiz-category-levels').innerHTML = categoryLevelHtml.join("");
    }
}

async function fetchCategoryLevelsFromAPI(selectedCategoryId) {
    let jsonRes = await fetch(`https://opentdb.com/api_count.php?category=${selectedCategoryId}`);
    let response = await jsonRes.json();
    return formCategoryLevels(response);
}

function formCategoryLevels(levels) {
    enableContainer('quiz-category-levels');
    new loadCategoryLevelsQuiz(levels).loadCategoryLevelsIntoHtml();
}

function userSelectedCategorylevels() {
    disableContainer('result-container');
    let selectedLevelType = document.getElementById("quiz-category-levels").value;
    let categoryId = document.getElementById("quiz-category").value;
    fetchQuestionsFromAPI(categoryId, selectedLevelType);
}
// Get levels ends here


// Get questions starts here
class LoadQuizQuestion {
    constructor(questions) {
        this.questions = questions;
    }
   
    loadQuizQuestionsIntoHtml() {
        let formedQuestion = this.questions.map((question, index) => {  
            question.incorrect_answers.push(question.correct_answer);
            let answers = question.incorrect_answers.sort(() => Math.random()-0.7);
            return`<div><p id="question-${index}">${question.question}</p>
                    ${answers.map(ans => `<div>
                        <input type="radio" name="answer${index}" value="${ans}"/>
                        <label>${ans}</label></div>`
                    ).join('')}
                    <p id="answer-container-${index}" style="display:none"></p>
                </div>`
        });
        localStorage.setItem('questionArr', JSON.stringify(this.questions));
        document.getElementById('question-container').innerHTML = formedQuestion.join("");
    }
}
async function fetchQuestionsFromAPI(categoryId, selectedLevelType) {
    let jsonRes = await fetch(`https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${selectedLevelType}`);
    let response = await jsonRes.json();
    return formQuizQuestions(response.results);
}

function formQuizQuestions(questions) {
    enableContainer('question-form-container');
    new LoadQuizQuestion(questions).loadQuizQuestionsIntoHtml();
}

function validation(questionArr, validation = true) {
    questionArr.forEach((question, index) => {
        const selector = `input[name=answer${index}]:checked`;
        const answerContainer = document.getElementById('question-container');
        question.userAnswer = (answerContainer.querySelector(selector) || {}).value;
        document.getElementById(`question-${index}`).style.color = 'black';
        if( question.userAnswer === undefined) {
            validation = false;
            document.getElementById(`question-${index}`).style.color = 'red';
        }
    });
    return validation;
}

function calculateResult() {
    let questionArr = JSON.parse(localStorage.getItem('questionArr'));
    if(!validation(questionArr)){
        return;
    }
    let count = 0;
    questionArr.forEach((question, index) => {
        console.log(question.userAnswer)
        if(question.userAnswer === question['correct_answer']) {
            count++;
            document.getElementById(`answer-container-${index}`).style.color ='green';
        } else {
            document.getElementById(`answer-container-${index}`).style.color ='red';
        }
        document.getElementById(`answer-container-${index}`).style.display ='block';
        document.getElementById(`answer-container-${index}`).innerHTML = questionArr[index].correct_answer;
    });
    enableContainer('result-container');
    document.getElementById('result-container').innerHTML = `Your Result is - ${count}/${questionArr.length}`;
}

// Get questions ends here

fetchCategoryFromAPI();
