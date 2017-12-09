// Initial call
changeChart(2017,true);

window.addEventListener("resize", redraw);
function redraw() {
    // Pie chart
    pieChartDiv = document.getElementById("piechart");
    margin = {top: 2, right: 2, bottom: 2, left: 2};
    width = pieChartDiv.clientWidth - margin.left - margin.right;
    height = pieChartDiv.clientHeight - margin.top - margin.bottom;
    radius = Math.min(width, height) / 2;

    d3.select("#piechart").select("svg").remove();
    svg = d3.select("#piechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labelName");
    svg.append("g")
        .attr("class", "labelValue");
    svg.append("g")
        .attr("class", "lines");

    pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });
    arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    legendRectSize = (radius * 0.05);
    legendSpacing = radius * 0.02;

    div = d3.select("body").append("div").attr("class", "toolTip");

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    color = d3.scaleOrdinal(d3.schemeCategory20);

// Histogram
    chartDiv = document.getElementById("min");
    margin2 = {top: 40, right: 40, bottom: 60, left: 70};
    width2 = chartDiv.clientWidth - margin2.left - margin2.right;
    height2 = chartDiv.clientHeight - margin2.top - margin2.bottom;
    div2 = d3.select("body").append("div").attr("class", "toolTip");

    d3.select("#avg").select("svg").remove();
    d3.select("#min").select("svg").remove();
    d3.select("#max").select("svg").remove();
    chartAvg = d3.select("#avg")
        .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    chartMin = d3.select("#min")
        .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    chartMax = d3.select("#max")
        .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    xChart = d3.scaleBand()
        .range([0, width2]);
    yChart = d3.scaleLinear()
        .range([height2, 0]);

    xAxis = d3.axisBottom(xChart);
    yAxis = d3.axisLeft(yChart);

    chartAvg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    chartAvg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d){
            return "rotate(-65)";
        });

    chartAvg
        .append("text")
        .attr("transform", "translate(-60," +  (height2+margin2.bottom)/2 + ") rotate(-90)")
        .text("Average race time (sec)");

    chartAvg
        .append("text")
        .attr("transform", "translate(" + ((width2/2) - 40) + "," + (height2 + margin2.bottom - 8) + ")")
        .text("Race category");

    chartMin.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    chartMin.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d){
            return "rotate(-65)";
        });

    chartMin
        .append("text")
        .attr("transform", "translate(-60," +  (height2+margin2.bottom)/2 + ") rotate(-90)")
        .text("Fastest run time (sec)");

    chartMin
        .append("text")
        .attr("transform", "translate(" + ((width2/2) - 40) + "," + (height2 + margin2.bottom - 8) + ")")
        .text("Race category");

    chartMax.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    chartMax.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d){
            return "rotate(-65)";
        });

    chartMax
        .append("text")
        .attr("transform", "translate(-60," +  (height2+margin2.bottom)/2 + ") rotate(-90)")
        .text("Slowest run time (sec)");

    chartMax
        .append("text")
        .attr("transform", "translate(" + ((width2/2) - 40) + "," + (height2 + margin2.bottom - 8) + ")")
        .text("Race category");

    var value = mySlider.getValue();
    changeChart(value,true);
}

