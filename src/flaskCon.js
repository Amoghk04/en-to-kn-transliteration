const axios = require('axios');

const word = "bhavishya";

axios.post('http://localhost:5000/', {
    word: word
})
    .then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.error('Error: ', error);
    })