var currentZoom = 11; //8; //12;
var map;
var gxpTimeLayerStore = {}


function init() {
    document.getElementById("addGroup").addEventListener('click', addGroup);
    document.getElementById("addPerson").addEventListener('click', addPerson);
    console.log(gxpTimeLayerStore);
    initMap();
}

function reset() {
    initMap()
    $('#runner_list').html("");
    gxpTimeLayerStore = {};
}

function addGroup() {
    let year = $("#year option:selected").text();
    let dist = $("#dist option:selected").text();
    let gender = $("#g_gender option:selected").text();
    let aGroup = $("#age_group option:selected").text();
    let aSpeed = $("#age_speed option:selected").text();
    let tagId = `group_${year}_${dist}_${gender}_${aGroup}_${aSpeed}`
    let iconParams = genIconParams();

    toggleErrorMSG("group_error", 0);
    toggleErrorMSG("person_error", 0);
    if (gxpTimeLayerStore[tagId] != undefined) {
        toggleErrorMSG("group_error", 1)
        return;
    } else if (Object.keys(gxpTimeLayerStore).length === 5) {
        console.log(Object.keys(gxpTimeLayerStore).length);
        console.log("test");
        toggleErrorMSG("group_error", 3)
        return;
    }
    addGroupLayer(tagId, year, dist.split("k")[0], gender, aGroup, aSpeed, iconParams);
}

function addPerson() {
    let year = $("#year option:selected").text();
    let dist = $("#dist option:selected").text();
    let gender = $("#per_gender option:selected").text();
    let name = $('#name').val().trim();
    let iconParams = genIconParams();
    let tagId = `person_${year}_${dist}_${gender}_${name}`
    toggleErrorMSG("person_error", 0);
    toggleErrorMSG("group_error", 0);
    if (gxpTimeLayerStore[tagId] != undefined) {
        toggleErrorMSG("person_error", 1)
        return;
    } else if (Object.keys(gxpTimeLayerStore).length === 5) {
        toggleErrorMSG("person_error", 3)
        return;
    } else if (name == "") {
        toggleErrorMSG("person_error", 4)
        return;
    }

    addPersonLayer(tagId, year, dist.split("k")[0], gender, name, iconParams)
}


function addInfo(type, tagId, year, dist, gender, secs, iconParams, name = "", aGroup = "", aSpeed = "") {
    let htmlStr = undefined
    let record = moment.utc(secs * 1000).format('HH:mm:ss')

    if (type == "group") {
        // console.log(record)
        htmlStr = `<li class="list-group-item" id="${tagId}"><img src="${iconParams.imgSrc}">
        <p>${year}-${dist}-${gender}-${aGroup}-${ aSpeed}-${record}<p>
        <button type="button" class="btn btn-danger btn-sm" id="test" onclick="deleteList('${tagId}')">Delete</button></li>`
    } else {
        console.log(name);
        htmlStr = `<li class="list-group-item" id="${tagId}"><img src="${iconParams.imgSrc}">
        <p>${year}-${dist}-${gender}-${name}-${record}</p>
        <button type="button" class="btn btn-danger btn-sm" id="test" onclick="deleteList('${tagId}')">Delete</button></li>`
    }
    $("#runner_list").append(htmlStr);
}

function genIconParams() {
    let colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]
    let dashes = ["5, 5", "5, 10", "10, 5", "5, 1", "1, 5", "0.9", "15, 10, 5", "15, 10, 5, 10", "15, 10, 5, 10, 15", "5, 5, 1, 5"];
    let imgSrcs = ['img/runner-blue.png', 'img/runner-red.png', 'img/runner-green.png', 'img/runner-orange.png', 'img/runner-purple.png'];

    let params = {
        'color': colors[Math.floor(Math.random() * colors.length)],
        'dash': dashes[Math.floor(Math.random() * dashes.length)],
        'imgSrc': imgSrcs[Math.floor(Math.random() * imgSrcs.length)],
    }
    console.log(params);
    return params
}

function deleteList(id) {

    // Remove from list
    $(`#${id}`).remove();

    // Remove layer

    // console.log('layer delete')
    // console.log(id);
    // console.log(gxpTimeLayerStore);
    // console.log(gxpTimeLayerStore[id]);
    // console.log(gxpTimeLayerStore[Object.keys(gxpTimeLayerStore)[0]])
    gxpTimeLayerStore[id].remove();
    delete gxpTimeLayerStore[id];

    initMap();
    let keys = Object.keys(gxpTimeLayerStore);
    if (key.length) {
        keys.forEach(key => gxpTimeLayerStore[key].addTo(map));
    }


}

function initMap() {
    const mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>';
    const mbUrl = "https://api.mapbox.com/styles/v1/sonychan0807/cjaclg94x4f3z2rsemlyvyifx/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic29ueWNoYW4wODA3IiwiYSI6ImNqNGk4ZGEwaDAyOGszM3F3Nzc1bWIxNjcifQ.hUbe7j_iHsjcEhPNLTvxDA";

    const grayscale = L.tileLayer(mbUrl, {
            id: 'mapbox.light',
            attribution: mbAttr
        }),
        streets = L.tileLayer(mbUrl, {
            id: 'mapbox.streets',
            attribution: mbAttr
        });

    if (map != undefined) {
        map.remove();
    }

    map = L.map('pathmap', {
        layers: [grayscale]
    }).setView([46.494418, 6.743643], currentZoom);


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
        minSpeed: 20,
        speedStep: 1,
        maxSpeed: 60,
        timeSliderDragUpdate: true
    };

    var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
    map.addControl(timeDimensionControl);

}

