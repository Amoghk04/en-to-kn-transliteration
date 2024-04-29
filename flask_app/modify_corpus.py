from main import english_suggestion, kannada_suggestion
import json
# TODO: Python code to modify the corpus
def load_corpus():
    try:
        with open('../src/corpus.ts', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}