const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');


// https://stackoverflow.com/questions/67289563/how-do-i-get-readable-javascript-files-in-the-development-mode-of-webpack

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    watchOptions: {
        aggregateTimeout: 200,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        devMiddleware: {
            writeToDisk: true
        },
        port: 3000
    },
});

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();

const port = 8080;

console.log(__dirname);
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Database connection successful!!'));

const suggSchema = new mongoose.Schema({
    englishWord: {
        type: String,
        required: [true, "Please enter English word"]
    },
    kannadaWord: {
        type: String,
        required: [true, "Please enter Kannada word"]
    }
}, { versionKey: false });

const tempSuggestion = mongoose.model('tempsuggestions', suggSchema);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/', express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
})

app.set('/admin', __dirname + '/admin');
app.set('view engine', 'ejs');

app.use('/admin', express.static(__dirname + '/admin'));

app.get('/admin', async (req, res) => {
    const tempSuggestions = await tempSuggestion.find({});
    console.log(tempSuggestions);
    res.render(__dirname + '/index.ejs', { tempSuggestions });
})

app.use('/submit', express.json());
app.post('/submit', (req, res) => {
    console.log('body', req.body);
    const newSuggestion = new tempSuggestion({
        englishWord: req.body.englishSug,
        kannadaWord: req.body.kannadaSug
    });
    newSuggestion.save();
    res.redirect('/');
})

app.post('/adminAuth', (req, res) => {
    return res.redirect('../admin/index');
})

app.listen(port, () => {
    console.log(`Webpack running on http://localhost:${port}`)
});

/**********Receiving ADMIN approved data************/

// Middleware to parse JSON request bodies
app.use(express.json());
const finalSuggestions = mongoose.model('suggestions', suggSchema);

// Endpoint to handle the POST request
app.post('/data', async (req, res) => {
    const data = req.body;
    for (let suggestion of data) {
        tempSuggestion.deleteOne({ englishWord: suggestion.english, kannadaWord: suggestion.kannada })
            .then(() => console.log('Deleted'))
            .catch(() => console.log('Failed to delete'));

        if (suggestion.status) {
            const present = await finalSuggestions.findOne({ englishWord: suggestion.english, kannadaWord: suggestion.kannada });
            if (present)
                continue;
            else {
                const approvedSuggestion = new finalSuggestions({
                    englishWord: suggestion.english,
                    kannadaWord: suggestion.kannada
                });
                approvedSuggestion.save();
            }
        }
    }
    res.send('Data received');
});