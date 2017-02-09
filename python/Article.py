import wikipedia as wiki
from textblob import TextBlob
import math

from Quiz import Quiz
from Question import Question

class Article():

    def __init__ (self, name):
        self.name = name
        summary = wiki.page(name).summary

    def build_quiz(self):
        first_question = Question(
            "What color is the sky?",
            {
                "correct": "Blue",
                "incorrect": ["Black", "White", "Yellow"]
            })

        self.quiz = Quiz([first_question])





