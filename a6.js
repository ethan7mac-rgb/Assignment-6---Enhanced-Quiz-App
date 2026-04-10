window.onload = function(){
    this.document.querySelector("#btnLogin").addEventListener("click", Login);
    document.querySelector("#btnTakeQuiz").addEventListener("click", QuizClick);
    document.querySelector("#btnView").addEventListener("click", ViewClick);
    document.querySelector("#btnBeginQuiz").addEventListener("click", GetQuiz);
    this.document.querySelector("#btnLoadQuiz").addEventListener("click", BuildAttemptTable);
    this.document.querySelector("#showDetails").addEventListener("click", ShowDetails);
}
//Global Variables
let QUIZ = [];
let quizAttempts = [];
let user = "";
function JsonParse(text){
    QUIZ = JSON.parse(text);
    console.log("Data Parsed");
    BuildQuiz();
}
function Login(){
    user = document.querySelector("#login").value;
    if(user === ""){
        alert("Please enter a username");
        return;
    }
    document.querySelector("#user").innerHTML = user;
    document.querySelector("#loginHtml").classList.add("hidden");
    document.querySelector('#TakeView').classList.remove('hidden');
}
function QuizClick(){
    document.querySelector("#main").innerHTML = '';
    let pickQuiz = document.querySelector("#PickQuiz");
    let viewAtmpt = document.querySelector("#ViewAtmpt");

    pickQuiz.classList.remove('hidden');
    viewAtmpt.classList.add('hidden');
}
function ViewClick(){
    document.querySelector("#main").innerHTML = '';
    let pickQuiz = document.querySelector("#PickQuiz");
    let viewAtmpt = document.querySelector("#ViewAtmpt");

    pickQuiz.classList.add('hidden');
    viewAtmpt.classList.remove('hidden');
}
function GetQuiz(){
    let selQuiz = document.querySelector("#cboQuiz").value + ".json";
    console.log(selQuiz);
    let url = selQuiz;
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        JsonParse(xhr.responseText)
    }
    };
    xhr.open("GET", url, true);
    xhr.send();
}
function BuildQuiz(){
    let main = document.querySelector("#main");
    let cards = buildCards();
    main.innerHTML += '<div id="header"><h1> '+QUIZ.title+ '</h1>';
    main.innerHTML += '<div class="tabs">' + cards + '</div>';
    main.innerHTML += '<button id="btnSubmit">Submit</button>';
    main.innerHTML += '<div id="results"></div>';
    let allTabs = document.querySelectorAll(".tab");
    for(let i = 0; i < allTabs.length; i++){
        allTabs[i].classList.add("hidden");
    }
    buttonRegister();
}
function buildCards(){
    let questions = QUIZ.questions;
    let html ="";
    for(let i = 0; i < questions.length; i++){
        let obj = questions[i];
        let questNum = i+1
        html += '<input type="radio" class="radTab" id="radQ' + questNum + '" name="tabs"><label for="radQ'+ questNum + '">Question '+ questNum + '</label>';
        html += '<div class ="tab">'
        html += '<div class="card"> <h4>Question ' + questNum + '</h4>';
        html += '<div class="qBlock"><span class="qText">'+ obj.questionText + '</span>';
        for(let i = 0; i < obj.choices.length; i++){
            html += '<label> <input type="radio" name="question'+questNum+'"><span class="qAnswer">' + obj.choices[i] + '</span></label>';
        }
        html += "</div> </div> </div>"
    }
    return html;
}
function buttonRegister(){
    let tabs = document.querySelectorAll(".radTab");
    for(let i = 0; i < tabs.length; i++){
        let tab = tabs[i];
        tab.addEventListener("click", showTab);
    }
    let btnSubmit = document.querySelector("#btnSubmit");
    btnSubmit.addEventListener("click", Score)
}
function showTab(){
    let tabs = document.querySelectorAll(".tab");
    for(let i = 0; i < tabs.length; i++){
        tabs[i].classList.add("hidden");
    }
    let radBtns = document.querySelectorAll(".radTab");
    for(let i = 0; i < radBtns.length; i++){
        if(radBtns[i].checked){
            tabs[i].classList.remove("hidden");
            break;
        }
    }
}
function Score(){
    let userAnswers = [];
    let allQblock = document.querySelectorAll(".qBlock");
    console.log(allQblock);
    for(let i = 0; i < allQblock.length; i++){
        let allInput = allQblock[i].querySelectorAll("input");
        for(let i = 0; i < allInput.length; i++){
            if(allInput[i].checked){
                userAnswers.push(Number([i]))
            }
        }
    }
    let questions = QUIZ.questions;
    if(document.querySelectorAll('input:checked').length < questions.length)
        alert("Please answer all questions!");
    else{
        let score = BuildResultsTable(userAnswers, QUIZ)
        AddQuizAtmpt(score, userAnswers);
    }
}
function AddQuizAtmpt(score, userAnswer){
    let attempt = {
        userName: user,
        quiz: QUIZ,
        timestamp: new Date().toUTCString(),
        userAnswers: userAnswer,
        score: score,
        numQuestions: QUIZ.questions.length
    }
    let stored = localStorage.getItem("quizAttempts");
    if (stored === null) {
        quizAttempts = [];
    } else {
        quizAttempts = JSON.parse(stored);
    }
    console.log(attempt);
    quizAttempts.push(attempt);
    localStorage.setItem("quizAttempts", JSON.stringify(quizAttempts));
}
function BuildAttemptTable(){
    console.log("test");
    let table = document.querySelector("#AttemptTbl");
    let stored = localStorage.getItem("quizAttempts");
    if (stored === null) {
        alert("No stored attempts!");
        return;
    } else {
        quizAttempts = JSON.parse(stored);
    }
    let html = "<table><tr><th>User</th><th>Quiz</th><th>Timestamp</th></tr>";
    for(let i = 0; i < quizAttempts.length; i++){
        html += "<tr class='prevQuizRow'>";
        html += "<td>" + quizAttempts[i].userName + "</td>";
        html += "<td>" + quizAttempts[i].quiz.title + "</td>";
        html += "<td>" + quizAttempts[i].timestamp + "</td>";
        html += "</tr>";
    }
    html += '</table>';
    table.innerHTML = html;
    let allQuizRows = document.querySelectorAll('.prevQuizRow');
    for(let i = 0; i < allQuizRows.length; i++){
        allQuizRows[i].addEventListener("click", showAttempt)
    }
    document.querySelector("#main").innerHTML += '<div id="results"></div>';
}
function showAttempt(evt){
    let prevSelRow = document.querySelector(".selected");
    if(prevSelRow !== null)
        prevSelRow.classList.remove("selected");
    let selRow = evt.target.parentElement;
    selRow.classList.add("selected");
}
function ShowDetails(){
    let selRow = document.querySelector(".selected");
    let rows = Array.from(document.querySelectorAll(".prevQuizRow"));
    let i = rows.indexOf(selRow);
    let attempt = quizAttempts[i]
    
    BuildResultsTable(attempt.userAnswers, attempt.quiz);
}
function BuildResultsTable(userAnswer, quiz){
    let questions = quiz.questions;
    let score = 0;
    let correct = 0;
    let table = "";
    for(let i = 0; i < questions.length; i++){
            let answer = questions[i].answer;
            let question = questions[i];
            let userAnswerText = question.choices[userAnswer[i]];
            if(userAnswer[i] === answer){
                score++
                table+='<tr>';
                correct = 1;
            }
            else
                table+='<tr class="highlight">';

            table+='<td>Question '+ [i+1] +'</td>';
            table+='<td>'+ question.questionText +'</td>';
            table+='<td>'+answer+'</td>';
            table+='<td>'+userAnswerText+'</td>';
            table+='<td>'+correct+'</td>';
            table+='</tr>';
            correct = 0;
        }
        let html = "";
        html += '<h2 id="Score">Your Score = '+ score + "/" + questions.length + '</h2>';
        html += "<h2>Details</h2>";
        html += '<table><tr><th>Question #</th><th>Question Text</th><th>Correct Answer</th><th>Your Answer</th><th>Score</th></tr>';
        html += table;
        html += '</table>'
        let results = document.querySelector("#results");
        results.innerHTML = html;
        return score;
}