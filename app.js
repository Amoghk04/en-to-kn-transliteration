//const express = require('express');
//const mongoose = require('mongoose');
//const path = require('path');
//const bodyParser = require('body-parser');


//console.log(__dirname);
//mongoose.connect("mongodb+srv://kalasapuraamogh:9RGdqQ3uRiKQCBoR@cluster0.wzmox0b.mongodb.net/transliteration?retryWrites=true&w=majority&appName=Cluster0")
//.then(() => console.log('Database connection successful!!'));

//const suggSchema = new mongoose.Schema({
//	englishWord: {
//		type: String,
//		required: [true, "Please enter English word"]
//	},
//	kannadaWord: {
//		type: String,
//		required: [true, "Please enter Kannada word"]
//	}
//}, { versionKey: false });

//const tempSuggestion = mongoose.model('tempsuggestions', suggSchema);


//const app1 = express();
//const port1 = 5000;
//app1.listen(port1, () => {
//	console.log(`Webpack running on http://localhost:${port1}`);
//})

//app1.set('view engine', 'ejs');

//app1.use('/', express.static(__dirname + '/public'));
//app1.get('/', (req, res) => {
//	res.sendFile(__dirname + '/public/index.html');
//})

//app1.set('/admin', __dirname + '/admin');
//app1.use('/admin', express.static(__dirname + '/admin'));
//app1.get('/admin', async (req, res) => {
//	const tempSuggestions = await tempSuggestion.find({});
//	res.render(__dirname + '/index.ejs', { tempSuggestions });
//})

//app1.post('/adminAuth', (req, res) => {
//	return res.redirect('../admin/index');
//})



///**********Receiving user approved data************/
//const app2 = express();
//const port2 = 5500;
//app2.use(bodyParser.urlencoded({ extended: false }));
//app2.listen(port2, () => {
//	console.log(`Server running on http://localhost:${port2}`);
//})

//// Middleware to parse JSON request bodies
//app2.use(express.json());
//const finalSuggestions = mongoose.model('suggestions', suggSchema);

//// Endpoint to handle the POST request
//app2.post('/data', async (req, res) => {
//	const data = req.body;
//	console.log(data);
//	for (let suggestion of data) {
//		console.log('deleting data');
//		tempSuggestion.deleteOne({ englishWord: suggestion.english, kannadaWord: suggestion.kannada })
//		.then(() => console.log('Deleted'))
//			.catch(() => console.log('Failed to delete'));

//		if (suggestion.status) {
//			const present = await finalSuggestions.findOne({ englishWord: suggestion.english, kannadaWord: suggestion.kannada });
//			if (present)
//				continue;
//			else {
//				const approvedSuggestion = new finalSuggestions({
//					englishWord: suggestion.english,
//					kannadaWord: suggestion.kannada
//				});
//				approvedSuggestion.save();
//			}
//		}
//	}
//	res.send('Data received');
//});

////app2.listen(port2, () => {
////	console.log(`Server is running on http://localhost:${port2}`);
////});

///************Not working****************/
//const port3 = 3500;
//const app3 = express();
//app3.listen(port3);
//app3.set()
//app1.post('/submit', (req, res) => {
//	console.log(req.body);
//	const newSuggestion = new tempSuggestion({
//		englishWord: req.body.englishSug,
//		kannadaWord: req.body.kannadaSug
//	});
//	newSuggestion.save();
//	res.redirect('http://localhost:3000');
//})

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const port = 3000;

console.log(__dirname);
mongoose.connect("mongodb+srv://kalasapuraamogh:9RGdqQ3uRiKQCBoR@cluster0.wzmox0b.mongodb.net/transliteration?retryWrites=true&w=majority&appName=Cluster0")
	.then(() => console.log('Database connection is successful!!'));

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

app.post('/submit', (req, res) => {
	console.log('request',req.body);
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
	console.log(`Webpack running on hii http://localhost:${port}`)
});

/**********Receiving user approved data************/
//const port2 = 5500;

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

//app.listen(port2, () => {
//	console.log(`Server is running on http://localhost:${port2}`);
//});