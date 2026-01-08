# Government Of Karnataka Internship

A Natural Language Processing project build for the Government of Karnataka for transliteration of text from English to Kannads for internal office use.

### Dataset

We used the Aksharanthar dataset for the Kannada language to fine-tune the Google T5 Large model for our needs.
- Total Samples: 2921K
- Train: 2907K
- Validation: 7K
- Test: 7K

### Model Architecture

We used the Google T5 Transformer model on this dataset to fine-tune the model for transliteration tasks.

<img width="930" height="555" alt="T5 Model Architecture" src="https://github.com/user-attachments/assets/9c5cdfd2-a8c7-4900-a0b4-0f0ae1bece24" />

### Results

We tested on the model on the validation data as well as real-world data in coalition with Government Of Karnataka, and these were our findings for various evaluation metrics.

- Accuracy: 85%
- Precision: 88%
- F1-Score: 86%

### Acknowledgements

We thank the Government of Karnataka for helping us in this project. We also thank our professors at Ramaiah Institute Of Technology in providing guidance.

### Contributors
- [Amogh Kalasapura](https://www.github.com/Amoghk04)
- [Abhay Bhandarkar](https://www.github.com/AbhayBhandarkar)
