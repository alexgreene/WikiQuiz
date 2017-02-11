var article_name = document.getElementById('article_name');
var question_body = document.getElementById('question_body');
var search = document.getElementById('article_name_input');
var next_question_btn = document.getElementById('next_question_btn');
var answer_a = document.getElementById('answer_a');
var answer_b = document.getElementById('answer_b');
var answer_c = document.getElementById('answer_c');
var answer_response_label = document.getElementById('answer_response_label');
    answer_response_label.style.display = "none";
    answer_a.style.display = "none";
    answer_b.style.display = "none";
    answer_c.style.display = "none";
    next_question_btn.style.display = "none";

var data;
var q_idx = 0;
var curQuery;
var correct_answer;

function new_article_query(_data) {
    if (!_data) {
        make_request(search.value, new_article_query);
        curQuery = search.value;
    } else {
        article_name.innerHTML = search.value;
        data = _data;
        //console.log(data);
        load_question();
    }
}

// asynch GET request to server.py
function make_request(query, _callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            _callback(JSON.parse(xmlHttp.responseText));
        }
    }
    xmlHttp.open("GET", 'http://127.0.0.1:5000/quiz/' + query + "/", true); 
    xmlHttp.send(null);
}

function load_question() {
    loadUIForNextQuestion()
    if (q_idx === 10) {
        q_idx = 0;
        make_request(curQuery, new_article_query);
    } else {
        label =  data['questions'][q_idx][0];

        question_body.innerHTML = convert_to_redacted(
            data['questions'][q_idx][1], 
            data['questions'][q_idx][2],
            label);
        
        answers = [];
        correct_answer = data['questions'][q_idx][2];
        answers.push(correct_answer);
        answers.push(get_wrong_answer(label));
        answers.push(get_wrong_answer(label));
        shuffle(answers);

        answer_a.innerHTML = answers[0];
        answer_b.innerHTML = answers[1];
        answer_c.innerHTML = answers[2];

        q_idx += 1;
    }
}

function get_wrong_answer(label) {
    if (label === "LOCATION") {
        return randomFromArr(data['locations']);
    } else if (label === "PROPER") {
        return randomFromArr(data['propers']);
    } else {
        return randomFromArr(data['numbers']);
    }
}

// extracts a random element from an array
// logic taken from Stack Overflow answer
function randomFromArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Hides the correct answer from the question text and
// replaces it with a ? emoji
function convert_to_redacted(text, answer, label) {
    _answer = answer;

    // when handling locations, the parser reconstructs with comma
    // spaced from prior word ie IN TAKANEZAWA , JAPAN
    // rather than IN TAKANEZAWA, JAPAN
    _answer = answer.replace(' ,',',');
    
    if (label === "NUMBER") {
        // if the answer is a number, we want to match
        // the numerical portion, not $, %, etc
        _answer = answer.replace(/[^0-9]/g,'');

        // if the the number is spelled out
        // ie. `twelve`, leave it as it is.
        if (_answer === "") {
            _answer = answer;
        }
    }
    return text.replace(_answer, "❓");
}

function handleAnswerResponse(answer_given) {
    if (correct_answer === answer_given){
        answer_response_label.innerHTML = "Correct!";
    } else {
        answer_response_label.innerHTML = "That's wrong...";
    }
    answer_response_label.style.display = "block";
}

function answered_a() {
    handleAnswerResponse(answer_a.innerHTML);
}

function answered_b() {
    handleAnswerResponse(answer_b.innerHTML);
}

function answered_c() {
    handleAnswerResponse(answer_c.innerHTML);
}

function loadUIForNextQuestion() {
    answer_response_label.style.display = "none";
    answer_a.style.display = "block";
    answer_b.style.display = "block";
    answer_c.style.display = "block";
    next_question_btn.style.display = "block";
}


// I borrowed the following from a Stack Overflow answer

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

