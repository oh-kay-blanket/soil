import './style.css';
import data from './soil.csv';

import { mapProp } from './mapProp.js';
import { render } from './mapFunctions.js';

const map = new google.maps.Map(document.getElementById("root"),mapProp);

render(data, map);
