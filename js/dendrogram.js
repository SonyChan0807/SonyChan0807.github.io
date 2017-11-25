updateDendrogram(2017);

function updateDendrogram(value){
  d3.selectAll("svg").remove();

  var width = 1000;
  var height = 800;

  var svg = d3.select("#dendrogram")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

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

  d3.csv("data/marathon-data-with-geo.csv", row, function(error, data) {
      if (error) throw error;
      //console.log(data);
      var categories = ['10','21','42'],
          ages = ['20','30','40'],
          genders = ['-H','-D'];

      var updateData = [{'id':value.toString(),'value':'','color':''}]

      var alldata = crossfilter(data),
          dataByYear = alldata.dimension(function(d) { return d.year; }),
          chooseDataByYear = dataByYear.filter(function(d) { return d == value}),
          chooseDataByYearObject = chooseDataByYear.top(Infinity);

      for (var i = 0; i < categories.length; i++){
        updateData.push({'id':value+'.'+categories[i]+'km','value':'','color':''});

        var yearData = crossfilter(chooseDataByYearObject),
            yearDataByRace = yearData.dimension(function(d) { return d.category; }),
            chooseDataByRace = yearDataByRace.filter(function(d) { return d.startsWith(categories[i])}),
            chooseDataByRaceObject = chooseDataByRace.top(Infinity);

        updateData.push({'id':value+'.'+categories[i]+'km'+'.Age group 20','value':'','color':''});
        updateData.push({'id':value+'.'+categories[i]+'km'+'.Age group 30','value':'','color':''});
        updateData.push({'id':value+'.'+categories[i]+'km'+'.Age group 40','value':'','color':''});
        updateData.push({'id':value+'.'+categories[i]+'km'+'.Other','value':'','color':''});

        for (var j = 0; j < genders.length; j++){
          var raceData = crossfilter(chooseDataByRaceObject),
              raceDataByGender = raceData.dimension(function(d) { return d.category; }),
              chooseDataByGender = raceDataByGender.filter(function(d) { return d.startsWith(categories[i]+genders[j])}),
              chooseDataByGenderObject = chooseDataByGender.top(Infinity);

          var rest = chooseDataByGenderObject.length;

          for (var p = 0; p < ages.length; p++){
            var genderData = crossfilter(chooseDataByGenderObject),
                genderDataByAge = genderData.dimension(function(d) { return d.category; }),
                chooseDataByAge = genderDataByAge.filter(function(d) { return d.endsWith(ages[p])}),
                chooseDataByAgeObject = chooseDataByAge.top(Infinity);
            if (genders[j] == '-H'){
              updateData.push({'id':value+'.'+categories[i]+'km'+'.Age group '+ages[p]+'.M','value':chooseDataByAgeObject.length,'color':'#E54F24'});
            }else{
              updateData.push({'id':value+'.'+categories[i]+'km'+'.Age group '+ages[p]+'.F','value':chooseDataByAgeObject.length,'color':'#0678BE'});
            }
            rest = rest - chooseDataByAgeObject.length
          }

          if (genders[j] == '-H'){
            updateData.push({'id':value+'.'+categories[i]+'km'+'.Other.M','value':rest,'color':'#E54F24'});
          }else{
            updateData.push({'id':value+'.'+categories[i]+'km'+'.Other.F','value':rest,'color':'#0678BE'});
          }
        }
      }
      console.log(updateData);

      var root = stratify(updateData);
      tree(root);

      // Draw every datum a line connecting to its parent.
      var link = g.selectAll(".link") //css
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
      var node = g.selectAll(".node") //css
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
              .attr("height", 25)
              .attr("rx", 2)
              .attr("ry", 2)
              .transition()
                  .duration(800)
                  .attr("width", function (d) {return xScale(d.data.value);});

      leafNodeG.append("text")
              .attr("dy", 19.5)
              .attr("x", 8)
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
                          + xScale(d.data.value) + 90) + ","
                          + (d.x + 1.5) + ")");

          ballGMovement.select("circle")
                  .style("fill", d.data.color)
                  .attr("r", 18);

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
        category: d['catégorie'],
        year: +d['race-year'],
    };
}
