// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {


	// TODO - Get player_id and track_id from the store
	
	const race =await createRace(store.player_id, store.track_id);
	// render starting UI
	renderAt('#race', renderRaceStartView(race.Track.name))
	// TODO - update the store with the race id
	// For the API to work properly, the race id should be race id - 1
	store = { ...store ,
	 race_id : race.ID -1
	}
	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown()
	// TODO - call the async function startRace
	await startRace(store.race_id)
	// TODO - call the async function runRace
	await  runRace(store.race_id)
}

function runRace(raceID) {
	return new Promise(resolve => {
	// TODO - use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(async () => {
		
		const res = await getRace(raceID).catch((error) =>
			console.log("Error occurred 😔", error) 
		);
	/* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:
		renderAt('#leaderBoard', raceProgress(res.positions))
	*/
	/*
		TODO - if the race info status property is "finished", run the following:
		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		resolve(res) // resolve the promise
	*/

		if(res.status == 'in-progress') {
			renderAt('#leaderBoard', raceProgress(res.positions))
		} else if(res.status == 'finished') {
			clearInterval(raceInterval) 
			renderAt('#race', resultsView(res.positions)) 
			resolve(res);
		}
		
	},500)

	},reject=>		console.log("Error occurred in runRace 😔")
	)
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			const interval = setInterval(() => {
							// TODO - use Javascript's built in setInterval method to count down once per second

				if (timer !== 0) {
			// run this DOM manipulation to decrement the countdown for the user
			document.getElementById('big-numbers').innerHTML = --timer

				} else {
				// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				clearInterval(interval);
				resolve();
				}
			}, 1000);			
	})
	} catch(error) {
		console.log("Error occurred in runCountdown 😔");
	}
}

function handleSelectPodRacer(target) {
	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store = { ...store ,
	 player_id : target.id 
	}
}

function handleSelectTrack(target) {

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')
	// TODO - save the selected track id to the store
	store = { ...store ,
	 track_id: target.id 
	}
}

 function handleAccelerate() {

	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id)
	.then(()=> console.log("accelerate button clicked"))
	.catch((error)=>console.log(error))

}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(name) {
	return `
		<header>
			<h1>Race: ${name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name} ${p.id ==store.player_id ?'(You)':''}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:3001'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	try {
		const data = await fetch (`${SERVER}/api/tracks`, {
			method: "GET",
			dataType: "json",
			...defaultFetchOpts()
		});
		return data.json();
	}catch (error) {
		console.log("Error occurred in getTracks 😔");
	}

}

async function  getRacers() {
	// GET request to `${SERVER}/api/cars`
	try {
		const data = await fetch (`${SERVER}/api/cars`, {
			method: "GET",
			dataType: "json",
			...defaultFetchOpts()
		});
		return data.json();
	
}
	catch (error) {
		console.log("Error occurred in getRacers 😔");
	}
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'json',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => 		console.log("Error occurred in createRace 😔")
	)
}

async function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	try {
		const data = await fetch(`${SERVER}/api/races/${parseInt(id)}`, {
			method: "GET",
			dataType: "json",
			...defaultFetchOpts()
		});
	
		return data.json();
	} catch (error) {
		console.log("Error occurred in getRacers 😔");
	}
}

async function startRace(id) {
	try {
		const data = await fetch(`${SERVER}/api/races/${parseInt(id)}/start`, {
			method: `POST`,
			dataType: 'json',
			...defaultFetchOpts(),
		});
		return data;
	} catch (error){
		console.log("Error occurred in startRace 😔");
	}
}
async function accelerate(id) {

	try {
		const data = await fetch (`${SERVER}/api/races/${ parseInt(id)}/accelerate`, {
			method: 'POST',
			...defaultFetchOpts(),
		});

		return data 
	} catch (error) {
		console.log("Error occurred in accelerate 😔",error);
	}
		// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
}