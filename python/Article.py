import wikipedia as wiki
import nltk
from nltk.tokenize import sent_tokenize
import re

import text2num as t2n

from Quiz import Quiz
from QuestionSentence import QuestionSentence

class Article():

    def __init__ (self, name):
        self.name = name
        self.page = wiki.page(name)

        self.quiz = Quiz([])

        self.generate_questions_for(
            self.page.content.encode('ascii', 'ignore'))

    ''' 
    NOT CURRENTLY USED, but maye be useful at a later point when knowing the
    section a question was sourced from might be of use.
    '''
    # def iterate_sections(self):
    #     # Iterate through article's sections
    #     for section in self.page.sections:
    #         print section
    #         sec = self.page.section(section).encode('ascii', 'ignore')
    #         if sec is None: 
    #             continue
    #         self.generate_questions_for(sec)

    '''
    tokenizes and chunks a sentence based on a simple grammar
    '''
    def get_question_data(self, s):
        tokens = nltk.word_tokenize(s)
        tagged = nltk.pos_tag(tokens)
        grammar =   """  
                    NUMBER: {<$>*<CD>+<NN>*}
                    LOCATION: {<IN><NNP>+<,|IN><NNP>+} 
                    PROPER: {<NNP|NNPS><NNP|NNPS>+}
                    """       
        # 
        # HIT!: {<PROPER><NN>?<VBZ|VBN>+}
        # DATE: {<IN>(<$>*<CD>+<NN>*)}

        chunker = nltk.RegexpParser(grammar)
        result = chunker.parse(tagged)
        return result

    '''
    splits a Wikipedia section into sentences and then chunks/tokenizes each
    sentence
    '''
    def generate_questions_for(self, sec):
        # Rid of all parentheses for easier processing
        _sec = "".join(re.split('\(', 
            sec.decode("utf-8").replace(")", "("))[0::2])

        for sentence in sent_tokenize(_sec):
            if "==" not in sentence:
                qdata = self.get_question_data(sentence)
                if len(qdata) >= 75 and len(qdata) <= 150:
                    qdata = []

                self.create_questions(sentence, qdata)

    '''
    given a setence in chunked and original form, produce the params necessary
    to create a Question, and then add that to our Quiz object
    '''
    def create_questions(self, sentence, chunked):
        gaps = []
        for word in chunked:
            if type(word) != tuple:                
                target = []
                for y in word:
                    target.append(y[0])
                orig_phrase = " ".join(target)

                if word.label() == "NUMBER":
                    modified_phrase = orig_phrase[:]

                    try:
                        # convert spelled out word to numerical value
                        modified_phrase = t2n.text2num(phrase)
                    except:
                        try:
                            test = int(modified_phrase) + float(modified_phrase)
                        except:
                            # if the word could not be converted and 
                            # was not already numerical, ignore it
                            continue

                    if self.probably_range(modified_phrase):
                        return

                    gaps.append((word.label(), orig_phrase, modified_phrase))
                elif word.label() in ["LOCATION", "PROPER"]: 
                    gaps.append((word.label(), orig_phrase, orig_phrase))

        if len(gaps) >= 2 and len(gaps) == len(set(gaps)):
            gaps_filtered = [gap for gap in gaps if gap[0] == 'NUMBER' or gap[0] == 'LOCATION']
            if len(gaps_filtered) and len(gaps) - len(gaps_filtered) > 2:
                self.quiz.add(QuestionSentence(sentence, gaps_filtered))

    '''
    Wikipedia returns non-hyphenated number ranges, so we need to check for mushed together years
    and remove them. Not a complete solution to the problem, but most of the incidents are years
    ''' 
    def probably_range(self, val):
        s = str(val)
        if s.count("19") > 1 or s.count("20") > 1 or (s.count("19") == 1 and s.count("20") == 1):
            return True
        return False
