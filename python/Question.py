class Question():

    def __init__ (self, text, missing, label):
        self.text = text
        self.missing = missing
        self.label = label

    def __str__(self):
        return "{}: {} in {}".format(self.label, self.missing, self.text[0:30])
        