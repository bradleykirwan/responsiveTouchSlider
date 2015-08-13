/**************************************************
jQuery Touch Slider v1.0
Author: Bradley Kirwan
Date: 20/09/2013
**************************************************/


(function($) {
  $.fn.touchSlider = function(options) {

  	var defaults = {
  		minSwipe: 0.3,
  		directionNav: false
  	};

  	var options = $.extend(defaults, options);
  	var mobile  = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

    $(this).each(function() {
    	$(this).wrapInner('<div class="touch-slider-viewport" />'); // Element has overflow:hidden styling to hide slide reel beyond viewport

    	function calculateDirection(startX, startY, curX, curY) {

			var x = startX - curX;
			var y = curY - startY;
			var r = Math.atan2(y, x); //radians
			var angle = Math.round(r * 180 / Math.PI); //degrees

			//ensure value is positive
			if (angle < 0) {
				angle = 360 - Math.abs(angle);
			}

			if ((angle <= 45) && (angle >= 0)) {
				return "LEFT";
			} else if ((angle <= 360) && (angle >= 315)) {
				return "LEFT";
			} else if ((angle >= 135) && (angle <= 225)) {
				return "RIGHT";
			} else if ((angle > 45) && (angle < 135)) {
				return "DOWN";
			} else {
				return "UP";
			}
		};

		function slide(position, duration) {
			/*if (duration==0){reel.css('left', position + 'px')} else {reel.animate({'left' : position + 'px'}, 1000*duration)}*/
			reel.css({
				'-webkit-transition':duration+'s',
				'-moz-transition':duration+'s',
				'transition':duration+'s'
			});
			reel.css({
				'-webkit-transform':'translate3d(' + position + 'px, 0, 0)',
				'-moz-transform':'translate3d(' + position + 'px, 0, 0)',
				'transform':'translate3d(' + position + 'px, 0, 0)'
			});
		}

		function updateMenu(currentSlide) {
			$('li.select', slider).removeClass();
			$('li:nth-child(' + currentSlide + ')', slider).addClass('select');		

			$('.touch-slider-menu a.select', slider).removeClass();
			$('.touch-slider-menu a:nth-child(' + currentSlide + ')', slider).addClass('select');

			$('.touch-slider-left', slider).show();
		}

		$('img', slider).mousedown(function(e) {
			e.preventDefault(); // Prevents dragging of images in desktop browsers
		})

    	// Declaring global variables
		var isSliding = false;
	  	var startX;
	  	var curX;
	  	var deltaX;
	  	var startY;
	  	var curY;
	  	var slider = $(this);
	  	var reel = $('ul', slider);
	  	var slideWidth = $('.touch-slider-viewport', slider).width();
	  	var currentSlide;
	  	var numberSlides = $('li', slider).length;
	  	var direction;

	  	// Initial housekeeping
	  	$('li', slider).width(slideWidth); // Sets the width of each slide appropriately
	  	reel.width('99999'); // Sets the slide width really huge
		if ($('li.select', slider).length !== 1) { // Set first side appropriately
			$('li.select', slider).removeClass();
			$('li:nth-child(1)', slider).addClass('select');
		}
		currentSlide = $('li.select', slider).index()+1; // Get the current slide as a non-zero based index

		// Add Menu
		slider.append('<div class="touch-slider-menu" />');
		$('li', slider).each(function() {
			$('.touch-slider-menu', slider).append('<a href="#" />');
		});
		$('.touch-slider-menu a:nth-child(' + currentSlide + ')', slider).addClass('select'); // Add select class to active slide menu link(button)
		slide((currentSlide-1)*(-slideWidth), 0);

		// Add direction nav (left/right)
		if (options.directionNav) {
			$('.touch-slider-viewport', slider).append('<a href="#" class="touch-slider-left">left</a>').append('<a href="#" class="touch-slider-right">right</a>');
			if (currentSlide==1) { $('.touch-slider-left', slider).hide() }
			if (currentSlide==numberSlides) { $('.touch-slider-right', slider).hide() }
		}

	  	// Responsiveness
	  	$(window).resize(function() {
			slideWidth = $('.touch-slider-viewport', slider).width();
			$('li', slider).width(slideWidth);
			slide((currentSlide-1)*(-slideWidth), 0);
			console.log('resizing')
	  	})

		// Touchstart/Mousedown event
		reel.bind(mobile ? 'touchstart' : 'mousedown', function(e){
			isSliding = true;
			e=e.originalEvent;

			// Get initial touch data
			if (e.targetTouches) { // Check if on a touch device
				startX = e.targetTouches[0].pageX;
				startY = e.targetTouches[0].pageY;
			} else {
				startX = e.pageX;
				startY = e.pageY;
			}
		});

		// Touchmove/Mousemove event
		reel.bind(mobile ? 'touchmove' : 'mousemove', function(e){
			e=e.originalEvent;

			if (isSliding) { // Only move if they are already touching (prevents slider moving when user simpyly moves cursor over without holding down)
				if (e.targetTouches) {
					curX = e.targetTouches[0].pageX;
					curY = e.targetTouches[0].pageY;
				} else {
					curX = e.pageX;
					curY = e.pageY;
					e.preventDefault();
				}

				deltaX = curX - startX; // See how far user has dragged/swiped

				if ((currentSlide==numberSlides) && (deltaX<0) || (currentSlide==1) && (deltaX>0)) {deltaX *= 0.2} // If on the first/last slide, slow down sliding beyond slide reel
				slide((currentSlide-1)*(-slideWidth) + deltaX, 0); // Update current position

				direction = calculateDirection(startX, startY, curX, curY);
				
				if ((direction == 'LEFT') || (direction == 'RIGHT')) {
					e.preventDefault(); // Prevent scrolling action if sliding
				} else {
					slide((currentSlide-1)*(-slideWidth), 0.1);
					isSliding = false;
				}
			}
		});

		// Touchend/Mouseup event
		reel.bind(mobile ? 'touchend touchleave' : 'mouseup mouseleave', function(e){
			if ((deltaX/slideWidth) <= -options.minSwipe) {
				// Go to next slide
				currentSlide += 1;
				if (currentSlide>numberSlides) { currentSlide = numberSlides; }
			} else if ((deltaX/slideWidth) >= options.minSwipe) {
				// Go to previous slide
				currentSlide -= 1;
				if (currentSlide<1) { currentSlide = 1; }
			}

			slide((currentSlide-1)*(-slideWidth), 0.5);
			updateMenu(currentSlide);

			isSliding = false;
			deltaX=0;
		});

		$('.touch-slider-menu a', slider).click(function() {
			currentSlide = $(this).index()+1;
			updateMenu(currentSlide)
			slide((currentSlide-1)*(-slideWidth), 0.5);
			return false
		})

		$('.touch-slider-left', slider).click(function() {
			currentSlide -= 1;
			updateMenu(currentSlide);
			slide((currentSlide-1)*(-slideWidth), 0.5);
			return false;
		})

		$('.touch-slider-right', slider).click(function() {
			currentSlide += 1;
			updateMenu(currentSlide);
			slide((currentSlide-1)*(-slideWidth), 0.5);
			return false;
		})

    })
  };
})(jQuery);