# WikiQuiz

*Hello!* Thanks for checking out my project, WikiQuiz. Since posting this repo, there have been quite a number of folks who've starred or forked it. It's been awesome to watch! I'd love to know what you are building, or how you're using this project. I'm considering expanding on what's here, and knowing how it's being used would be extremely helpful. Send me an email (Find the *contact* button on http://alexgreene.me/) or reach out on Twitter https://www.twitter.com/alexg473 and say hello!

![alt tag](http://i.imgur.com/Bx7l18S.png)

## To run:
requirements.txt contains the libraries/modules you'll need (It's come to my attention that the Wikipedia library has a bug, so I recommend this instead: http://stackoverflow.com/questions/34869597/wikipedia-api-for-python#35122688). You'll also need to download some data so that the nltk library works. To do this, start the Python console (ie. type `python` on the command line) and then: 

    >>> import nltk
    >>> nltk.download('averaged_perceptron_tagger')
    >>> nltk.download('punkt')

Run server.py to get the Flask endpoints working, and then open up index.html - that's all!

## Potential Future Improvements:
Choosing more appropriate multiple-choice options, especially for numbers 

_ie. if the answer is '1960s', show '1950s' as another option._

Ignoring the less text heavy parts of a Wikipedia page.

Creating more interesting grammar for the text chunker, which would lead to more interesting question types.

Some of the questions presented currently lack context about what the question is referring to. A further version of this project would attempt to interpret the context of the sentence in question and include that in the question.

_ie. references to 'they' or 'he' would be replaced by what those pronouns are actually referring to._



