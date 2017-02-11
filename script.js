var article_name = document.getElementById('article_name');
var question_body = document.getElementById('question_body');
var search = document.getElementById('article_name_input');

var data;
var q_idx = 0;
var curQuery;

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
    if (q_idx === 10) {
        q_idx = 0;
        make_request(curQuery, new_article_query);
    } else {
        question_body.innerHTML = data['questions'][q_idx][1];
        q_idx += 1;
    }
}



