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

var q_idx = 0;
var curQuery;
var correct_answer;

function new_article_query(_data) {
    if (!_data) {
        /* we've just made a search, let's get the data */
        make_request(search.value, new_article_query);
        curQuery = search.value;
    } else {
        article_name.innerHTML = search.value;
        gdata = _data;
        /* we've recieved the data, let's load the first question */
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
    resetUIForNextQuestion()
    if (q_idx === 10) { /* if we've loaded all 10 questions, we need more data */
        q_idx = 0;
        make_request(curQuery, new_article_query);
    } else {
        sentence = gdata['sentences'][q_idx];
        text = sentence[0];
        all_gaps = sentence[1]
        gap_index = getRandomInt(0, all_gaps.length-1);
        correct = all_gaps[gap_index];
        correct_answer = correct[1];
        label = correct[0];

        var redacted = convert_to_redacted(
            text,
            correct[1],
            label);

        question_body.innerHTML = redacted.text;

        if (label === "LOCATION") {
            get_wrong_locations(correct_answer);
        } else {
            var wrong_answers;
            try {
                wrong_answers = get_wrong_answers(label, correct_answer, all_gaps, gap_index); 
                displayQuestion(correct, wrong_answers);
            } catch (err) {
                q_idx += 1;
                load_question();
            }
        }
    }
}

function received_coords(correct, coords) {
    // if (coords === null) {
    //     return randomFromArr(['NYC', 'Tokyo', 'London', 'Boston', 'Miami', 
    //     'San Luis Obispo', 'Sacramento', 'San Francisco', 'Austin', 'Kiev', 
    //     'Libya', 'Tel Aviv']);
    // }
    getNearbyLocations(correct, coords['lat'], coords['lng']);
}

function received_alternates(correct, alts) {
    displayQuestion(correct, [alts[0], alts[1]])
}

function get_wrong_locations(correct_answer) {
    getCoords(correct_answer);  
}

function getNearbyLocations(correct, lat, lon) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            results = JSON.parse(xmlHttp.responseText.replace("?","").replace("(","").replace(")","").replace(";",""));
            received_alternates(correct, [results[0][1], results[1][1]]);
        }
    }
    xmlHttp.open('GET', "http://getnearbycities.geobytes.com/GetNearbyCities?callback=?&radius=100&latitude=" 
                        + lat + "&longitude=" 
                        + lon, true);  // `false` makes the request synchronous
    xmlHttp.send(null);
}

// asynch GET request to server.py
function getCoords(query) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            received_coords(query, JSON.parse(xmlHttp.responseText)['results'][0]['geometry']['location']);
        }
    }
    xmlHttp.open('GET', "https://maps.googleapis.com/maps/api/geocode/json?address=" 
                        + query.replace(" ", "+") 
                        + "&key=AIzaSyD8U9Br6Pak76wmlPpO2nVsEjgaMLUzPgs", true);
    xmlHttp.send(null);
}

function displayQuestion(correct, wrong_answers) {
    answers = [];
    var correct_answer_modified;

    if (Array.isArray(correct)) {
        correct_answer_modified = correct[2]; /* use the modified answer for the multiple choice */
    } else {
        correct_answer_modified = correct; 
    }

    answers.push(correct_answer_modified);
    answers.push(wrong_answers[0]);
    answers.push(wrong_answers[1]);
    shuffle(answers);

    answer_a.innerHTML = answers[0];
    answer_b.innerHTML = answers[1];
    answer_c.innerHTML = answers[2];

    q_idx += 1;
}

