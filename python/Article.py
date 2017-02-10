import wikipedia as wiki
import nltk
from nltk.tokenize import sent_tokenize
import re

from Quiz import Quiz
from Question import Question

class Article():

    def __init__ (self, name):
        self.name = name
        page = wiki.page(name)
        summary = page.summary.encode('ascii', 'ignore')

        _sections = page.sections

        sections = []
        for section in _sections:
            sec = page.section(section)
            if sec is not None:
                processed = self.process_section(page.section(section))
                if len(processed) > 0:
                    sections.append(
                        (section, processed))

        print "-----------------------------"
        print "-----------------------------"
        print "-----------------------------"
        print "\n"

        for word in sections[1][1]:
            print word

    def process_section(self, s):
        s = s.replace(")", "(")
        s = re.split('\(', s)
        s = "".join(s[0::2])
        _sentences = sent_tokenize(s)

        sentences = []
        for sent in _sentences:
            sentences.append(
                self.chunk_sentence(sent))

        return sentences

    def chunk_sentence(self, s):

        tokens = nltk.word_tokenize(s)
        tagged = nltk.pos_tag(tokens)
        grammar = """  
                    NUMBER: {<$>*<CD>+<NN>*}
                    DATE: {<IN><NUMBER>}
                    LOCATION: {<NNP>+<,><NNP>+}
                    PROPER: {<NNP|NNPS>+}
                    PROPER_FOR_MATCH: {(<NNP|NNPS>+<NN>?(<CC>?<DT>?<IN>?<NNP|NN>)+)+}
                    PROPER_LIST: {(<PROPER><CC><PROPER><CC>?)+}
                    THING: {<JJ|JJR>+<NN|NNS>+<CC>?<NN>*}
                    MATCH: {<THING><.*>?<.*>?<PROPER_FOR_MATCH>+}

                    HIT!: {<PROPER><NN>?<VBZ|VBN>+}
                     """            
                    
        # HIT and MATCH will be used for generating questions
                    
        chunker = nltk.RegexpParser(grammar)
        result = chunker.parse(tagged)

        return result



    def build_quiz(self):
        first_question = Question(
            "What color is the sky?",
            {
                "correct": "Blue",
                "incorrect": ["Black", "White", "Yellow"]
            })

        self.quiz = Quiz([first_question])

