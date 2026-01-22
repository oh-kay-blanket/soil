import icon from './img/plunkett-flag.png'
import iconActive from './img/plunkett-flag_active.png'

// IMAGES
function importAll(r) {
	let images = {}
	r.keys().map((item, index) => {
		images[item.replace('./', '')] = r(item).default || r(item)
	})
	return images
}

// Import images
const images = importAll(require.context('./img', false, /\.(jpg)$/))

// Setup coordinate
const newCoordinate = (newName, lngStart, coordinates) => {
	return new google.maps.LatLng(
		parseFloat(coordinates),
		parseFloat(coordinates.substr(lngStart))
	)
}

// Parse coordinates
const parseCoordinates = (newName, coordinates) => {
	// Determine LatLng placement
	// Positive numbers
	if (coordinates.substr(0, 2) > 0) {
		// Single digit
		if (isNaN(coordinates.substr(1, 1))) {
			return newCoordinate(newName, 9, coordinates)

			// Double digit
		} else {
			return newCoordinate(newName, 10, coordinates)
		}

		// Negative numbers
	} else {
		// Single digit
		if (isNaN(coordinates.substr(2, 2))) {
			return newCoordinate(newName, 10, coordinates)

			// Double digit
		} else {
			return newCoordinate(newName, 11, coordinates)
		}
	}
}

// Get photo
const photoCheck = (trip) => {
	console.log(images[`${trip.Id}.jpg`])
	return trip.Photo
		? '<image class="map-panel-photo" src="' + images[`${trip.Id}.jpg`] + '">'
		: ''
}

// Get photo album
const photoAlbumCheck = (trip) => {
	return trip.PhotoAlbum
		? `<div><p'><a style='display:flex;align-items:center;justify-content:flex-end;' href="${trip.PhotoAlbum}" target="_blank">View album &nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></p></div>`
		: ``
}

// Get people
const peopleCheck = (trip) => {
	return trip.People ? `<div><p><b>People: </b>${trip.People}</p></div>` : ''
}

// Get places
const placesCheck = (trip) => {
	return trip.Locations
		? `<div><p><b>Places</b>: ${trip.Locations}</p></div>`
		: ''
}

// Markers
let markers = []

// Make marker
const makeMarker = (trip, points) => {
	return new google.maps.Marker({
		position: points[0],
		icon: {
			url: icon,
			name: 'default',
		},
		color: '#786651',
		title: `${trip.City || 'Unknown City'}`,
		Id: `${trip.Id || 'unknown'}`,
		basicInfo: `
            <div class="map-window">
                <div>
                    <h1>${trip.Trip || 'Untitled Trip'} </h1>
                    <h3>${trip.City || 'Unknown City'}</h3>
                </div>
                <div>
                    <p class="dates">${trip.From || 'Unknown'} - ${
			trip.To || 'Unknown'
		}</p>
                </div>
                ${photoCheck(trip)}
                ${photoAlbumCheck(trip)}
                ${peopleCheck(trip)}
                ${placesCheck(trip)}
                <div>
                    <p>${trip.Description || 'No description available.'}</p>
                </div>
            </div>
        `,
		buildPath: points.slice(1),
	})
}

// Reset Markers
const resetMarkers = () => {
	let activeMarkers = markers.filter((marker) => {
		return marker.icon.name == 'active'
	})
	activeMarkers.forEach((marker) => {
		marker.setIcon({ url: icon, name: 'default' })
	})
}

// OVERLAY
const overlay = document.querySelector('.overlay')

// Build overlay
const makeOverlay = (marker) => {
	document.querySelector('.overlay__inner').innerHTML = marker.basicInfo
	overlay.classList.add('peek', 'top')
	overlay.scrollTo(0, 0)
	document.querySelector('.input-container').classList.add('hide')
}

// Hide overlay
const hideOverlay = () => {
	document
		.querySelector('.overlay')
		.classList.remove('open', 'peek', 'top', 'not-top')
	document.querySelector('.input-container').classList.remove('hide')
	resetMarkers()
}

// Set up hammer
var hammer = new Hammer(overlay)
hammer.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL })

// Track overlay drag state
let startHeight = 0
let isDragging = false

// Handle pan for fluid movement
hammer.on('panstart', function (e) {
	if (window.innerWidth >= 769) return
	// Only allow drag when scrolled to top
	if (overlay.scrollTop > 0) return

	isDragging = true
	startHeight = overlay.offsetHeight
	overlay.classList.add('dragging')
})

