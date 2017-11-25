var currentZoom = 8; //8; //12;
var map;
const mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>';
// const mbUrl = `https://api.mapbox.com/styles/v1/sonychan0807/cja9chgrg1e1z2ro2n7p1api4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic29ueWNoYW4wODA3IiwiYSI6ImNqNGk4ZGEwaDAyOGszM3F3Nzc1bWIxNjcifQ.hUbe7j_iHsjcEhPNLTvxDA`;
const mbUrl = "https://api.mapbox.com/styles/v1/sonychan0807/cjaclg94x4f3z2rsemlyvyifx/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic29ueWNoYW4wODA3IiwiYSI6ImNqNGk4ZGEwaDAyOGszM3F3Nzc1bWIxNjcifQ.hUbe7j_iHsjcEhPNLTvxDA";

const grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });


function init() {
    if(map != undefined) {map.remove();}
    
    map = L.map('pathmap', {
        layers: [grayscale]
    }).setView([46.80111, 8.22667], currentZoom);


    var startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    // start of TimeDimension manual instantiation
    var timeDimension = new L.TimeDimension({
        period: "PT5M",
    });
    // helper to share the timeDimension object between all layers
    map.timeDimension = timeDimension;
    // otherwise you have to set the 'timeDimension' option on all layers.

    var player = new L.TimeDimension.Player({
        transitionTime: 1000,
        loop: false,
        startOver: true
    }, timeDimension);

    var timeDimensionControlOptions = {
        player: player,
        timeDimension: timeDimension,
        position: 'bottomleft',
        autoPlay: true,
        minSpeed: 1,
        speedStep: 0.5,
        maxSpeed: 15,
        timeSliderDragUpdate: true
    };

    var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
    map.addControl(timeDimensionControl);

    var icon = L.icon({
        iconUrl: 'img/running.png',
        iconSize: [22, 22],
        iconAnchor: [5, 25]
    });

    var customLayer = L.geoJson(null, {
        pointToLayer: function (feature, latLng) {
            if (feature.properties.hasOwnProperty('last')) {
                return new L.Marker(latLng, {
                    icon: icon
                });
            }
            return L.circleMarker(latLng);
        }
    });

    var customLayer2 = L.geoJson(null, {
        pointToLayer: function (feature, latLng) {
            if (feature.properties.hasOwnProperty('last')) {
                return new L.Marker(latLng, {
                    icon: icon
                });
            }
            return L.circleMarker(latLng);
        }
    });

    var gpxLayer = omnivore.gpx('data/Running_02.gpx', null, customLayer).on('ready', function () {
        map.fitBounds(gpxLayer.getBounds(), {
            paddingBottomRight: [40, 40]
        });
    });
    var gpxLayer2 = omnivore.gpx('data/VeveyMarathon.gpx', null, customLayer).on('ready', function () {
        map.fitBounds(gpxLayer.getBounds(), {
            paddingBottomRight: [40, 40]
        });
    });

    var gpxTimeLayer = L.timeDimension.layer.geoJson(gpxLayer, {
        updateTimeDimension: true,
        addlastPoint: true,
        waitForReady: true
    });

    var gpxTimeLayer2 = L.timeDimension.layer.geoJson(gpxLayer2, {
        updateTimeDimension: true,
        addlastPoint: true,
        waitForReady: true
    });



    var overlayMaps = {
        "GPX Layer": gpxTimeLayer,
    };
    L.control.layers(overlayMaps).addTo(map);
    gpxTimeLayer.addTo(map);

}


window.addEventListener('load', init);