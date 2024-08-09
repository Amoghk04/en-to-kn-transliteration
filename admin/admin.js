const accept = document.querySelectorAll('.accept');
const reject = document.querySelectorAll('.reject');
const select = document.querySelector('select');
let suggestions = document.querySelectorAll('tbody tr');
const tableBody = document.querySelector('tbody');
const navigatorNext = document.querySelector('.next');
const navigatorPrev = document.querySelector('.prev');
const update = document.querySelector('.update');

let entriesPerPage = 10;
let currentPage = 1;

select.addEventListener('change', () => {
	entriesPerPage = parseInt(select.value.slice(0, 2));
	currentPage = 1;
	displaySuggestions();
	updateNavigators();
});

navigatorNext.addEventListener('click', () => {
	if (!navigatorNext.classList.contains('inactive')) {
		currentPage += 1;
		displaySuggestions();
		updateNavigators();
	}
});
navigatorPrev.addEventListener('click', () => {
	if (!navigatorPrev.classList.contains('inactive')) {
		currentPage -= 1;
		displaySuggestions();
		updateNavigators();
	}
})


for (let button of accept) {
	button.addEventListener('click', () => {
		button.parentElement.parentElement.classList.remove('discarded');
		button.parentElement.parentElement.classList.add('approved');
	})
}

for (let button of reject) {
	button.addEventListener('click', () => {
		button.parentElement.parentElement.classList.remove('approved');
		button.parentElement.parentElement.classList.add('discarded');
	})
}

const displaySuggestions = () => {
	for (let suggestion of suggestions) {
		suggestion.classList.add('hidden');
	}
	for (let i = (currentPage - 1) * entriesPerPage; i < currentPage * entriesPerPage && i < suggestions.length; ++i) {
		suggestions[i].classList.remove('hidden');
	}
}

const updateNavigators = () => {
	if (currentPage === 1) {
		navigatorPrev.classList.add('inactive');
	} else {
		navigatorPrev.classList.remove('inactive');
	}


	if (currentPage * entriesPerPage >= suggestions.length) {
		navigatorNext.classList.add('inactive');
	} else {
		navigatorNext.classList.remove('inactive');
	}
}

displaySuggestions();
updateNavigators();

const updateTable = () => {
	tableBody.innerHTML = "";
	for (let suggestion of suggestions) {
		tableBody.appendChild(suggestion);
	}
}

const getData = (element) => {
	const tds = element.querySelectorAll('td');
	const data = {
		english: tds[1].innerText,
		kannada: tds[2].innerText,
		status: element.classList.contains('approved')
	}
	return data;
}

const getRow = (index, entry) => {
	const tr = document.createElement('tr');
	tr.innerHTML = `<td>${index + 1}</td><td>${entry.english}</td><td>${entry.kannada}</td>`;

	const acceptBtn = document.createElement('button');
	acceptBtn.classList.add('button', 'accept');
	acceptBtn.addEventListener('click', () => {
		acceptBtn.parentElement.parentElement.classList.remove('discarded');
		acceptBtn.parentElement.parentElement.classList.add('approved');
	});
	acceptBtn.innerHTML = '<img src="accept.png" alt="Accept"></img>'

	const rejectBtn = document.createElement('button');
	rejectBtn.classList.add('button', 'reject');
	rejectBtn.addEventListener('click', () => {
		rejectBtn.parentElement.parentElement.classList.remove('approved');
		rejectBtn.parentElement.parentElement.classList.add('discarded');
	});
	rejectBtn.innerHTML = '<img src="reject.png" alt="Reject"></img>'

	const td1 = document.createElement('td');
	const td2 = document.createElement('td');
	td1.append(acceptBtn);
	td2.append(rejectBtn);
	tr.appendChild(td1);
	tr.appendChild(td2);
	return tr;
}

update.addEventListener('click', () => {
	const data = [];
	let newSuggestions = [];
	for (let suggestion of suggestions) {
		const entry = getData(suggestion);
		if (suggestion.classList.contains('approved') || suggestion.classList.contains('discarded')) {
			data.push(entry);
		}
		else {
			newSuggestions.push(getRow(newSuggestions.length, entry));
		}
	}
	suggestions = newSuggestions;
	updateTable();

	console.log(suggestions);
	console.log(data);

	data.toString();
	console.log(data);
	// Sending a POST request using Fetch API
	fetch('http://localhost:8080/data', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.text())
		.then(data => {
			console.log('Success:', data);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});


