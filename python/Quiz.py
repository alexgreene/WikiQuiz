import random

class Quiz():

    def __init__ (self, questions):
        self.questions = questions

    def add(self, question):
        self.questions.append(question)

    def get_ten_random(self):
        selected = []
        
        for i in range(0,11):
            selected.append(random.choice(self.questions))

        return selected


