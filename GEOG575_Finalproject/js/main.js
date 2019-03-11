var count = 0;
var count2 = 0;

var light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
		id: 'mapbox.streets',
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
	}),
	dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
		id: 'mapbox.dark',
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
	}),
	streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
		id: 'mapbox.streets',
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
	});
//function to instantiate the Leaflet map
function createMap() {
	//create the map
	var map = L.map('mapid', {
		center: [37.9510, -94.2333],
		zoom: 3,
		minZoom: 3,
		maxZoom: 8,
		layers: [light]
	});
	var baseLayers = {
		"Light": light,
		"Dark": dark,
		"Streets": streets
	};
	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHNteXRoMiIsImEiOiJjaXNmNGV0bGcwMG56MnludnhyN3Y5OHN4In0.xsZgj8hsNPzjb91F31-rYA', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiYnJ5YW5nYXJuZXIiLCJhIjoiY2pqNGxvOWw1MTlyOTN3cDZoanhnOG9tdyJ9.EEUHDCVqGagl9EnsZ9TJ8g'
	}).addTo(map);
	L.control.layers(baseLayers).addTo(map);
	//call getData function
	getData(map);
};



function getData(map) {
	//load the data
	$.ajax("data/Florida_NAS.json", {
		dataType: "json",
		success: function(response) {
		createPropSymbols(response, map);
		}
	});
};

function createPropSymbols(data, map){
    var attribute = "Group_";
    //create marker options
    var geojsonMarkerOptions = {
        radius: 1,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            var attValue = feature.properties[attribute];
            if(attValue == "Fishes"){
                count2 += 1;
            }
            //examine the attribute value to check that it is correct
            if(attValue == "Fishes"){
            count += 1;
            return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }
    }).addTo(map);
    console.log(count);
    console.log(count2);
};



$(document).ready(createMap);