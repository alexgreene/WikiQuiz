class Question():

    def __init__ (self, text, missing):
        self.text = text
        self.missing = missing

    def __str__(self):
        return "{} in {}".format(self.missing, self.text[0:30])
        