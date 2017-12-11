/* jshint esversion: 6 */

// Load navigation into page
$(document).ready(function() {
    $('#mainNav').load('navigation.html');
    $('#mainNav').addClass('navbar navbar-expand-lg navbar-dark bg-dark fixed-top');
});

sliderYears = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

// Year slider
let yearSlider = new Slider("#year-slider", {
  ticks: sliderYears,
  ticks_labels: sliderYears
});
