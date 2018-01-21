var verticalDivide;
var horizontalDivide;
var transitionDuration = '.6s ease all';

window.whichTransitionEvent = function whichTransitionEvent() {
  var t,
    el = document.createElement("fakeelement");

  var transitions = {
    "transition": "transitionend",
    "OTransition": "oTransitionEnd",
    "MozTransition": "transitionend",
    "WebkitTransition": "webkitTransitionEnd"
  }

  for (t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
}
var transitionEvent = whichTransitionEvent();

$(document).ready(function () {
  // Read initial vertical and horizontal divider position from CSS
  verticalDivide = getCssHeight('#single-image-container');
  horizontalDivide = getCssWidth('#single-image-container');

  // Setup event listeners
  $('.toggle-nav').click(function () { //Toggle the side bar menu on-off
    toggleNav();
  });

  $('.pane-button').prop('checked', false); //Each pane has a button to show/hide
  $('.pane-button').click(function () {
    togglePane();
  });
  togglePane();

  $('.pane-menu img').click(function (event) { //Each pane has a fullscreen toggle
    fullScreenToggle(event);
  });

  $('#vertical-divider').mousedown(function () { //Listener for drag on vertical-divider
    $('#editing-panes').mousemove(function (event) { //Resize panes on mousemove
      resizeHight(event);
    });
    $('#editing-panes').mouseup(function () { //Remove listeners on mouseup
      $('#editing-panes').off('mousemove');
      $('#editing-panes').off('mouseup');
    });
  });

  $('#horizontal-divider').mousedown(function () { //Listener for drag on vertical-divider
    $('#editing-panes').mousemove(function (event) { //Resize panes on mousemove
      resizeWidth(event);
    });
    $('#editing-panes').mouseup(function () { //Remove listeners on mouseup
      $('#editing-panes').off('mousemove');
      $('#editing-panes').off('mouseup');
    });
  });
});

//Function to hide/show side menu
window.toggleNav = function toggleNav() {
  $('#show-menu').toggleClass("is-active");
  if ($('#site').css('margin-left') == '-300px') {
    $('#site').css('margin-left', '0');
  } else {
    $('#site').css('margin-left', '-300px');
  }
}

//Close side menu when esc is pressed
$(document).keyup(function (e) {
  if (e.keyCode == 27) {
    if ($('#site').css('margin-left') == '0px') {
      $('#show-menu').toggleClass("is-active");
      $('#site').css('margin-left', '-300px');
    }
  }
});

// Function to handle logic of various panel configurations (any combination of
// panes can be hidden or shown).
window.togglePane = function togglePane() {
  $('.main-container').css('transition', transitionDuration); //Set transition duration and type
  $('.pane-menu img').attr('src', 'resources/images/Fullscreen.png'); //Reset fullscreen icon and 'alt'
  $('.pane-menu img').attr('alt', 'Full Screen');

  var upperPanels = true;  //Assume the single-image and/or signs panel are visible

  if ($('#single-image-button').prop('checked') &&
    $('#signs-button').prop('checked')) {
    $('#single-image-container').css('width', horizontalDivide + '%');
    $('#signs-container').css('width', (100 - horizontalDivide) + '%');
    $('#signs-container').css('margin-left', horizontalDivide + '%');
  }
  else if (!$('#single-image-button').prop('checked') &&
    $('#signs-button').prop('checked')) {
    $('#single-image-container').css('width', '0');
    $('#signs-container').css('width', '100%');
    $('#signs-container').css('margin-left', '0');
  }
  else if ($('#single-image-button').prop('checked') &&
    !$('#signs-button').prop('checked')) {
    $('#single-image-container').css('width', '100%');
    $('#signs-container').css('width', '0');
    $('#signs-container').css('margin-left', '100%');
  }
  else if (!$('#single-image-button').prop('checked') &&
    !$('#signs-button').prop('checked')) {
    $('#single-image-container').css('width', '0');
    $('#signs-container').css('width', '0');
    $('#signs-container').css('margin-left', '100%');
    upperPanels = false; //Neither single-image nor signs panel is visible
  }

  if ($('#combination-button').prop('checked')) {
    if (upperPanels) {
      $('#single-image-container').css('height', verticalDivide + '%');
      $('#signs-container').css('height', verticalDivide + '%');
      $('#combination-container').css('height', (100 - verticalDivide) + '%');
    } else {
      $('#single-image-container').css('height', '0');
      $('#signs-container').css('height', '0');
      $('#combination-container').css('height', '100%');
    }
  } else {
    if (upperPanels) {
      $('#single-image-container').css('height', '100%');
      $('#signs-container').css('height', '100%');
      $('#combination-container').css('height', '0');
    } else {
      $('#single-image-container').css('height', '0');
      $('#signs-container').css('height', '0');
      $('#combination-container').css('height', '0');
    }
  }

  //Set transition duration back to none
  $('.main-container').one(transitionEvent,
    function (event) {
      $('.main-container').css('transition', 'none');
    });
}

//Function to set one panel to fullscreen
window.fullScreenToggle = function fullScreenToggle(event) {
  $('.main-container').css('transition', transitionDuration);//Set transition duration and type

  //This routine calls the function fullScreen(event) and passes the event
  //fullScreen(event) will find the triggereing element's parent container,
  //and set that to fullscreen.
  if ($(event.target).attr('alt') == 'Full Screen') {
    fullScreenPane(event);
    $(event.target).attr('src', 'resources/images/Close_Fullscreen.png')
    $(event.target).attr('alt', 'resize');
  } else {
    resizePanels('horizontal');
    resizePanels('vertical');
    $(event.target).attr('src', 'resources/images/Fullscreen.png')
    $(event.target).attr('alt', 'Full Screen');
  }

  //Set transition duration back to none
  $('.main-container').one(transitionEvent,
    function (event) {
      $('.main-container').css('transition', 'none');
    });
}

//Function to set the pane containing the triggering event to full screen.
window.fullScreenPane = function fullScreenPane(event) {
  var container = $(event.target).parent().parent().attr('id');
  if (container == 'single-image-container') { //Set single-image-container to fullscreen
    $('#single-image-container').css('width', '100%');
    $('#signs-container').css('width', '0');
    $('#signs-container').css('margin-left', '100%');
    $('#single-image-container').css('height', '100%');
    $('#signs-container').css('height', '100%');
    $('#combination-container').css('height', '0');
  } else if (container == 'signs-container') { //Set signs-container to fullscreen
    $('#single-image-container').css('width', '0');
    $('#signs-container').css('width', '100%');
    $('#signs-container').css('margin-left', '0');
    $('#signs-container').css('height', '100%');
    $('#single-image-container').css('height', '100%');
    $('#combination-container').css('height', '0');
  } else if (container == 'combination-container') { //Set combination-container to fullscreen
    $('#single-image-container').css('height', '0');
    $('#signs-container').css('height', '0');
    $('#combination-container').css('height', '100%');
  }
}

//Function for getting the width of an element in percent of its parent
window.getCssWidth = function getCssWidth(childSelector) {
  return 100 * $(childSelector).width() / $(childSelector).offsetParent().width();
}

//Function for getting the height of an element in percent of its parent
window.getCssHeight = function getCssHeight(childSelector) {
  return 100 * $(childSelector).height() / $(childSelector).offsetParent().height();
}

//Adjust panels to conform to a change in the vertical divider
window.resizeHight = function resizeHight(event) {
  verticalDivide = 100 * (event.clientY / $('#editing-panes').height());
  resizePanels('vertical')
}

//Adjust panels to conform to a change in the horizontal divider
window.resizeWidth = function resizeWidth(event) {
  horizontalDivide = 100 * ((event.clientX - $('#editing-panes').offset().left) / $('#editing-panes').width());
  resizePanels('horizontal')
}

//Set panels back to the last stored values on either the vertical or horizontal axis
window.resizePanels = function resizePanels(axis) {
  if (axis == 'horizontal') {
    if (horizontalDivide > 5 && horizontalDivide < 95) {
      $('#single-image-container').css('width', horizontalDivide + '%');
      $('#signs-container').css('width', (100 - horizontalDivide) + '%');
      $('#signs-container').css('margin-left', horizontalDivide + '%');
    }
  }
  if (axis == 'vertical') {
    if (verticalDivide > 5 && verticalDivide < 95) {
      $('#single-image-container').css('height', verticalDivide + '%');
      $('#signs-container').css('height', verticalDivide + '%');
      $('#combination-container').css('height', (100 - verticalDivide) + '%');
    }
  }
}
