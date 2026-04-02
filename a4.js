//Ajax call to desired JSON that is sent into build site
window.onload = function(){
    console.log("link test");
    let url = "CoffeeQuiz.json";
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        buildSite(xhr.responseText)
    }
    };
    xhr.open("GET", url, true);
    xhr.send();
}
//Global variable for storing the quiz JSON in
let QUIZ = [];
//the build site which effectively replaces window onload since everything we are doing in this is after we parse the JSON
function buildSite(text){
    QUIZ = JSON.parse(text);
    console.log("Data Parsed");
    let main = document.querySelector("#main");
    let cards = buildCards();
    //sets up our initial html
    main.innerHTML = "<h1>" + QUIZ.title + "</h1>";
    main.innerHTML += '<div class="tabs">' + cards + '</div>';
    main.innerHTML += '<button id="btnSubmit">Submit</button>';
    main.innerHTML += '<div id="results"></div>';
    //hides all the tab contents
    let allTabs = document.querySelectorAll(".tab");
    for(let i = 0; i < allTabs.length; i++){
        allTabs[i].classList.add("hidetab");
    }
    //registers the buttons if this was done in window onload then it causes issues with not being able to pull from the JS created html
    buttonRegister();
}
//builds all the cards for the html
function buildCards(){
    let questions = QUIZ.questions;
    let html ="";
    //loops through all the questions in the JSON and creates the cards with all the information from them
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
//registers all our buttons
function buttonRegister(){
    let main = document.querySelector("#main");
    console.log("Log Worked", main.innerHTML)
    let tabs = document.querySelectorAll(".radTab");
    for(let i = 0; i < tabs.length; i++){
        let tab = tabs[i];
        tab.addEventListener("click", showTab);
    }
    let btnSubmit = document.querySelector("#btnSubmit");
    btnSubmit.addEventListener("click", Score)
}
//handles showing the clicked tab and hiding any non clicked tabs 
function showTab(){
    let tabs = document.querySelectorAll(".tab");
    for(let i = 0; i < tabs.length; i++){
        tabs[i].classList.add("hidetab");
    }
    let radBtns = document.querySelectorAll(".radTab");
    for(let i = 0; i < radBtns.length; i++){
        if(radBtns[i].checked){
            tabs[i].classList.remove("hidetab");
            break;
        }
    }
}
//handles all the html which falls in the results div
function Score(){
    let questions = QUIZ.questions;
    let score = 0;
    console.log(questions[0]);
    let table = ""
    console.log(document.querySelectorAll('input:checked'));
    //makes sure you answer all questions
    if(document.querySelectorAll('input:checked').length < questions.length)
        alert("Please answer all questions!");
    else{
        //loops through our questions
        for(let i = 0; i < questions.length; i++){
            let question = questions[i];
            let answer = question.choices[question.answer];
            let correct = 0;
            //finds out the users answer
            let userAnswer = document.querySelector('input[name="question' + (i+1) + '"]:checked');
            let userAnswerText = "";
            if(userAnswer === null)
                userAnswerText = "No Answer";
            else
                userAnswerText = userAnswer.parentElement.textContent.trim();
            console.log(userAnswerText);
            //if that user answer is correct set our correct variable to 1, increments score and if not makes the <tr> with the highlight class
            if(userAnswerText === answer){
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
        }
        //creates the html to go in results
        let html = "";
        html += '<h2 id="Score">Your Score = '+ score + "/" + questions.length + '</h2>';
        html += "<h2>Details</h2>";
        html += '<table><tr><th>Question #</th><th>Question Text</th><th>Correct Answer</th><th>Your Answer</th><th>Score</th></tr>';
        html += table;
        html += '</table>'

        let results = document.querySelector("#results");
        results.innerHTML = html;
    }
}