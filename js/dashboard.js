// Initial call
changeChart(2017,true);

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
          chooseDataByGenderObject.forEach(function(element){
            var timeParts = element.time.split(":");
            var secParts = timeParts[2].split(".");
            var secs = Number(timeParts[0]) * 3600 + Number(timeParts[1]) * 60 + Number(secParts[0]);
            totalTime += secs;
          })

          updateData.push({'label':categories[i]+'km - '+gender[j],'category':categories[i].toString(),'gender':gender[j],'value':chooseDataByGenderObject.length,'avgTime':(totalTime/chooseDataByGenderObject.length).toFixed(2)});
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
      updateHistogram(updateData);
      updatePiechart(updateData);
      if(first){
        updatePiechart(updateData);
      }
  });
}

// Pie chart
var margin = {top: 2, right: 2, bottom: 2, left: 2};
var width = 450;
var height = 340;
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

function updatePiechart(data) {
  var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label });

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
        .attr("class", "slice");

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
        .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((d.data.label)+"<br>"+(d.data.value)+"%");
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
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

};

// Histogram
var margin2 = {top: 20, right: 20, bottom: 80, left: 70};
var width2 = 350;
var height2 = 240;
var div2 = d3.select("body").append("div").attr("class", "toolTip");

var chart = d3.select("#histogram")
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

chart.append("g")
    .attr("class", "y axis")
    .call(yAxis)

chart.append("g")
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

chart
  .append("text")
  .attr("transform", "translate(-60," +  (height2+margin2.bottom)/2 + ") rotate(-90)")
  .text("Average race time (sec)");

chart
  .append("text")
  .attr("transform", "translate(" + ((width2/2) - 40) + "," + (height2 + margin2.bottom - 20) + ")")
  .text("Race category");

function updateHistogram(data){
  xChart.domain(data.map(function(d){ return d.category + 'km'; }) );
  yChart.domain( [0, d3.max(data, function(d){ return +d.avgTime; })] );
  var barWidth = width2 / data.length;
  var bars = chart.selectAll(".bar").data(data);

  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", function(d){
      if(d.gender === "female"){
        return "#dbdb8d";
      }else{
        return "#9edae5";
      }
    })
    .on("mousemove", function(d){
            div2.style("left", d3.event.pageX+10+"px");
            div2.style("top", d3.event.pageY-25+"px");
            div2.style("display", "inline-block");
            div2.html((d.label)+"<br>Avg race time: "+(d.avgTime.toHHMMSS()));
    })
    .on("mouseout", function(d){ div2.style("display", "none");})
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

  chart.select('.y')
      .call(yAxis)

  chart.select('.xAxis')
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
