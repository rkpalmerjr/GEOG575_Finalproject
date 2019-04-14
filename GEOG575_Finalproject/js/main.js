$(document).ready(function() {
	//define baselayer tilesets
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
		}),
        imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});;
    
	var categories = [];
    for (var i = 0; i < data.features.length; i++) { 
            var newItem = data.features[i].properties.Group_;
            if (categories.indexOf(newItem) === -1) {
                categories.push(newItem)
            }
        }
    categories.sort();
    
	//create the map
	var map = L.map('mapid', {
		center: [27.9510, -85.3444],
		zoom: 7,
		minZoom: 3,
		maxZoom: 18,
		layers: [light]
	});
	//create basylayers
	var baseLayers = {
		"Light": light,
		"Dark": dark,
		"Streets": streets,
        "Imagery": imagery
	};
	//add the base layers control to the map
	L.control.layers(baseLayers).addTo(map);
	//add geoJSON data
	var geoJsonLayer = L.geoJson(data, {
		pointToLayer: pointToLayer,
		onEachFeature: onEachFeature
	}).addTo(map);
	createLegend();
	createSearch(geoJsonLayer);
	createFilter();
    createSidebar();
    calcTopSpecies(categories);
	function pointToLayer(feature, latlng) {
		var geojsonMarkerOptions = {
			radius: 4,
			fillColor: "",
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8,
			tags: ['']
		};
		var attribute = "Group_";
		var attValue = feature.properties[attribute];
        for(var i = 0; i < categories.length; i++){
		if (attValue == categories[i]) {
			geojsonMarkerOptions.fillColor = getColor(attValue);
			geojsonMarkerOptions.tags = [categories[i]];
		}
        }
			return L.circleMarker(latlng, geojsonMarkerOptions);
	};

	function onEachFeature(feature, layer) {
		var popupContent = "<p><b>Common Name:</b> " + feature.properties.Common_Name + "</p>";
		popupContent += "<p><b>Group:</b> " + feature.properties.Group_ + "</p>";
		popupContent += "<p><b>Status:</b> " + feature.properties.Status + "</p>"
		popupContent += "<p><b>Specimen Number:</b> " + feature.properties.Specimen_Number + "</p>"
		if (feature.properties) {
			layer.bindPopup(popupContent, {
				closeButton: false,
				className: 'speciesPopup'
			});
		}
		layer.on({
			mouseover: function() {
				this.openPopup()
			},
			mouseout: function() {
				this.closePopup();
			}
		});
	}
	// create legend function
	function createLegend() {
		$("div.info.legend.leaflet-control").remove();
		// container
		var div = L.DomUtil.create('div', 'info legend');
		// make control
		var LegendControl = L.Control.extend({
			options: {
				position: 'bottomright'
			},
			onAdd: function() {
				var labels = ['<strong>Species by Group</strong>']
				for (var i = 0; i < categories.length; i++) {
					div.innerHTML += labels.push('<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' + (categories[i] ? categories[i] : '+'));
				}
				div.innerHTML = labels.join('<br>');
				return div;
			}
		});
		map.addControl(new LegendControl());
	}
	// create legend function
	function updateLegend(tags) {
		if (tags.length > 0) {
			$("div.info.legend.leaflet-control").remove();
			// container
			var div = L.DomUtil.create('div', 'info legend');
			// make control
			var LegendControl = L.Control.extend({
				options: {
					position: 'bottomright'
				},
				onAdd: function() {
					var labels = ['<strong>Species by Group</strong>'];
					for (var i = 0; i < tags.length; i++) {
						div.innerHTML += labels.push('<i class="circle" style="background:' + getColor(tags[i]) + '"></i> ' + (tags[i] ? tags[i] : '+'));
					}
					div.innerHTML = labels.join('<br>');
					return div;
				}
			});
			map.addControl(new LegendControl());
		} else {
			createLegend();
		}
	}

	function createSearch(featuresLayer) {
		var searchControl = new L.Control.Search({
			layer: featuresLayer,
			marker: {
				circle: {
					radius: 20,
					color: '#FF0000',
					opacity: .85,
					weight: 6,
					fillOpacity: 0
				},
				icon: false,
			},
			propertyName: 'Specimen_Number',
			zoom: 18,
			collapsed: true,
			textPlaceholder: 'Search Specimen Number',
			position: 'topleft',
			hideMarkerOnCollapse: true,
		});
		// open result marker popup
		searchControl.on('search:locationfound', function(e) {
			if (e.layer._popup) {
				let popup = e.layer.getPopup();
				e.layer.bindPopup(popup, {
					offset: [0, -11]
				});
				e.layer.openPopup();
			}
			// restore original style on popup close
		}).on('search:collapsed', function(e) {
			featuresLayer.eachLayer(function(layer) {
				featuresLayer.resetStyle(layer);
			});
		});
		map.addControl(searchControl);
	}

	function createFilter() {
		L.control.tagFilterButton({
			data: categories,
			icon: '<img src="lib/leaflet/images/filter.png">',
			filterOnEveryClick: true,
            clearText: "<strong><i>Clear Filter<i><strong>",
			onSelectionComplete: function(tags) {
				updateLegend(tags);
                calcTopSpecies(tags);
			}
		}).addTo(map);
	}
    
    function createSidebar(){
        var sidebar = L.control.sidebar('sidebar').addTo(map);
        sidebar.open('home');
        
    }

	function getColor(d) {
		switch (d) {
			case categories[0]:
				return '#ff7800';
			case categories[1]:
				return '#7CFC00';
			case categories[2]:
				return '#FF00D1';
            case categories[3]:
				return '#7f15f8';
            case categories[4]:
				return '#5f3a61';
            case categories[5]:
				return '#44c6fd';
            case categories[6]:
				return '#86c044';
            case categories[7]:
				return '#b4b391';
            case categories[8]:
				return '#43bab7';
            case categories[9]:
				return '#c19292';
            case categories[10]:
				return '#9d0715';
            case categories[11]:
				return '#fda65b';
            case categories[12]:
				return '#ec4374';
            case categories[13]:
				return '#68aa80';
            case categories[14]:
				return '#0c28b7';
            case categories[15]:
				return '#92b7d2';
            case categories[16]:
				return '#184544';
            case categories[17]:
				return '#eccd3b';
			default:
				return 'transparent';
		}
	};
    
    function calcTopSpecies(tags){
        if(tags.length > 0){
//            for (var i = 0; i < data.features.length; i++) { 
//        console.log(data.features[i].properties);
//        }
        //species #1 html element updates.    
        $("#spec1").text(data.features[Math.floor((Math.random() * 10) + 1)].properties.Common_Name).fadeOut(-1000)
        .fadeIn(1000);
        //species #2 html element updates.    
        $("#spec2").text(data.features[Math.floor((Math.random() * 10) + 1)].properties.Common_Name).fadeOut(-1000)
        .fadeIn(1000);
        //species #3 html element updates.    
        $("#spec3").text(data.features[Math.floor((Math.random() * 10) + 1)].properties.Common_Name).fadeOut(-1000)
        .fadeIn(1000);
        //species #4 html element updates.    
        $("#spec4").text(data.features[Math.floor((Math.random() * 10) + 1)].properties.Common_Name).fadeOut(-1000)
        .fadeIn(1000);
        //species #5 html element updates.    
        $("#spec5").text(data.features[Math.floor((Math.random() * 10) + 1)].properties.Common_Name).fadeOut(-1000)
        .fadeIn(1000);
        }else{
            calcTopSpecies(categories);
        }
         
    }
});