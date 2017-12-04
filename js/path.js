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

const gpxPath = 'data/mapstogpx20171127_110151.gpx';


function init() {
    document.getElementById("addGroup").addEventListener('click', addGroup);
    document.getElementById("addPerson").addEventListener('click', addPerson);
    let gpx = genGPXFile(gpxPath,"1:20.20,0", "2017");
    
    gpx.then((data) => {drawMap(data)}


  )
}

function addGroup(){
    let year = $("#year option:selected").text();
    let dist = $("#dist option:selected").text();
    let gender = $("#g_gender option:selected").text();
    let aGroup = $("#age_group option:selected").text();
    let aSpeed = $("#age_speed option:selected").text();

    addInfo("group", year, dist, gender);
}
function addPerson(){
    let year = $("#year option:selected").text();
    let dist = $("#dist option:selected").text();
    let gender = $("#per_gender option:selected").text();
    let name = $('#name').val().trim();
    
    if (name == "") {
        alert("Please Input a name");
        return;
    }

    addInfo("person",year, dist, gender, name);
}


function addInfo(type, year, dist, gender, name = "", aGroup = "", aSpeed = "") {
    if (type == "group"){
        let tagId = `info_${year}_${dist}_${gender}_${aGroup}_${aSpeed}`
        let htmlStr = `<li class="list-group-item" id="${tagId}">${year}${dist}${gender}
        <button type="button" class="btn btn-danger btn-sm" id="test" onclick="deleteList('${tagId}')">Delete</button></li>`
        $("#runner_list").append(htmlStr);
    }else {
        let tagId = `info_${year}_${dist}_${gender}_${name}`
        let htmlStr = `<li class="list-group-item" id="${tagId}">${year}${dist}${gender}
        <button type="button" class="btn btn-danger btn-sm" id="test" onclick="deleteList('${tagId}')">Delete</button></li>`
        $("#runner_list").append(htmlStr);
    }

}
function deleteList(id) {
    $(`#${id}`).remove();
}

function drawMap(data){
    if(map != undefined) {map.remove();}
    
    map = L.map('pathmap', {
        layers: [grayscale]
    }).setView([46.80111, 8.22667], currentZoom);


    var startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    // start of TimeDimension manual instantiation
    var timeDimension = new L.TimeDimension({
        period: "PT10S",
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

    var gpxLayer = omnivore.gpx.parse(data).on('ready', function () {
        map.fitBounds(gpxLayer.getBounds(), {
            paddingBottomRight: [40, 40]
        });
    });

    var gpxTimeLayer = L.timeDimension.layer.geoJson(gpxLayer, {
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

function genGPXFile(filePath,record, startTime) {
    // let newGpx;
    let secs = getSecs(record);
    console.log(secs);
    let newGPX = new Promise( (resolve, reject) =>{
        $.ajax({
            url: filePath,
            success: function (data) {
                let trks = $(data).find("trkpt");
                let timeGap = secs / trks.length;
                console.log(timeGap);
                let multiplyer = 0;
                let isoTime = moment(`${startTime}-01-01 8:00:00`);
                console.log(isoTime);
                console.log(data);
                trks.each(function() {
                    let trk = $(this);
                    let timeContext = isoTime.add(timeGap, 'seconds').toISOString();
                    // console.log(timeContext);
                    trk.append(`<time>${timeContext}</time>`)
                    multiplyer += 1;
                });
                resolve(data);
                console.log(data);
            }
        });
    });
    return newGPX;
}

// "1:56.27,0"
function getSecs(record) {
    let timeStr = record.split(",")[0];
    let hour = parseInt(timeStr.split(':')[0]);
    let min = parseInt(timeStr.split(':')[1].split('.')[0]);
    let sec = parseInt(timeStr.split('.')[1]);
    return hour * 3600 + min * 60 + sec;
}



window.addEventListener('load', init);