function get_wrong_answers(label, correct_answer, other_gaps, gap_index) {
  var max_num_retries = 20;

  var wrong_answer_1 = get_wrong_answer(label, correct_answer, other_gaps, gap_index).toString();
  var wrong_answer_2 = get_wrong_answer(label, correct_answer, other_gaps, gap_index).toString();

  for (var i = 0; i < max_num_retries; i++) {
    var any_answers_same = 
        wrong_answer_1 === wrong_answer_2 || 
        wrong_answer_1 === correct_answer || 
        wrong_answer_2 === correct_answer;

    if (!any_answers_same) {
      break;
    }

    wrong_answer_1 = get_wrong_answer(label, correct_answer, other_gaps, gap_index).toString();
    wrong_answer_2 = get_wrong_answer(label, correct_answer, other_gaps, gap_index).toString();
  }

  if (any_answers_same) {
    // assuming that these are bounded year values that have convereged.
    to_ret = [(parseInt(wrong_answer_1) + 1).toString(), (parseInt(wrong_answer_2) - 1).toString()];
  }

  return [wrong_answer_1, wrong_answer_2];
}

function get_wrong_answer(label, correct_answer, other_gaps, gap_index) {
    if (label === "PROPER") {
        return randomFromArr(other_gaps)[1];
    } else {
        num_as_str = correct_answer.toString().replace(",", "").replace("S", "");
        num = cleanUpNum(correct_answer);
        if (num.toString() === num_as_str) {
            /* the answer is an integer */

            if (mightBeYear(num)) { 
                /* the answer is likely a year */
                /* now find the lower bound based on other years in the sentence */
                lower_bound = num - 50;
                for (var i = 0; i < gap_index; i++) {
                    var to_compare = cleanUpNum(other_gaps[i][2]);
                    if (mightBeYear(to_compare) && to_compare > lower_bound)  {
                        lower_bound = to_compare +1;
                    }
                }

                /* find the upper bound */
                upper_bound = num + 30;
                for (var i = gap_index + 1; i < other_gaps.length; i++) {
                    var to_compare = cleanUpNum(other_gaps[i][2])
                    if (mightBeYear(to_compare) && to_compare < upper_bound)  {
                        upper_bound = to_compare -1;
                    }
                }

                if (upper_bound - lower_bound < 4) {
                    throw "Range too small" 
                }

                generated = num + (getRandomInt(1, 10) * posOrNeg());
                generated = Math.min(upper_bound, generated);
                generated = Math.max(lower_bound, generated);

                if (num <= 2017) { return Math.min(generated, 2017); }

                return generated;
            }
            to_ret = parseInt(Math.max(0, num + (getRandomInt(num * .01, num * 2) * posOrNeg())));
            if (to_ret > 30 && to_ret < 45) { to_ret = 31; }
            return to_ret;

        }
        else {
           return parseFloat(num_as_str) + (parseFloat(num_as_str) * .01 * posOrNeg());
        }
        
    }
}

function mightBeYear(num) {
    return (num >= 1400 && num < 2030);
}

// extracts a random element from an array
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
    _answer = answer.toString().replace(' ,',',');
    
    if (label === "NUMBER") {
        // if the answer is a number, we want to match
        // the numerical portion, not $, %, etc
        _answer = answer.toString().replace(/[^0-9.,]/g,'');

        // if the the number is spelled out
        // ie. `twelve`, leave it as it is.
        if (_answer === "") {
            _answer = answer;
        }
    }

    var redacted_text = text.replace(_answer, "❓");
    var redacted_answer = _answer;

    return {
      text: redacted_text,
      answer: redacted_answer,
    };
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

function resetUIForNextQuestion() {
    answer_response_label.style.display = "none";
    answer_a.style.display = "block";
    answer_b.style.display = "block";
    answer_c.style.display = "block";
    next_question_btn.style.display = "block";
}


/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 * note: borrowed from StackOverflow answer
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function posOrNeg() {
    z = getRandomInt(0,2)
    if (z > 0) {
        return 1;
    }
    else {
        return -1;
    }
}

function cleanUpNum(num){
    return parseInt(num.toString().replace(",", "").replace("S", ""));
}

// "https://maps.googleapis.com/maps/api/geocode/json?address=New+York+City&key=AIzaSyD8U9Br6Pak76wmlPpO2nVsEjgaMLUzPgs"

// https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyD8U9Br6Pak76wmlPpO2nVsEjgaMLUzPgs

// http://getnearbycities.geobytes.com/GetNearbyCities?callback=?&radius=100&latitude=40.714224&longitude=-73.961452


