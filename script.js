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
        console.log(data);
        load_question();
    }
}

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
    answer_response_label.style.display = "none";
    answer_a.style.display = "block";
    answer_b.style.display = "block";
    answer_c.style.display = "block";
    next_question_btn.style.display = "block";
    if (q_idx === 10) {
        q_idx = 0;
        make_request(curQuery, new_article_query);
    } else {
        question_body.innerHTML = data['questions'][q_idx][1];
        label =  data['questions'][q_idx][0];
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

function randomFromArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function answered_a() {
    console.log(correct_answer);
    console.log(answer_a.innerHTML);
    if (correct_answer === answer_a.innerHTML){
        answer_response_label.innerHTML = "Correct!";
    } else {
        answer_response_label.innerHTML = "That's wrong...";
    }
    answer_response_label.style.display = "block";
}

function answered_b() {
    if (correct_answer === answer_b.innerHTML){
        answer_response_label.innerHTML = "Correct!";
    } else {
        answer_response_label.innerHTML = "That's wrong...";
    }
    answer_response_label.style.display = "block";
}

function answered_c() {
    if (correct_answer === answer_c.innerHTML){
        answer_response_label.innerHTML = "Correct!";
    } else {
        answer_response_label.innerHTML = "That's wrong...";
    }
    answer_response_label.style.display = "block";
}

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



