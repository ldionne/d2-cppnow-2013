$(function() {
  function fullscreen() {
    $('#preso').css({
      height: $(window).height()
    });
    $('#preso .slide').css({
      height: $(window).height()
    });
  }

  $("#preso").bind("showoff:show", function (event) {
    fullscreen();
  });

  $(window).resize(function() {
    fullscreen();
  });

  fullscreen();
});
