// import './style.css';
import './sass/style.scss';
import data from './soil.json';

import { mapProp } from './mapProp.js';
import { render } from './mapFunctions.js';

const map = new google.maps.Map(document.getElementById("root"),mapProp);

render(data, map);