from transformers import MT5ForConditionalGeneration, T5Tokenizer

model_path = 'flask_app/model'
tokenizer_path = 'flask_app/model'
model = MT5ForConditionalGeneration.from_pretrained(model_path)
tokenizer = T5Tokenizer.from_pretrained(tokenizer_path)

def model_output(english_word):
    name = english_word

    input_ids = tokenizer.encode(name, return_tensors="pt")

    output_ids = model.generate(input_ids)

    output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    return output_text
