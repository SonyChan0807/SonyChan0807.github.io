/* jshint esversion: 6 */

let currentZoom = 2; //8; //12;
let map;
let svgLayer;
let feature;
let rankFeature;
let toggleStatus;

const mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>';
const mbUrl = `https://api.mapbox.com/styles/v1/sonychan0807/cja9chgrg1e1z2ro2n7p1api4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic29ueWNoYW4wODA3IiwiYSI6ImNqNGk4ZGEwaDAyOGszM3F3Nzc1bWIxNjcifQ.hUbe7j_iHsjcEhPNLTvxDA`;

const grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });
// const marathon = "data/marathon_data.csv";
const marathon_age = "data/marathon_city_counts_top20.csv";
const marathon_data = "data/marathon_data.csv";

const containerWidth = parseInt(d3.select('#barchart_age').style('width'), 10);
const containerHeight = parseInt(d3.select('#barchart_age').style('height'), 10);

const margin2 = {
    top: 40,
    right: 40,
    bottom: 60,
    left: 70
};
const width2 = containerWidth - margin2.left - margin2.right;
const height2 = containerHeight - margin2.top - margin2.bottom;

function init() {
    yearSlider.on('change', () => {
        updateGraph(yearSlider.getValue());
    });

    initMap();
    updateGraph(2017);
    toggleSetting();
}



function updateGraph(year) {
    drawMap(year);
    drawBarAge(year);
    showRunner();
}

function initMap() {
    if (map != undefined) {
        map.remove();
    }
    map = L.map('geomap', {
        layers: [grayscale]
    }).setView([46.80111, 8.22667], currentZoom);
}

function drawMap(year) {


    if (svgLayer != undefined) {
        svgLayer.remove();
    }

    // Add SVG layer to map
    svgLayer = L.svg();
    svgLayer.addTo(map);

    const svg = d3.select("#geomap").select("svg");
    const g = svg.append("g");
    g.attr("class", "leaflet-zoom-hide");

    const div = d3.select("#geomap")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.csv(marathon_age, (data) => {
        const finalData = processData(data, year);
        console.log('test1');
        feature = plotCircle(g, finalData);

        // // create a d3.geoPath to convert GeoJSON to SVG
        let transform = d3.geoTransform({
            point: () => {
                let point = map.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
            }
        });

        d3.geoPath().projection(transform);
        map.on("moveend", updateFeature);
        updateFeature();
    });

    d3.csv('data/marathon_top10.csv', (data) => {
            data.forEach(d => {
                d.LatLng = new L.LatLng(parseFloat(d.latitude), parseFloat(d.longitude));
            });

            rankFeature = plotRank(g, data);

            let transform = d3.geoTransform({
                point: () => {
                    let point = map.latLngToLayerPoint(new L.LatLng(y, x));
                    this.stream.point(point.x, point.y);
                }
            });

            d3.geoPath().projection(transform);
            map.on("moveend", updateRank);
            updateRank();
        }

    );
}

function updateFeature() {
    currentZoom = map.getZoom();
    console.log(feature);
    feature.attr("transform",
        (d) => {
            return "translate(" + map.latLngToLayerPoint(d.LatLng).x + "," +
                map.latLngToLayerPoint(d.LatLng).y + ")";
        });

}

function updateRank() {
    rankFeature.attr("transform",
        (d) => {
            return "translate(" + map.latLngToLayerPoint(d.LatLng).x + "," +
                map.latLngToLayerPoint(d.LatLng).y + ")";
        });
}

function plotCircle(g, data) {
    let circles = g.selectAll("map_circle")
        .data(data)
        .enter().append("circle")
        .style("stroke", '#ccebc5')
        .style("opacity", 0.5)
        .style("fill", '#ccebc5')
        .attr('class', (d) => `${d.gender}_${d['age group']}_map $`)
        .attr('id', 'map_circle')
        .attr("r", (d) => 1.5);
    return circles;
}

