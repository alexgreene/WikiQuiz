import requests, json
from flask import Flask, request, Response

from Article import Article

app = Flask(__name__)


@app.route('/quiz/<article_name>/', methods = ['GET'])
def get_quiz(article_name):

    _resp = []

    a = Article(article_name)

    for question in a.quiz.get_ten_random():
        _resp.append((question.text, question.gaps))

    data_send = json.dumps({
        'sentences': _resp,
        'propers': a.quiz.get_random_propers(),
        # 'locations': a.quiz.get_random_locations(),
    })
    resp = Response(data_send, status=200, mimetype='application/json')
    #      Response("ERROR", status=500, mimetype='application/json')

    resp.headers['Access-Control-Allow-Origin'] = "*"
    return resp


if __name__ == '__main__':
    app.debug = True
    app.run()
