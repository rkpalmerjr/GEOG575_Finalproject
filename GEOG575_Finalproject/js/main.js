/* Bryan Garner, Sarah Grandstrand, Kevin Palmer, 2019
 UW-Madison, GEOG-576, Spring 2019 */

//Define basemap tilesets
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
    });

//Create the map
var map = L.map('mapid', {
    center: [27.9510, -85.3444],
    zoom: 7,
    minZoom: 3,
    maxZoom: 18,
    layers: [light]
});

//Create basemap tileset layers
var baseMaps = {
    "Light": light,
    "Dark": dark,
    "Streets": streets,
    "Imagery": imagery
};

//Add basemap control to the map
var baseMapControl = L.control.layers(baseMaps);
baseMapControl.id = "baseMapControl";
baseMapControl.addTo(map);
$('<p class = "controlHeader">Basemap Tilesets</p>').insertBefore('div.leaflet-control-layers-base');


//Initiate document function
$(document).ready(function () {
    //Define Florida NAS data categories arrays
    var categories = [];
    for (var i = 0; i < data.features.length; i++) {
        var species = data.features[i].properties.Group_;
        if (categories.indexOf(species) === -1) {
            categories.push(species)
        }
    }
    categories.sort();
    var comNameArr = [];
    for (var i = 0; i < data.features.length; i++) {
        var name = data.features[i].properties.Common_Name;
        if (comNameArr.indexOf(name) === -1) {
            comNameArr.push(name)
        }
    }

    //Add polygon baselayer geoJSON data
    var statefl = L.geoJson(flstate, {
        "color": "#ff7800",
        "weight": 4,
        "opacity": 0.65
    });
    var countiesfl = L.geoJson(flcounties, {
        "color": "#ff7800",
        "weight": 4,
        "opacity": 0.65
    });
    var u2 = L.geoJson(watershed_u2);
    var u4 = L.geoJson(watershed_u4);
    var u6 = L.geoJson(watershed_u6);
    var u8 = L.geoJson(watershed_u8);

    //Add point geoJSON data
    var NASdata = L.geoJson(data, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }).addTo(map);

    //Add web app features
    createLegend();
    createSearch(NASdata);
    createFilter();
    createSidebar();
    //Run function to calculate top species in Florida NAS data
    calcTopSpecies(categories);
    /*    createSlider();*/
    barChart(categories);

    //Create polygon baselayers
    var baseLayers = {
        "State (Florida)": statefl,
        "Counties (Florida)": countiesfl,
        "Hydrologic Unit - HU8": u8,
        "Hydrologic Unit - HU6": u6,
        "Hydrologic Unit - HU4": u4,
        "Hydrologic Unit - HU2": u2
    };

    //Add baselayers control to the map
    var overlayControl = L.control.layers('', baseLayers);
    overlayControl.id = "overlayControl";
    overlayControl.addTo(map);
    $('<p class = "controlHeader">Overlay Layers</p>').insertBefore('div.leaflet-control-layers-base');

    //Draw layers behind points
    //KP NOTE:  I think I can re-write this section if I have time to create a set layer order.  I did this on Lab 1.
    map.on("overlayadd", function (event) {
        u8.bringToBack();
        u6.bringToBack();
        u4.bringToBack();
        u2.bringToBack();
        statefl.bringToBack();
        countiesfl.bringToBack();
    });


    //FUNCTIONS...
    //Convert Florida NAS geoJSON to leaflet point markers
    function pointToLayer(feature, latlng) {
        var geojsonMarkerOptions = {
            radius: 3,
            fillColor: "",
            color: "#000",
            stroke: 1,
            weight: 1,
            opacity: 0.5,
            fillOpacity: 0.75,
            tags: ['']
        };
        var attribute = "Group_";
        var attValue = feature.properties[attribute];
        for (var i = 0; i < categories.length; i++) {
            if (attValue == categories[i]) {
                geojsonMarkerOptions.fillColor = getColor(attValue);
                geojsonMarkerOptions.tags = [categories[i]];
            }
        }
        return L.circleMarker(latlng, geojsonMarkerOptions);
    };

    //Create popups on each feature function
    function onEachFeature(feature, layer) {
        var popupContent = "<p><b>Common Name:</b> " + feature.properties.Common_Name + "</p>"
        popupContent += "<p><b>Group:</b> " + feature.properties.Group_ + "</p>"
        popupContent += "<p><b>Status:</b> " + feature.properties.Status + "</p>"
        popupContent += "<p><b>Year Spotted:</b> " + feature.properties.Year + "</p>"
        popupContent += "<p><b>Specimen Number:</b> " + feature.properties.Specimen_Number + "</p>"
        if (feature.properties) {
            layer.bindPopup(popupContent, {
                closeButton: false,
                className: 'speciesPopup'
            });
        }
        layer.on({
            mouseover: function () {
                this.openPopup()
            },
            mouseout: function () {
                this.closePopup();
            }
        });
    }

    //Create legend function
    function createLegend() {
        $("div.info.legend.leaflet-control").remove();
        //Container
        var div = L.DomUtil.create('div', 'info legend');
        //Make control
        var LegendControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },
            onAdd: function () {
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

    //Update legend function
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
                onAdd: function () {
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

    //Create search bar function
    function createSearch(featuresLayer) {
        var searchControl = new L.Control.Search({
            layer: featuresLayer,
            marker: {
                circle: {
                    radius: 16,
                    color: '#FF0000',
                    opacity: .25,
                    weight: 1,
                    fillOpacity: .25
                },
                icon: false,
            },
            propertyName: 'Specimen_Number',
            zoom: 12,
            collapsed: true,
            textPlaceholder: 'Search Specimen Number',
            position: 'topleft',
            hideMarkerOnCollapse: true,
        });
        //Open result marker popup
        searchControl.on('search:locationfound', function (e) {
            if (e.layer._popup) {
                let popup = e.layer.getPopup();
                e.layer.bindPopup(popup, {
                    offset: [0, -11]
                });
                e.layer.openPopup();
            }
            //Restore original style on popup close
        }).on('search:collapsed', function (e) {
            featuresLayer.eachLayer(function (layer) {
                featuresLayer.resetStyle(layer);
            });
        });
        map.addControl(searchControl);
    }

    //Create point filter by category function
    function createFilter() {
        L.control.tagFilterButton({
            data: categories,
            icon: '<img src="lib/leaflet/images/filter.png">',
            filterOnEveryClick: true,
            clearText: "<strong><i>Clear Filter<i><strong>",
            onSelectionComplete: function (tags) {
                updateLegend(tags);
                //CalcTopSpecies(tags);
            }
        }).addTo(map);
    }

    //Create point filter by time range slider
    function createSlider() {
        //Create a marker layer
        console.log(NASdata);
        var sliderControl = L.control.sliderControl({
            position: "bottomleft",
            layer: NASdata,
            range: true
        });
        //Add the slider to the map
        map.addControl(sliderControl);
        //Initialize the slider
        sliderControl.startSlider();
    }

    //Create sidebar function
    function createSidebar() {
        var sidebar = L.control.sidebar('sidebar').addTo(map);
        sidebar.open('home');
    }

    //Create point symbol colors function
    function getColor(d) {
        switch (d) {
            case categories[0]:
                return '#ff7800';
            case categories[1]:
                return '#fda65b';
            case categories[2]:
                return '#ff00d1';
            case categories[3]:
                return '#0c28b7';
            case categories[4]:
                return '#44c6fd';
            case categories[5]:
                return '#034e7b';
            case categories[6]:
                return '#92b7d2';
            case categories[7]:
                return '#43bab7';
            case categories[8]:
                return '#68aa80';
            case categories[9]:
                return '#184544';
            case categories[10]:
                return '#9d0715';
            case categories[11]:
                return '#eccd3b';
            case categories[12]:
                return '#7f15f8';
            case categories[13]:
                return '#5f3a61';
            case categories[14]:
                return '#7cfc00';
            case categories[15]:
                return '#86c044';
            case categories[16]:
                return '#c7e9b4';
            default:
                return 'transparent';
        }
    };

    //Get species count per common name function
    function getSpeciesCount() {
        var arrayCount = [];
        for (var i = 0; i < data.features.length; i++) {
            for (var j = 0; j < comNameArr.length; j++) {
                if (data.features[i].properties.Common_Name == comNameArr[j]) {
                    arrayCount.push(comNameArr[j]);
                }
            }
        }
        var dict = {};
        for (var i = 0; i < comNameArr.length; i++) {
            var getNumCount = arrayCount.reduce(function (n, val) {
                return n + (val === comNameArr[i]);
            }, 0);
            dict[comNameArr[i]] = getNumCount;
        }
        for (var key in dict) {
            var value = dict[key];
        }
        var props = Object.keys(dict).map(function (key) {
            return {
                key: key,
                value: this[key]
            };
        }, dict);
        props.sort(function (p1, p2) {
            return p2.value - p1.value;
        });
        var topFive = props.slice(0, 5);
        return topFive;
    }

    //Calculate the top (most prevalent) invasive species function from species count
    function calcTopSpecies() {
        //Species #1 html element updates.
        $("#spec1").text(getSpeciesCount()[0].key);
        //Species #2 html element updates.
        $("#spec2").text(getSpeciesCount()[1].key);
        //Species #3 html element updates.
        $("#spec3").text(getSpeciesCount()[2].key);
        //Species #4 html element updates.
        $("#spec4").text(getSpeciesCount()[3].key);
        //Species #5 html element updates.
        $("#spec5").text(getSpeciesCount()[4].key);
    }

    function barChart() {
        var data = getSpeciesCount();
        console.log(data);
        //sort bars based on value
        data = data.sort(function (a, b) {
            return d3.ascending(a.value, b.value);
        })
        //set up svg using margin conventions
        var margin = {
            top: 5,
            right: 35,
            bottom: 5,
            left: 105
        };

        var width = 405 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var svg = d3.select("#barchart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.linear()
            .range([0, width])
            .domain([0, d3.max(data, function (d) {
                return d.value;
            })]);

        var y = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .1)
            .domain(data.map(function (d) {
                return d.key;
            }));
        //make y axis to show bar names
        var yAxis = d3.svg.axis()
            .scale(y)
            //no tick marks
            .tickSize(0)
            .orient("left");

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)

        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")


        // filters go in defs element
        var defs = svg.append("defs");

        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        var filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");

        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 3 and store result
        // in blur
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 5)
            .attr("result", "blur");

        // translate output of Gaussian blur to the right and downwards with 2px
        // store result in offsetBlur
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 5)
            .attr("dy", 5)
            .attr("result", "offsetBlur");

        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");


        //append rects
        bars.append("rect")
            .attr("class", "bar")
            .attr("y", function (d) {
                return y(d.key);
            })
            .attr("height", y.rangeBand())
            .attr("x", 0)
            .attr("width", function (d) {
                return x(d.value);

            })
            .style("filter", "url(#drop-shadow)");

        //add a value label to the right of each bar
        bars.append("text")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return y(d.key) + y.rangeBand() / 2 + 4;
            })
            //x position is 4 pixels to the from the end of the bar
            .attr("x", function (d) {
                return x(d.value) - 4;
            })
            .attr("text-anchor", "end")
            .text(function (d) {
                return d.value;
            });


    }

});