function plotRank(g, data) {
    let ranks = g.selectAll('rank_circle')
        .data(data)
        .enter().append("circle")
        .attr('class', (d) => `rank_${d['race year']}_${d['gender']}_${d['age group']}_${d['category']}`)
        .classed("rank_circles", true)
        .style("opacity", 0.0)
        .attr('id', d => `rank_${d['index']}`)
        .attr("r", (d) => 5);
    return ranks;
}

function processData(data, year) {
    const newData = data.filter((d) => d['race year'] == year);
    const groupByCity = {};

    newData.forEach(d => {
        d.LatLng = new L.LatLng(parseFloat(d.latitude), parseFloat(d.longitude));
    });
    return newData;
}

function drawBarAge(year) {
    d3.csv(marathon_data, (data) => {
        const newData = data.filter(d => d["race year"] == year);
        const maleCF = crossfilter(newData.filter(d => d.gender == 'male'));
        const femaleCF = crossfilter(newData.filter(d => d.gender == 'female'));

        let maleDimension = maleCF.dimension((d) => d['age group']);
        let femaleDimension = femaleCF.dimension((d) => d['age group']);
        let countsByAgeGroupMale = maleDimension.group().reduceCount().all();
        let countsByAgeGroupFemale = femaleDimension.group().reduceCount().all();

        let combined = {};
        countsByAgeGroupMale.forEach(d => combined[d.key] = {
            "male": d.value,
            "female": 0
        });
        countsByAgeGroupFemale.forEach(d => combined[d.key].female = d.value);

        let finalData = Object.keys(combined).map(
            key => {
                let obj = {};
                obj.label = key;
                obj.male = combined[key].male;
                obj.female = combined[key].female;
                return obj;
            });

        updateBarAge(finalData, margin2, width2, height2);
    });
}

function updateBarAge(dataset, margin, width, height) {
    const x0 = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1);
    const x1 = d3.scaleBand();
    const y = d3.scaleLinear()
        .range([height, 0]);

    const colorRange = d3.scaleOrdinal(d3.schemeCategory10);
    const color = d3.scaleOrdinal()
        .range(colorRange.range());

    const xAxis = d3.axisBottom(x0);

    const yAxis = d3.axisLeft(y);


    const divTooltip = d3.select("body").append("div").attr("class", "toolTip");

    d3.select('#age_bar').remove();
    const svg = d3.select("#barchart_age").append("svg")
        .attr("width", width + margin.left + margin.right - 20)
        .attr("height", height + margin.top + margin.bottom)
        .attr('id', 'age_bar')
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    const options = d3.keys(dataset[0]).filter(function (key) {
        return key !== "label";
    });

    dataset.forEach(d => {
        d.valores = options.map(function (name) {
            return {
                name: name,
                value: +d[name],
                "label": d.label
            };
        });
    });

    x0.domain(dataset.map(d => d.label));

    x1.domain(options).range([0, x0.bandwidth()]).padding(0.05);
    y.domain([0, d3.max(dataset, d => d3.max(d.valores, d => d.value))]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Satisfaction %");

    const bar = svg.selectAll(".bar")
        .data(dataset)
        .enter().append("g")
        .attr("class", "rect")
        .attr("transform", d => "translate(" + x0(d.label) + ",0)");

    bar.selectAll("rect")
        .data(d => d.valores)
        .enter().append("rect")
        .attr("width", x1.bandwidth())
        .attr("x", d => x1(d.name))
        .attr("y", d => y(d.value))
        .attr("id", d => `${d.name}_${d.label}`)
        .attr("name", d => d.name)
        .attr("counts", d => d.value)
        .attr("height", d => height - y(d.value))
        .style("fill", d => color(d.name))
        .on("mouseover", (d) => {
            let item = d3.select(`#${d.name}_${d.label}`);
            item.attr("class", "highlight");
            divTooltip.style("left", d3.event.pageX + 10 + "px")
                .style("top", d3.event.pageY - 25 + "px")
                .style("display", "inline-block")
                .html(d.label + "<br>" + item.attr('name') +
                    "<br>" + item.attr('counts'));
            d3.selectAll("#map_circle").attr('style', "fill: none");
            d3.selectAll(`.${d.name}_${d.label}_map`).attr('style', "fill: red");
            d3.selectAll("#rank_circles").style("opacity", 0.0);
        })
        .on("mouseout", function (d) {
            d3.select(`#${d.name}_${d.label}`).attr('class', null);

            d3.selectAll("#map_circle")
                .style("stroke", '#ccebc5')
                .style("opacity", 0.5)
                .style("fill", '#ccebc5');
            d3.selectAll("#rank_circles").style("opacity", 0.5);
            divTooltip.style("display", "none");
        }).transition()
        .duration(1000);

    const legend = svg.selectAll(".legend")
        .data(options.slice())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
}


