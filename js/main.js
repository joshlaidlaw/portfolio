// Josh Testing
// var videoPreview = document.getElementsByClassName("mobile-video");
// var video = document.getElementById('media-video');

// video.addEventListener("mouseenter", function( event ) {   
//     // highlight the mouseenter target
//     video.play();
//   }, false);

// video.addEventListener("mouseout", function(event) {
//   video.pause();
// }, false);

jQuery(document).ready(function($){

  var swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    paginationClickable: true,
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
        1100: {
            slidesPerView: 3,
            spaceBetween: 30
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 30
        },
        640: {
            slidesPerView: 2,
            spaceBetween: 30
        },
        320: {
            slidesPerView: 2,
            spaceBetween: 15
        }
    }
  });

  var swiperWeb = new Swiper('.swiper-container-web', {
    pagination: '.pagination-web',
    paginationClickable: true,
    spaceBetween: 30,
    preloadImages: true,
    lazyLoading: true
  });

  var swiperNVBC = new Swiper('.swiper-container-nvbc', {
    pagination: '.pagination-nvbc',
    paginationClickable: true,
    spaceBetween: 30,
    slidesPerView: 1
  });

  var swiperAC = new Swiper('.swiper-container-ac', {
    pagination: '.pagination-ac',
    paginationClickable: true,
    spaceBetween: 30,
    slidesPerView: 1
  });

    var swiperHPAC = new Swiper('.swiper-container-hpac', {
    pagination: '.pagination-hpac',
    paginationClickable: true,
    spaceBetween: 30,
    slidesPerView: 1
  });
  
  //check if the .cd-image-container is in the viewport 
  //if yes, animate it
  checkPosition($('.cd-image-container'));
  $(window).on('scroll', function(){
      checkPosition($('.cd-image-container'));
  });
  
  //make the .cd-handle element draggable and modify .cd-resize-img width according to its position
  $('.cd-image-container').each(function(){
      var actual = $(this);
      drags(actual.find('.cd-handle'), actual.find('.cd-resize-img'), actual, actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-image-label[data-type="modified"]'));
  });

  //upadate images label visibility
  $(window).on('resize', function(){
      $('.cd-image-container').each(function(){
          var actual = $(this);
          updateLabel(actual.find('.cd-image-label[data-type="modified"]'), actual.find('.cd-resize-img'), 'left');
          updateLabel(actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-resize-img'), 'right');
      });
  });
});

function checkPosition(container) {
    container.each(function(){
        var actualContainer = $(this);
        if( $(window).scrollTop() + $(window).height()*0.5 > actualContainer.offset().top) {
            actualContainer.addClass('is-visible');
        }
    });
}

//draggable funtionality - credits to http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
function drags(dragElement, resizeElement, container, labelContainer, labelResizeElement) {
    dragElement.on("mousedown vmousedown", function(e) {
        dragElement.addClass('draggable');
        resizeElement.addClass('resizable');

        var dragWidth = dragElement.outerWidth(),
            xPosition = dragElement.offset().left + dragWidth - e.pageX,
            containerOffset = container.offset().left,
            containerWidth = container.outerWidth(),
            minLeft = containerOffset + 10,
            maxLeft = containerOffset + containerWidth - dragWidth - 10;
        
        dragElement.parents().on("mousemove vmousemove", function(e) {
            leftValue = e.pageX + xPosition - dragWidth;
            
            //constrain the draggable element to move inside his container
            if(leftValue < minLeft ) {
                leftValue = minLeft;
            } else if ( leftValue > maxLeft) {
                leftValue = maxLeft;
            }

            widthValue = (leftValue + dragWidth/2 - containerOffset)*100/containerWidth+'%';
            
            $('.draggable').css('left', widthValue).on("mouseup vmouseup", function() {
                $(this).removeClass('draggable');
                resizeElement.removeClass('resizable');
            });

            $('.resizable').css('width', widthValue); 

            updateLabel(labelResizeElement, resizeElement, 'left');
            updateLabel(labelContainer, resizeElement, 'right');
            
        }).on("mouseup vmouseup", function(e){
            dragElement.removeClass('draggable');
            resizeElement.removeClass('resizable');
        });
        e.preventDefault();
    }).on("mouseup vmouseup", function(e) {
        dragElement.removeClass('draggable');
        resizeElement.removeClass('resizable');
    });
}

function updateLabel(label, resizeElement, position) {
    if(position == 'left') {
        ( label.offset().left + label.outerWidth() < resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
    } else {
        ( label.offset().left > resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
    }
}