// Year slider
var mySlider = new Slider("#ex21", {
  ticks:[2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
  ticks_labels:[2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
});

mySlider.on('change', function(){
  var value = mySlider.getValue();
  changeChart(value,false);
});

// Arrange row dat
function row(d) {
  return {
      category: +d['category'],
      gender: d['gender'],
      year: +d['race year'],
      time: d['time']
  };
}

function changeChart(value,first){
  d3.csv("data/marathon_data.csv", row, function(error, data) {
      if (error) throw error;
      var updateData = [];
      var categories = [10,21,42];
      var gender = ['male','female'];

      var alldata = crossfilter(data),
          dataByYear = alldata.dimension(function(d) { return d.year; }),
          chooseDataByYear = dataByYear.filter(function(d) { return d == value}),
          chooseDataByYearObject = chooseDataByYear.top(Infinity);

      for(var i = 0; i < categories.length; i++){
        var yearData = crossfilter(chooseDataByYearObject),
            yearDataByRace = yearData.dimension(function(d) { return d.category; }),
            chooseDataByRace = yearDataByRace.filter(function(d) { return d == categories[i]}),
            chooseDataByRaceObject = chooseDataByRace.top(Infinity);
        for(var j = 0; j < gender.length; j++){
          var raceData = crossfilter(chooseDataByRaceObject),
              raceDataByGender = raceData.dimension(function(d) { return d.gender; }),
              chooseDataByGender = raceDataByGender.filter(function(d) { return d == gender[j]}),
              chooseDataByGenderObject = chooseDataByGender.top(Infinity);

          totalTime = 0;
          min = Number.POSITIVE_INFINITY;
          max = Number.NEGATIVE_INFINITY;
          chooseDataByGenderObject.forEach(function(element){
            var timeParts = element.time.split(":");
            var secParts = timeParts[2].split(".");
            var secs = Number(timeParts[0]) * 3600 + Number(timeParts[1]) * 60 + Number(secParts[0]);
            if(secs > max) max = secs;
            if(secs < max) min = secs;
            totalTime += secs;
          });

          updateData.push({'label':categories[i]+'km - '+gender[j],'category':categories[i].toString(),'gender':gender[j],
              'value':chooseDataByGenderObject.length,
              'avgTime':(totalTime/chooseDataByGenderObject.length).toFixed(2),
              'minTime':min.toFixed(2),
              'maxTime':max.toFixed(2)});
        }
      }
      var total = 0;
      for(var i = 0; i < updateData.length; i++){
        total += updateData[i].value;
      }
      for(var i = 0; i < updateData.length; i++){
        updateData[i].value = (updateData[i].value / total * 100).toFixed(2);
      }

      console.log(updateData);
      updateFastestHistogram(updateData);
      updateSlowestHistogram(updateData);
      updateAvgHistogram(updateData);
      updatePiechart(updateData);
      if(first){
        updatePiechart(updateData);
      }
  });
}

// Pie chart
var pieChartDiv = document.getElementById("piechart");
var margin = {top: 2, right: 2, bottom: 2, left: 2};
var width = pieChartDiv.clientWidth - margin.left - margin.right;
var height = pieChartDiv.clientHeight - margin.top - margin.bottom;
var radius = Math.min(width, height) / 2;

var svg = d3.select("#piechart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "slices");
svg.append("g")
    .attr("class", "labelName");
svg.append("g")
    .attr("class", "labelValue");
svg.append("g")
    .attr("class", "lines");

var pie = d3.pie()
    .sort(null)
    .value(function(d) {
        return d.value;
    });

var arc = d3.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

var legendRectSize = (radius * 0.05);
var legendSpacing = radius * 0.02;

var div = d3.select("body").append("div").attr("class", "toolTip");

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(d3.schemeCategory20);

// Histogram
var chartDiv = document.getElementById("min");
var margin2 = {top: 40, right: 40, bottom: 60, left: 70};
var width2 = chartDiv.clientWidth - margin2.left - margin2.right;
var height2 = chartDiv.clientHeight - margin2.top - margin2.bottom;
var div2 = d3.select("body").append("div").attr("class", "toolTip");

var chartAvg = d3.select("#avg")
    .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var chartMin = d3.select("#min")
    .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var chartMax = d3.select("#max")
    .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var xChart = d3.scaleBand()
    .range([0, width2]);
var yChart = d3.scaleLinear()
    .range([height2, 0]);

var xAxis = d3.axisBottom(xChart);
var yAxis = d3.axisLeft(yChart);

chartAvg.append("g")
    .attr("class", "y axis")
    .call(yAxis)

chartAvg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d){
        return "rotate(-65)";
    });

chartAvg
    .append("text")
    .attr("transform", "translate(-60," +  (height2+margin2.bottom)/2 + ") rotate(-90)")
    .text("Average race time (sec)");

chartAvg
    .append("text")
    .attr("transform", "translate(" + ((width2/2) - 40) + "," + (height2 + margin2.bottom - 8) + ")")
    .text("Race category");

chartMin.append("g")
    .attr("class", "y axis")
    .call(yAxis)

chartMin.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d){
        return "rotate(-65)";
    });

