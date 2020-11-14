import icon from './img/plunkett-flag.png';
import MarkerClusterer from './markerCluster';

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const images = importAll(require.context('./img', false, /\.(png|jpe?g|svg)$/));


const newCoordinate = (newName,lngStart,coordinates) => {
  return new google.maps.LatLng(parseFloat(coordinates),parseFloat(coordinates.substr(lngStart)));
}

// Parse coordinates function
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

const windowOffset = windowPlacement => {
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    // switch(windowPlacement) {
    //   case 'r':
    //     return new google.maps.Size(0,0);
    //   case 'l':
    //     return  new google.maps.Size(0,0);
    //   case 't':
    //     return  new google.maps.Size(0,20);
    //   case 'b':
    //     return  new google.maps.Size(0,650);
    // }
  } else {
    switch(windowPlacement) {
      case 'r':
        return new google.maps.Size(300,330);
      case 'l':
        return  new google.maps.Size(-300,330);
      case 't':
        return  new google.maps.Size(0,20);
      case 'b':
        return  new google.maps.Size(0,650);
    }
  }
}

const photoCheck = trip => {
  if(trip.Photo !== null) {
    return '<image class="map-panel-photo" src="' + images[`${trip.Id}.jpg`] + '"><br><br>';
  } else {
    return '';
  };
}

const photoAlbumCheck = trip => {
  if (trip.PhotoAlbum !== null) {
    return `<div><p><a href="${trip.PhotoAlbum}" target="_blank">More photos</a></p><br><br>`
  } else {
    return `<div>`
  }
}

const makeMarker = (trip, points) => {
  return new google.maps.Marker({
    position: points[0],
		icon: icon,
		color: '#786651',
		offset: windowOffset(trip.WindowPlacement),
    title:`${trip.City}`,
    Id: `${trip.Id}`,
    basicInfo:`
      <div class="map-window">
        <div><h1>${trip.Trip} </h1><h2>${trip.City}</h2></div>
        ${photoCheck(trip)}
        <div>
          <p><b>${trip.From} - ${trip.To}</b></p>
        </div>`,

    locations:`<div><p><b>Places visited</b>: ${trip.Locations}</p></div>`,
    photos:trip.PhotoAlbum,
    morePhotos: photoAlbumCheck(trip),
    people:trip.People,
    peopleInsert:`<div><p><b>People seen: </b>${trip.People}</p></div>`,
    description:`<div><p>${trip.Description}</p></div></div>`,
    buildPath:points.slice(1)
  });
}

const infoWindowContent = marker => {
  if (marker.photos != "") {
    if (marker.people !== null) {
      return marker.basicInfo + marker.peopleInsert + marker.morePhotos + marker.locations + marker.description;
    } else {
      return marker.basicInfo + marker.morePhotos + marker.locations + marker.description;
    }

  // Without people visited
  } else {
    if (marker.people !== null) {
      return marker.basicInfo + marker.peopleInsert + marker.locations + marker.description;
    } else {
      return marker.basicInfo + marker.locations + marker.description;
    }
  };
}

const makeInfoWindow = (marker, points) => {
  return new google.maps.InfoWindow({
    content: infoWindowContent(marker),
    position: points[0],
    maxWidth: 560,
    pixelOffset: marker.offset,
    Id: marker.Id,
  });
}

const clearOldWindows = activeWindow => {
  if (activeWindow) {
    return activeWindow.close();
  }
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
      strokeColor: "#786651",
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


const render = (data, map) => {
  let activeWindow = false;
  let tripPath = "";
  let markers = [];

  // Place each trip
  data.forEach(trip => {
    const dataLocations = [trip.LatLng, trip.One, trip.Two, trip.Three, trip.Four, trip.Five, trip.Six, trip.Seven, trip.Eight, trip.Nine, trip.Ten, trip.Eleven, trip.Twelve, trip.Thirteen];
    let points = [];

    const convertLocation = (location, index) => {
      if (location !== null) {
        points.push(parseCoordinates(index,location));
      }
    }

    // Convert LatLng into Google Maps coordinates
    dataLocations.forEach(convertLocation);

    // Set markers
    const marker = makeMarker(trip, points);
    // marker.setMap(map);

    // Marker click functionality & build window
    google.maps.event.addListener(marker, 'click', function() {

      // Windows
      clearOldWindows(activeWindow);
      const infowindow = makeInfoWindow(marker, points);
      infowindow.open(map, marker);
      activeWindow = infowindow;

      // Paths
      clearPath(tripPath);
      tripPath = drawPath(marker);
      setPath(map, marker, tripPath);

      // Close all windows upon map click
      google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
        clearPath(tripPath);
      });
    });
    markers.push(marker);
  })
  makeCluster(map, markers);
}

export { render };
