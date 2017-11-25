var currentZoom = 8; //8; //12;
var map;
var feature;
const mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>';
const mbUrl = `https://api.mapbox.com/styles/v1/sonychan0807/cja9chgrg1e1z2ro2n7p1api4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic29ueWNoYW4wODA3IiwiYSI6ImNqNGk4ZGEwaDAyOGszM3F3Nzc1bWIxNjcifQ.hUbe7j_iHsjcEhPNLTvxDA`;
// const mbUrl = "https://api.mapbox.com/styles/v1/sonychan0807/cjaclg94x4f3z2rsemlyvyifx/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic29ueWNoYW4wODA3IiwiYSI6ImNqNGk4ZGEwaDAyOGszM3F3Nzc1bWIxNjcifQ.hUbe7j_iHsjcEhPNLTvxDA";

const grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });
const marathon = "data/marathon-data-with-geo.csv";



function init() {
    drawMap(2017)    
}

function drawMap(year) {
    	
    if (map != undefined) { map.remove(); } 
    map = L.map('geomap', {
        layers: [grayscale]
    }).setView([46.80111, 8.22667], currentZoom);

    // Add SVG layer to map
    const svgLayer = L.svg();
    svgLayer.addTo(map);

    const svg = d3.select("#geomap").select("svg");
    const g = svg.append("g");
    g.attr("class", "leaflet-zoom-hide");

    const div = d3.select("#geomap")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    var tooltip = d3.select("body").append("div").attr("class", "tooltip");
    d3.csv(marathon, (data) => {

        const newData = data.filter((d) => d['race-year'] == year)
        let location = {}
        newData.forEach((d) => location[d['format_city']] = {
            city: d['format_city'],
            counts: 0,
            LatLng: new L.LatLng(parseFloat(d.lat), parseFloat(d.lng))
        })
        let race = crossfilter(data);
        let cityDimension = race.dimension((d) => d['format_city']);
        let countsByCity = cityDimension.group().reduceCount().all();

        countsByCity.forEach((city) => {
            if (location[city.key] !== undefined) {
                location[city.key].counts = city.value;
            }
        });
        const finalData = Object.keys(location).map(key => location[key])

        data.forEach(d => {
            d.LatLng = new L.LatLng(parseFloat(d.lat), parseFloat(d.lng));
        });

        // finalData format {city: cityname, counts: 0, LatLng: L.LatLng}
        feature = plotCircle(g, finalData);

        // // create a d3.geoPath to convert GeoJSON to SVG
        let transform = d3.geoTransform({
            point: () => {
                let point = map.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
            }
        });

        d3.geoPath().projection(transform);
        map.on("moveend", update)
        update();
    });

}


function update() {
    currentZoom = map.getZoom();
    feature.attr("transform",
        (d) => {
            return "translate(" + map.latLngToLayerPoint(d.LatLng).x + "," +
                map.latLngToLayerPoint(d.LatLng).y + ")";
        });
}


function plotCircle(g, data) {
    let circles = g.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .style("stroke", '#ccebc5')
        .style("opacity", 0.5)
        .style("fill", '#ccebc5')
        .attr("r", (d) => 5)
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip)
        .on("click", clicked);
    // .append("svg:title")
    // .text((d) => `City: ${d.city} Participants: ${d.counts}`)
    // .on('mouseover', (d) => {
    //                         d3.select(this)
    //                                 .style({
    //                                     'fill': '#1f78b4'
    //                                 });
    ; //Math.log(d.counts + 1) * 2);
    return circles
}


// Add optional onClick events for features here
// d.properties contains the attributes (e.g. d.properties.name, d.properties.population)
function clicked(d, i) {

}


//Update map on zoom/pan
function zoomed() {
    features.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
        .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px");
}


//Position of the tooltip relative to the cursor
var tooltipOffset = {
    x: 5,
    y: -25
};

//Create a tooltip, hidden at the start
function showTooltip(d) {
    moveTooltip();

    tooltip.style("display", "block")
        .text('text');
}

//Move the tooltip to track the mouse
function moveTooltip() {
    tooltip.style("top", (d3.event.pageY + tooltipOffset.y) + "px")
        .style("left", (d3.event.pageX + tooltipOffset.x) + "px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
    tooltip.style("display", "none");
}

window.addEventListener('load', init)


//---------------------------------
// for popup, when map is clicked
// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);
//---------------------------------