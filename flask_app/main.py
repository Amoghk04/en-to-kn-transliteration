from flask import Flask, request
from flask_cors import CORS
from model_op import model_output

app = Flask(__name__)
CORS(app)

@app.route('/', methods=["POST","GET"])

def index():
    try:
        data = request.json
        word = data.get("word")
        if word:
            kannada_word = model_output(word)
            print(kannada_word)
            if kannada_word == " ":
                return "Word not entered completely"
            else:
                return kannada_word
        else:
            return "Word not provided in request"
    except Exception as e:
        return "Error: "+str(e)

if __name__=="__main__":
    app.run(debug=True)
