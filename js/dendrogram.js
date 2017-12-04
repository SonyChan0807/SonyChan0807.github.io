console.log(d3.schemeCategory20b);
// Year slider
var mySlider = new Slider("#ex21", {
  ticks:[2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
  ticks_labels:[2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
});

mySlider.on('change', function(){
  var value = mySlider.getValue();
  updateDendrogram(value);
});

updateDendrogram(2017);

d3.selectAll("svg").remove();
var margin = {top: 0, right: 10, bottom: 0, left: 50};
var width = 1000;
var height = 500;

var svg = d3.select("#dendrogram")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g").attr("transform", "translate(20,0)");

var xScale =  d3.scaleLinear()
                .domain([0,1200])
                .range([0,600]);

var tree = d3.cluster()
             .size([height, width - 600])
             .separation(function separate(a, b) {
                  return a.parent == b.parent
                  || a.parent.parent == b.parent
                  || a.parent == b.parent.parent ? 2 : 3;
              });

var stratify = d3.stratify()
                 .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

function updateDendrogram(value){

  d3.csv("data/marathon_data.csv", row, function(error, data) {
      if (error) throw error;
      //console.log(data);
      var categories = [10,21,42],
          age_groups = ['20-30','30-40','40-50','other'],
          genders = ['male','female'];

      var updateData = [{'id':value.toString(),'value':'','color':''}]

      var alldata = crossfilter(data),
          dataByYear = alldata.dimension(function(d) { return d.year; }),
          chooseDataByYear = dataByYear.filter(function(d) { return d == value}),
          chooseDataByYearObject = chooseDataByYear.top(Infinity);

      for (var i = 0; i < categories.length; i++){
        updateData.push({'id':value+'.'+categories[i]+' km','value':'','color':''});

        var yearData = crossfilter(chooseDataByYearObject),
            yearDataByRace = yearData.dimension(function(d) { return d.category; }),
            chooseDataByRace = yearDataByRace.filter(function(d) { return d == categories[i]; }),
            chooseDataByRaceObject = chooseDataByRace.top(Infinity);

        updateData.push({'id':value+'.'+categories[i]+' km'+'.Age group 20-30','value':'','color':''});
        updateData.push({'id':value+'.'+categories[i]+' km'+'.Age group 30-40','value':'','color':''});
        updateData.push({'id':value+'.'+categories[i]+' km'+'.Age group 40-50','value':'','color':''});
        updateData.push({'id':value+'.'+categories[i]+' km'+'.Age group other','value':'','color':''});

        for (var j = 0; j < genders.length; j++){
          var raceData = crossfilter(chooseDataByRaceObject),
              raceDataByGender = raceData.dimension(function(d) { return d.gender; }),
              chooseDataByGender = raceDataByGender.filter(function(d) { return d == genders[j]; }),
              chooseDataByGenderObject = chooseDataByGender.top(Infinity);

          //var rest = chooseDataByGenderObject.length;

          for (var p = 0; p < age_groups.length; p++){
            var genderData = crossfilter(chooseDataByGenderObject),
                genderDataByAge = genderData.dimension(function(d) { return d.age_group; }),
                chooseDataByAge = genderDataByAge.filter(function(d) { return d == age_groups[p]; }),
                chooseDataByAgeObject = chooseDataByAge.top(Infinity);
            if (genders[j] == 'male'){
              updateData.push({'id':value+'.'+categories[i]+' km'+'.Age group '+age_groups[p]+'.M','value':chooseDataByAgeObject.length,'color':'#b5cf6b'});
            }else{
              updateData.push({'id':value+'.'+categories[i]+' km'+'.Age group '+age_groups[p]+'.F','value':chooseDataByAgeObject.length,'color':'#d6616b'});
            }
          }
        }
      }
      console.log(updateData);

      var root = stratify(updateData);
      tree(root);

      d3.selectAll(".link").remove();
      d3.selectAll(".node").remove();
      d3.selectAll(".ballG").remove();

      // Draw every datum a line connecting to its parent.
      var link = g.selectAll(".link")
                  .data(root.descendants().slice(1))
                  .enter().append("path")
                  .attr("class", "link")
                  .attr("d", function(d) {
                      return "M" + d.y + "," + d.x
                              + "C" + (d.parent.y + 100) + "," + d.x
                              + " " + (d.parent.y + 100) + "," + d.parent.x
                              + " " + d.parent.y + "," + d.parent.x;
                  });

      // Setup position for every datum; Applying different css classes to parents and leafs.
      var node = g.selectAll(".node")
                  .data(root.descendants())
                  .enter().append("g")
                  .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); }) //css
                  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      // Draw every datum a small circle.
      node.append("circle")
          .attr("r", 4);

      // Setup G for every leaf datum.
      var leafNodeG = g.selectAll(".node--leaf")
                       .append("g")
                       .attr("class", "node--leaf-g")
                       .attr("transform", "translate(" + 8 + "," + -13 + ")");

      leafNodeG.append("rect")
              .attr("class","shadow")
              .style("fill", function (d) {return d.data.color;})
              .attr("width", 2)
              .attr("height", 15)
              .attr("rx", 2)
              .attr("ry", 2)
              .transition()
                  .duration(800)
                  .attr("width", function (d) {return xScale(d.data.value);});

      leafNodeG.append("text")
              .attr("dy", 12)
              .attr("x", 5)
              .style("text-anchor", "start")
              .text(function (d) {
                  return d.data.id.substring(d.data.id.lastIndexOf(".") + 1); //the last part after .
              });

      // Write down text for every parent datum
      var internalNode = g.selectAll(".node--internal");
      internalNode.append("text")
              .attr("y", -10)
              .style("text-anchor", "middle")
              .text(function (d) {
                  return d.data.id.substring(d.data.id.lastIndexOf(".") + 1);
              });

      // The moving ball
      var ballG = svg.insert("g")
              .attr("class","ballG")
              .attr("transform", "translate(" + 1100 + "," + height/2 + ")");
      ballG.insert("circle")
              .attr("class","shadow")
              .style("fill","steelblue")
              .attr("r", 4);
      ballG.insert("text")
              .style("text-anchor", "middle")
              .attr("dy",4)
              .text("0.0");

      // Animation functions for mouse on and off events.
      d3.selectAll(".node--leaf-g")
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut);

      function handleMouseOver(d) {
          var leafG = d3.select(this);

          leafG.select("rect")
                  .attr("stroke","#4D4D4D")
                  .attr("stroke-width","2");


          var ballGMovement = ballG.transition()
                  .duration(400)
                  .attr("transform", "translate(" + (d.y
                          + xScale(d.data.value) + 80) + ","
                          + (d.x + 1) + ")");

          ballGMovement.select("circle")
                  .style("fill", d.data.color)
                  .attr("r", 16);

          ballGMovement.select("text")
                  .delay(300)
                  .text(Number(d.data.value).toFixed(1));
      }
      function handleMouseOut() {
          var leafG = d3.select(this);

          leafG.select("rect")
                  .attr("stroke-width","0");
      }
  });
}

function row(d) {
  return {
      category: +d['category'],
      gender: d['gender'],
      year: +d['race year'],
      age_group: d['age group']
  };
}
