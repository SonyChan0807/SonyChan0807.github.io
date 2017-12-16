/* jshint esversion: 6 */


// Load navigation into page
$(document).ready(function() {
    $('#mainNav').load('navigation.html');
    $('#mainNav').addClass('navbar navbar-expand-lg navbar-dark bg-dark fixed-top');
    $('#showMore').click( function() {
      let status = $(this).attr('status')
      if (status === "off") {
        $('#info').show();
        $(this).text("Hide Tutorial").attr('class','btn btn-danger btn-sm').attr('status', 'on')
      }else if (status === "on"){
        $('#info').hide();
        $(this).text("Show Tutorial").attr('class', 'btn btn-primary btn-sm').attr('status', 'off')
      }
    });
    $('.hideMore').click(function(){
      $('#info').hide();
    })
});

sliderYears = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

// Year slider
let yearSlider = new Slider("#year-slider", {
  ticks: sliderYears,
  ticks_labels: sliderYears
});