chartMin
    .append("text")
    .attr("transform", "translate(-60," +  (height2+margin2.bottom)/2 + ") rotate(-90)")
    .text("Fastest run time (sec)");

chartMin
    .append("text")
    .attr("transform", "translate(" + ((width2/2) - 40) + "," + (height2 + margin2.bottom - 8) + ")")
    .text("Race category");

chartMax.append("g")
    .attr("class", "y axis")
    .call(yAxis)

chartMax.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d){
        return "rotate(-65)";
    });

chartMax
    .append("text")
    .attr("transform", "translate(-60," +  (height2+margin2.bottom)/2 + ") rotate(-90)")
    .text("Slowest run time (sec)");

chartMax
    .append("text")
    .attr("transform", "translate(" + ((width2/2) - 40) + "," + (height2 + margin2.bottom - 8) + ")")
    .text("Race category");

function updatePiechart(data) {
  var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label })
        .attr("class", function(d) {
            return d3.select(this).attr("class") + " " +  "m_" + 
            d.data.label.replace(/\s/g, "").replace("-","_")
        });

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
        .attr("class", "slice")
        

    slice
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })
    slice
        .on("mouseover", function(d){
            
            
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((d.data.label)+"<br>"+(d.data.value)+"%");
            let id = "m_" + d.data.label.replace(/\s/g, "").replace("-","_");
            d3.selectAll(`.${id}`).attr("stroke", "black").attr("stroke-width", 1);

        });
    slice

        .on("mouseout", function(d){
            div.style("display", "none");
            let id = "m_" + d.data.label.replace(/\s/g, "").replace("-","_");
            d3.selectAll(`.${id}`).attr("stroke", "None").attr("stroke-width", 0);
        });

    slice.exit()
        .remove();

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = - 5 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; });

    var text = svg.select(".labelName").selectAll("text")
        .data(pie(data), function(d){ return d.data.label });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data.label+": "+d.data.value+"%");
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
        .transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        })
        .text(function(d) {
            return (d.value+"%");
        });


    text.exit()
        .remove();

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), function(d){ return d.data.label });

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();

}


function updateAvgHistogram(data){
  xChart.domain(data.map(function(d){ return d.category + 'km'; }) );
  yChart.domain( [0, d3.max(data, function(d){ return +d.avgTime; })] );
  var barWidth = width2 / data.length;
  var bars = chartAvg.selectAll(".bar").data(data);

  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", function(d){
      if(d.gender === "female"){
        return "#CCEBC5";
      }else{
        return "#FFED6F";
      }
    })
    .on("mouseover", function(d){
            div2.style("left", d3.event.pageX+10+"px");
            div2.style("top", d3.event.pageY-25+"px");
            div2.style("display", "inline-block");
            div2.html((d.label)+"<br>Avg race time: "+(d.avgTime.toHHMMSS()));
            let id = "m_" + d.label.replace(/\s/g, "").replace("-","_");
            d3.selectAll(`.${id}`).attr("stroke", "black").attr("stroke-width", 3);
            
    })
    .attr("class", function(d) {
        return d3.select(this).attr("class") + " " +  "m_" + 
        d.label.replace(/\s/g, "").replace("-","_")
    })
    .on("mouseout", function(d){ div2.style("display", "none");
    let id = "m_" + d.label.replace(/\s/g, "").replace("-","_");
    d3.selectAll(`.${id}`).attr("stroke", "None").attr("stroke-width", 0);
    })
    .attr("width", barWidth - 1)
    .attr("x", function(d, i){ return i * barWidth + 1 })
    .attr("y", height2)
    .attr("height", 0)
    .transition()
    .delay(function (d, i) { return i*100; })
    .attr("y", function (d, i) { return yChart(d.avgTime); })
    .attr("height", function (d) { return height2-yChart(d.avgTime); });

    bars.exit().remove();

    bars.transition()
        .duration(750)
        .attr("y", function(d) { return yChart(d.avgTime); })
        .attr("height", function(d) { return height2 - yChart(d.avgTime); });

  chartAvg.select('.y')
      .call(yAxis)

  chartAvg.select('.xAxis')
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d){
        return "rotate(-65)";
      });

}

