from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv
from model_op import model_output

app = Flask(__name__)
CORS(app)

load_dotenv()
app.config["MONGO_URI"] = os.getenv("MONGODB_URL")
mongodb_client = PyMongo(app)
db = mongodb_client.db
temp_words = db['tempSuggestions']
words_collection = db['suggestions']

@app.route('/', methods=["POST","GET"])
def index():
    try:
        data = request.json
        word = data.get("word")
        temp_eng = data.get("englishSuggestion")
        temp_kan = data.get("kannadaSuggestion")
        if temp_eng and temp_kan:
            temp_words.insert_one({"englishWord":temp_eng,"kannadaWord":temp_kan})
        else:
            print("No word suggested")
        if word:
            kannada_word = model_output(word)
            print(kannada_word)
            if kannada_word == " ":
                return "Word not entered completely"
            else:
                word_entry = words_collection.find_one({'englishWord':word})
                print(word_entry)
                if word_entry:
                    kannada_word_from_db = word_entry['kannadaWord']
                else:
                    kannada_word_from_db = None
                
                response = {
                    'modelOutput':kannada_word,
                    'databaseOutput':kannada_word_from_db
                }
                return jsonify(response)
        else:
            return "Word not provided in request"
    except Exception as e:
        return "Error: "+str(e)

if __name__=="__main__":
    app.run(debug=True)