function addGroupLayer(tagId, year, dist, gender, aGroup, aSpeed, iconParams) {

    let speed = {
        "Fastest": "min",
        "Slowest": "max",
        "Average": "avg"
    };
    d3.csv('data/marathon_max_min_avg.csv', (data) => {

        let selectedData = data.filter(d => d["race year"] == year && d["category"] == dist &&
            d["age group"] == aGroup.toLowerCase() && d['gender'] == gender.toLowerCase());
        console.log(speed[aSpeed]);
        console.log(selectedData);
        let timeSecs = selectedData[0][speed[aSpeed]];
        let gpxFileName = `data/marathon_${dist}.gpx`;
        addInfo("group", tagId, year, dist, gender, timeSecs, iconParams, "", aGroup, aSpeed);

        let gpx = genGPXFile(gpxFileName, timeSecs, "2017");
        gpx.then((data) => {
            addRunner(data, iconParams, tagId);
        })
    });
}

function addPersonLayer(tagId, year, dist, gender, name, iconParams) {
    d3.csv('data/marathon_data.csv', (data) => {
        let selectedData = data.filter(d => d["race year"] == year && d["category"] == dist &&
            d["name"] == name && d['gender'] == gender.toLowerCase());
        if (selectedData.length == 0) {
            toggleErrorMSG("person_error", 2);
            return;
        }
        console.log(selectedData);
        let time = selectedData[0]['time'];
        console.log(time);
        let timeSecs = getSecs(time);
        console.log(timeSecs);
        addInfo("person", tagId, year, dist, gender, timeSecs, iconParams, name, "", "");

        let gpxFileName = `data/marathon_${dist}.gpx`;
        let gpx = genGPXFile(gpxFileName, timeSecs, "2017");
        gpx.then((data) => {
            addRunner(data, iconParams, tagId);
        })

    });
}

function addRunner(data, iconParams, layerID) {

    let icon = L.icon({
        iconUrl: iconParams.imgSrc,
        iconSize: [22, 22],
        iconAnchor: [5, 25],
        popupAnchor: [5,-10]
    });

    let userInfo = layerID.split('_')
    let popupStr =  ""
    if (userInfo[0] == 'group'){
        
        // `group_${year}_${dist}_${gender}_${aGroup}_${aSpeed}`
        popupStr = `${userInfo[1]} ${userInfo[2]} ${userInfo[3]} </br> ${userInfo[4]} ${userInfo[5]}`
    }else {
        
        // `person_${year}_${dist}_${gender}_${name}`
        popupStr = `${userInfo[1]} ${userInfo[2]} ${userInfo[3]} </br> ${userInfo[4]}`
    }

    let customLayer = L.geoJson(null, {
        pointToLayer: (feature, latLng) => {
            if (feature.properties.hasOwnProperty('last')) {
                let marker = new L.Marker(latLng, {
                        icon: icon,
                        }).bindPopup( popupStr);
                marker.on('mouseover', (e) => {
                        marker.openPopup();
                    })
                marker.on('mouseout', (e) => {
                        marker.closePopup();
                    });
                return marker;
                }
            return L.circleMarker(latLng);
        },
        style: (feature) => {
            return {
                color: iconParams.color,
                dashArray: iconParams.dash
            }
        }
    });

    let gpxLayer = omnivore.gpx.parse(data, null, customLayer).on('ready', () => {
        map.fitBounds(gpxLayer.getBounds(), {
            paddingBottomRight: [40, 40]
        });
    });



    let gpxTimeLayer = L.timeDimension.layer.geoJson(gpxLayer, {
        updateTimeDimension: true,
        addlastPoint: true,
        waitForReady: true
    });

    gxpTimeLayerStore[layerID] = gpxTimeLayer
    console.log(gxpTimeLayerStore);
    console.log(gpxTimeLayer);
    gpxTimeLayer.addTo(map);
}

function genGPXFile(filePath, secs, startTime) {
    // let newGpx;
    console.log(secs);
    let newGPX = new Promise((resolve, reject) => {
        $.ajax({
            url: filePath,
            success: function (data) {
                let trks = $(data).find("trkpt");
                let timeGap = secs / trks.length;
                console.log(timeGap);
                let multiplyer = 0;
                let isoTime = moment(`${startTime}-01-01 8:00:00`);
                trks.each(function () {
                    let trk = $(this);
                    let timeContext = isoTime.add(timeGap, 'seconds').toISOString();
                    // console.log(timeContext);
                    trk.append(`<time>${timeContext}</time>`)
                    let userNum = Object.keys(gxpTimeLayerStore).length
                    let lon = parseFloat(trk.attr('lon')) + 0.001 * userNum;
                    trk.attr('lon', lon.toString());
                    multiplyer += 1;
                });
                resolve(data);
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

function toggleErrorMSG(id, type) {
    let errorMSG = '';
    switch (type) {
        case 1:
            errorMSG = "Runner is on the map!"
            break;
        case 2:
            errorMSG = "Runner note found"
            break;
        case 3:
            errorMSG = "Excess 5 runners"
            break;
        case 4:
            errorMSG = "Runner's name is empty"
            break;
        default:
            errorMSG = ""
    }
    console.log(errorMSG);
    $(`#${id}`).text(errorMSG);
}


window.addEventListener('load', init);