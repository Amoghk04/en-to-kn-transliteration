from flask import Flask, request, jsonify
from flask_cors import CORS
from model_op import model_output
from modify_corpus import load_corpus

app = Flask(__name__)
CORS(app)

@app.route('/', methods=["POST","GET"])

def index():
    try:
        words = load_corpus()
        data = request.json
        word = data.get("word")
        english_suggestion = data.get('englishSuggestion')
        kannada_suggestion = data.get('kannadaSuggestion')
        
        ## The user suggestion handling ##
        if not english_suggestion or not kannada_suggestion:
            # Handle missing data
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if English suggestion exists
        if english_suggestion in words:
            words[english_suggestion].append(kannada_suggestion)  # Append to existing list
        else:
            words[english_suggestion] = [kannada_suggestion] 
        
        ## The model output ##
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