function updateFastestHistogram(data){
    xChart.domain(data.map(function(d){ return d.category + 'km'; }) );
    yChart.domain( [0, d3.max(data, function(d){ return +d.minTime; })] );
    var barWidth = width2 / data.length;
    var bars = chartMin.selectAll(".bar").data(data);

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", function(d){
            if(d.gender === "female"){
                return "#FDB462";
            }else{
                return "#B3DF68";
            }
        })
        .attr("class", function(d) {
            return d3.select(this).attr("class") + " " +  "m_" + 
            d.label.replace(/\s/g, "").replace("-","_")
        })
        .on("mouseover", function(d){
            div2.style("left", d3.event.pageX+10+"px");
            div2.style("top", d3.event.pageY-25+"px");
            div2.style("display", "inline-block");
            div2.html((d.label)+"<br>Fastest run time: "+(d.minTime.toHHMMSS()));
            let id = "m_" + d.label.replace(/\s/g, "").replace("-","_");
            d3.selectAll(`.${id}`).attr("stroke", "black").attr("stroke-width", 3);
        })
        .on("mouseout", function(d){ div2.style("display", "none");
        let id = "m_" + d.label.replace(/\s/g, "").replace("-","_");
        d3.selectAll(`.${id}`).attr("stroke", "None").attr("stroke-width", 0);})
        .attr("width", barWidth - 1)
        .attr("x", function(d, i){ return i * barWidth + 1 })
        .attr("y", height2)
        .attr("height", 0)
        .transition()
        .delay(function (d, i) { return i*100; })
        .attr("y", function (d, i) { return yChart(d.minTime); })
        .attr("height", function (d) { return height2-yChart(d.minTime); });

    bars.exit().remove();

    bars.transition()
        .duration(750)
        .attr("y", function(d) { return yChart(d.minTime); })
        .attr("height", function(d) { return height2 - yChart(d.minTime); });

    chartMin.select('.y')
        .call(yAxis)

    chartMin.select('.xAxis')
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d){
            return "rotate(-65)";
        });

}

function updateSlowestHistogram(data){
    xChart.domain(data.map(function(d){ return d.category + 'km'; }) );
    yChart.domain( [0, d3.max(data, function(d){ return +d.maxTime; })] );
    var barWidth = width2 / data.length;
    var bars = chartMax.selectAll(".bar").data(data);

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", function(d){
            if(d.gender === "female"){
                return "#FB7F72";
            }else{
                return "#7FB2D4";
            }
        })
        .attr("class", function(d) {
            return d3.select(this).attr("class") + " " +  "m_" + 
            d.label.replace(/\s/g, "").replace("-","_")
        })
        .on("mouseover", function(d){
            div2.style("left", d3.event.pageX+10+"px");
            div2.style("top", d3.event.pageY-25+"px");
            div2.style("display", "inline-block");
            div2.html((d.label)+"<br>Slowest run time: "+(d.maxTime.toHHMMSS()));
            let id = "m_" + d.label.replace(/\s/g, "").replace("-","_");
            console.log(id);
            d3.selectAll(`.${id}`).attr("stroke", "black").attr("stroke-width", 3);
        })
        .on("mouseout", function(d){ div2.style("display", "none");
        let id = "m_" + d.label.replace(/\s/g, "").replace("-","_");
        d3.selectAll(`.${id}`).attr("stroke", "None").attr("stroke-width",0 );})
        .attr("width", barWidth - 1)
        .attr("x", function(d, i){ return i * barWidth + 1 })
        .attr("y", height2)
        .attr("height", 0)
        .transition()
        .delay(function (d, i) { return i*100; })
        .attr("y", function (d, i) { return yChart(d.maxTime); })
        .attr("height", function (d) { return height2-yChart(d.maxTime); });

    bars.exit().remove();

    bars.transition()
        .duration(750)
        .attr("y", function(d) { return yChart(d.maxTime); })
        .attr("height", function(d) { return height2 - yChart(d.maxTime); });

    chartMax.select('.y')
        .call(yAxis)

    chartMax.select('.xAxis')
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d){
            return "rotate(-65)";
        });

}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
