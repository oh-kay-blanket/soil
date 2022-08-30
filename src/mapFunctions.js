import icon from './img/plunkett-flag.png';
import MarkerClusterer from './markerCluster';

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

// Import images
const images = importAll(require.context('./img', false, /\.(png|jpe?g|svg)$/));

// Setup coordinate
const newCoordinate = (newName,lngStart,coordinates) => {
  return new google.maps.LatLng(parseFloat(coordinates),parseFloat(coordinates.substr(lngStart)));
}

// Parse coordinates
const parseCoordinates = (newName,coordinates) => {

  // Determine LatLng placement
  // Positive numbers
  if((coordinates.substr(0,2)) > 0) {

    // Single digit
   if(isNaN(coordinates.substr(1,1))) {
    return newCoordinate(newName,9, coordinates);

    // Double digit
    } else {
     return newCoordinate(newName,10, coordinates);
    }

  // Negative numbers
  } else {

    // Single digit
    if(isNaN(coordinates.substr(2,2))) {
      return newCoordinate(newName,10, coordinates);

    // Double digit
    } else {
      return newCoordinate(newName,11, coordinates);
    }
  };
}

// Get photo
const photoCheck = trip => {
  return trip.Photo ? '<image class="map-panel-photo" src="' + images[`${trip.Id}.jpg`] + '">' : '';
}

// Get photo album
const photoAlbumCheck = trip => {
  return trip.PhotoAlbum ? `<div><p><a href="${trip.PhotoAlbum}" target="_blank">More photos</a></p></div>` : ``;
}

// Get people
const peopleCheck = trip => {
  return trip.People ? `<div><p><b>People: </b>${trip.People}</p></div>` : '';
}

// Get places
const placesCheck = trip => {
  return trip.Locations ? `<div><p><b>Places</b>: ${trip.Locations}</p></div>` : '';
}

// Prep marker
const makeMarker = (trip, points) => {
  return new google.maps.Marker({
    position: points[0],
		icon: {
      url: icon
    },
		color: '#786651',
    title:`${trip.City}`,
    Id: `${trip.Id}`,
    basicInfo:`
      <div class="map-window">
        <div>
          <h1>${trip.Trip} </h1>
          <h2>${trip.City}</h2>
        </div>
        ${photoCheck(trip)}
        ${photoAlbumCheck(trip)}
        <div>
          <p class="dates">${trip.From} - ${trip.To}</p>
        </div>
        ${peopleCheck(trip)}
        ${placesCheck(trip)}
        <div>
          <p>${trip.Description}</p>
        </div>
      </div>
    `,
    buildPath:points.slice(1)
  });
}

// Overlay
const overlay = document.querySelector('.overlay');
const overlayInner = document.querySelector('.overlay__inner');

// Build overlay
const makeOverlay = (marker) => {
  overlayInner.innerHTML = marker.basicInfo;
  overlay.classList.add('peek');
  overlay.scrollTo(0, 0);
  const overlayClose = document.querySelector('.overlay-close');
  console.log(overlayClose);
  overlayClose.addEventListener("click", function(e) {
    hideOverlay();
    e.stopPropagation();
  });

  // Peeking
  const overlayPeeking = document.querySelector('.overlay.peek');
  var hammerPeeking = new Hammer(overlayPeeking);
  // overlayPeeking.addEventListener("click", function(){overlay.classList.add('open')});

  hammerPeeking.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
  hammerPeeking.on('swipe', function(e) {
    if (e.offsetDirection == 8) {
      overlay.classList.add('open');
      overlay.classList.remove('peek');
      
      // Hammer Open
      const overlayOpen = document.querySelector('.overlay.open');
      var hammerOpen = new Hammer(overlayOpen);
    
      hammerOpen.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
      hammerOpen.on('swipe', function(e) {
        if (e.offsetDirection == 16) {
          overlay.classList.remove('open', 'peek');
        } 
      });
    } 
  });

}

const hideOverlay = () => {
  document.querySelector('.overlay').classList.remove('open','peek');
  console.log('hiding overlay');
}

// Clear previous trip paths
const clearPath = tripPath => {
  if(tripPath != "") {
    tripPath.setMap(null);
  }
}

const drawPath = (marker) => {
  // Draw trip path
  if(marker.pathMarker1 != "") {
    return new google.maps.Polyline({
      path: marker.buildPath,
      strokeColor: "#bc2e2977",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });
  }
}

const setPath = (map, marker, tripPath) => {
  if(marker.pathMarker1 != "") {
    tripPath.setMap(map);
  }
}

const makeCluster = (map, markers) => {
  const mcOptions = {
    gridSize: 30,
    maxZoom: 8,
    zoomOnClick: true,
    imagePath: 'https://raw.githubusercontent.com/mister-blanket/marker-cluster/master/m'};
  return new MarkerClusterer(map, markers, mcOptions);
}

// Render map
const render = (data, map) => {
  let tripPath = "";
  let markers = [];

  // Set up markers
  data.forEach(trip => {
    const dataLocations = [trip.LatLng, trip.One, trip.Two, trip.Three, trip.Four, trip.Five, trip.Six, trip.Seven, trip.Eight, trip.Nine, trip.Ten, trip.Eleven, trip.Twelve, trip.Thirteen];
    let points = [];

    // Convert LatLng into Google Maps coordinates
    dataLocations.forEach((location, index) => {
      location && points.push(parseCoordinates(index,location));
    });

    // Set markers
    const marker = makeMarker(trip, points);
    // marker.setMap(map);

    // Marker click functionality & build window
    google.maps.event.addListener(marker, 'click', function() {

      // Windows
      makeOverlay(marker, points);
      console.log(marker.position);
      map.setCenter(marker.position); 

      // Paths
      clearPath(tripPath);
      tripPath = drawPath(marker);
      setPath(map, marker, tripPath);

    });
    markers.push(marker);
  });

  // Make clusters
  makeCluster(map, markers);

  // Close overlay on map click
  google.maps.event.addListener(map, 'click', function() {
    hideOverlay();
    clearPath(tripPath);
  });
}

export { render, hideOverlay };