import random

class Quiz():

    def __init__ (self, questions):
        self.questions = questions
        self.propers = []
        self.locations = []
        self.numbers = []

    # add a question this quiz
    def add(self, question):
        self.questions.append(question)

    # used by the REST endpoint to give the browser 10 questions
    def get_ten_random(self):
        selected = []
        for i in range(0,11):
            selected.append(random.choice(self.questions))

        return selected

    # the follow 3 random-related functions
    # are used to give a pool of wrong answers
    # to the browser
    def get_random_propers(self):
        if len(self.propers) == 0:
            return []

        selected = []
        for i in range(0,30):
            selected.append(random.choice(self.propers))

        return selected

    def get_random_locations(self):
        if len(self.locations) == 0:
            return []

        selected = []
        for i in range(0,30):
            selected.append(random.choice(self.locations))

        return selected

    def get_random_numbers(self):
        if len(self.numbers) == 0:
            return []

        selected = []
        for i in range(0,30):
            selected.append(random.choice(self.numbers))

        return selected

    # when the parser/chunker matches a word/phrase
    # to our grammar, lets add it to the pool of potential
    # wrong answer options
    def add_choice(self, label, word):
        if label == "PROPER":
            self.propers.append(word)
        elif label == "LOCATION":
            self.locations.append(word)
        elif label == "NUMBER":
            self.numbers.append(word)