function toggleSetting() {
    $(function () {
        $('#toggle-event').change(function () {
            toggleStatus = $(this).prop('checked');
            console.log(toggleStatus);
            if (toggleStatus) {
                d3.select('#updateRank').classed('disabled', false).on('click', showRunner);
                showRunner();
            } else {
                // disable Update button
                d3.select('#updateRank').classed('disabled', true).on('click', d => 0);
                removeRunner();
            }
        });
    });
}

function showRunner() {
    let year = yearSlider.getValue();
    let gender = $("#gender option:selected").text();
    let dist = $("#dist option:selected").text();
    let aGroup = $("#age_group option:selected").text();

    // remove list
    $('.rankTr').remove();

    d3.csv('data/marathon_top10.csv', data => {

        data = data.filter(d => d["race year"] == year && d["category"] == dist.split('k')[0] &&
            d['gender'] == gender.toLowerCase() && d["age group"] == aGroup.toLowerCase());

        // add to table
        data.forEach((d, idx) => {

            let trStr = `<tr class="rankTr" id="rank_tr_${d['index']}" lat="${parseFloat(d['latitude'])}" lon="${parseFloat(d['longitude'])}">
            <th scope="row">${idx + 1}</th>
            <td>${d['name']}</td>
            <td>${d['city']}</td>
            <td>${d['country']}</td>
            </tr>`;
            $("#rank_tbody").append(trStr);
        });


        let rankCenter = [parseFloat(data[0]['latitude']), parseFloat(data[0]['longitude'])];


        map.setView(rankCenter, 7);
        //show on the map
        d3.selectAll(`.rank_${data[0]['race year']}_${data[0]['gender']}_${data[0]['age group']}_${data[0]['category']}`)
            .classed('rankTr_cirlcle', true)
            .style("stroke", 'steelblue')
            .style("opacity", 1)
            .style("fill", 'steelblue')
            .attr('id', d => `rank_${d['index']}`)
            .attr("r", (d) => 6);

        // add list hover effect
        $('.rankTr').each(function () {
            let row = $(this);
            let idx = row.attr('id').split("_")[2];
            let runnerCenter = [parseFloat(row.attr('lat')), parseFloat(row.attr('lon'))];
            row.mouseover(function () {
                map.setView(runnerCenter, 6, {
                    pan: {
                        animate: true,
                        duration: 1.0
                    }
                });
                d3.selectAll("#map_circle").attr('style', "fill: none");
                console.log($(`#rank_${idx}`));
                d3.select(`#rank_${idx}`)
                    .style("stroke", 'yellow')
                    .style("opacity", 1)
                    .style("fill", 'yellow');
            }).mouseout(function () {
                map.setView(rankCenter, 6, {
                    pan: {
                        animate: true,
                        duration: 1.0
                    }
                });
                d3.selectAll("#map_circle")
                    .style("stroke", '#ccebc5')
                    .style("opacity", 0.5)
                    .style("fill", '#ccebc5');

                d3.select(`#rank_${idx}`)
                    .style("stroke", 'steelblue')
                    .style("opacity", 1)
                    .style("fill", 'steelblue')
                    .attr('id', d => `rank_${d['index']}`)
                    .attr("r", (d) => 6);
            });
        });
    });

}

function removeRunner() {
    // remove list
    $('.rankTr').remove();

    // remove circle
    d3.selectAll(".rankTr_cirlcle")
        .style("opacity", 0.0);

    map.setView([46.80111, 8.22667], 2, {
        pan: {
            animate: true,
            duration: 1.0
        }
    });
}

window.addEventListener('load', init);
