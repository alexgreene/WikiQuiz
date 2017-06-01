import random

class Quiz():

    def __init__ (self, questions):
        self.questions = questions
        self.propers = []
        self.locations = []

    # add a question this quiz
    def add(self, question):
        self.questions.append(question)

    # used by the REST endpoint to give the browser 10 questions
    def get_ten_random(self):
        return _sample(self.questions, 10)

    # the follow 3 random-related functions
    # are used to give a pool of wrong answers
    # to the browser
    def get_random_propers(self):
        return _sample(self.propers, 100)

    def get_random_locations(self):
        return _sample(self.locations, 100)

    # when the parser/chunker matches a word/phrase
    # to our grammar, let's add it to the pool of potential
    # wrong answer options
    def add_choice(self, label, word):
        if label == "PROPER":
            self.propers.append(word)
        elif label == "LOCATION":
            self.locations.append(word)


def _sample(population, number):
    if not population:
        return []
    elif len(population) <= number:
        return [random.choice(population) for _ in range(number)]
    else:
        return random.sample(population, number)