hammer.on('panmove', function (e) {
	if (window.innerWidth >= 769 || !isDragging) return

	// Calculate new height (subtract deltaY because dragging up = negative deltaY = bigger height)
	const newHeight = startHeight - e.deltaY
	const maxHeight = window.innerHeight * 0.99
	const minHeight = 0

	// Clamp height between min and max
	const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))
	overlay.style.height = clampedHeight + 'px'
})

hammer.on('panend', function (e) {
	if (window.innerWidth >= 769 || !isDragging) return

	isDragging = false
	overlay.classList.remove('dragging')
	overlay.style.height = '' // Clear inline style, let CSS classes take over

	const currentHeight = overlay.offsetHeight
	const viewportHeight = window.innerHeight
	const peekHeight = viewportHeight * 0.3
	const openHeight = viewportHeight * 0.99
	const threshold = (peekHeight + openHeight) / 2

	// Factor in velocity for snapping decision
	const velocityThreshold = 0.3

	if (e.velocityY > velocityThreshold) {
		// Fast swipe down - go to peek or close
		if (currentHeight < peekHeight * 0.7) {
			hideOverlay()
		} else {
			overlay.classList.add('peek')
			overlay.classList.remove('open')
		}
	} else if (e.velocityY < -velocityThreshold) {
		// Fast swipe up - go to open
		overlay.classList.add('open', 'top')
		overlay.classList.remove('peek')
	} else {
		// Slow drag - snap based on position
		if (currentHeight < peekHeight * 0.5) {
			hideOverlay()
		} else if (currentHeight < threshold) {
			overlay.classList.add('peek')
			overlay.classList.remove('open')
		} else {
			overlay.classList.add('open', 'top')
			overlay.classList.remove('peek')
		}
	}
})

// Listen for scroll
const scrollListen = () => {
	if (overlay.scrollTop == 0) {
		overlay.classList.add('top')
		overlay.classList.remove('not-top')
	} else {
		overlay.classList.remove('top')
		overlay.classList.add('not-top')
	}
}
overlay.addEventListener('scroll', scrollListen)

// Clear previous trip paths
const clearPath = (tripPath) => {
	if (tripPath != '') {
		tripPath.setMap(null)
	}
}

const drawPath = (marker) => {
	// Draw trip path
	if (marker.pathMarker1 != '') {
		return new google.maps.Polyline({
			path: marker.buildPath,
			strokeColor: '#bc2e2977',
			strokeOpacity: 0.8,
			strokeWeight: 3,
		})
	}
}

const setPath = (map, marker, tripPath) => {
	if (marker.pathMarker1 != '') {
		tripPath.setMap(map)
	}
}

// Render map
const render = (data, map) => {
	let tripPath = ''

	// Set up markers
	data.forEach((trip) => {
		// Safely get location data with fallbacks for missing properties
		const dataLocations = [
			trip.LatLng,
			trip.One,
			trip.Two,
			trip.Three,
			trip.Four,
			trip.Five,
			trip.Six,
			trip.Seven,
			trip.Eight,
			trip.Nine,
			trip.Ten,
			trip.Eleven,
			trip.Twelve,
			trip.Thirteen,
		]
		let points = []

		// Convert LatLng into Google Maps coordinates
		dataLocations.forEach((location, index) => {
			if (location) {
				points.push(parseCoordinates(index, location))
			}
		})

		// Only create marker if we have at least one valid point
		if (points.length > 0) {
			// Set markers
			const marker = makeMarker(trip, points)

			// If not using cluster
			marker.setMap(map)

			// Marker click functionality & build window
			google.maps.event.addListener(marker, 'click', function () {
				// Windows
				makeOverlay(marker, points)
				map.panTo(marker.position)
				resetMarkers()
				marker.setIcon({ url: iconActive, name: 'active' })

				// Paths
				clearPath(tripPath)
				tripPath = drawPath(marker)
				setPath(map, marker, tripPath)
			})
			markers.push(marker)
		}
	})

	const checkInput = () => {
		const inputField = document.querySelector('.input')

		const inputUpdate = () => {
			markers.forEach((marker) => {
				if (inputField.value == '') {
					marker.setMap(map)
				} else if (
					inputField.value != '' &&
					!marker.basicInfo
						.toLowerCase()
						.includes(inputField.value.toLowerCase().trim())
				) {
					marker.setMap(null)
				} else {
					marker.setMap(map)
				}
			})
		}

		inputField.addEventListener('input', inputUpdate)
		// inputField.focus();
	}

	checkInput()

	// Close overlay on map click
	google.maps.event.addListener(map, 'click', function () {
		hideOverlay()
		clearPath(tripPath)
		document.querySelector('.input').blur()
	})
}

export { render }
