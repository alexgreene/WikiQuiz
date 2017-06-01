class QuestionSentence():

    def __init__ (self, text, gaps):
        self.text = text
        self.gaps = gaps

    def __str__(self):
        return "{} in {}".format(self.gaps, self.text)
        