function checkPosition(e){e.each(function(){var e=$(this);$(window).scrollTop()+.5*$(window).height()>e.offset().top&&e.addClass("is-visible")})}function drags(e,i,a,n,t){e.on("mousedown vmousedown",function(s){e.addClass("draggable"),i.addClass("resizable");var o=e.outerWidth(),l=e.offset().left+o-s.pageX,d=a.offset().left,r=a.outerWidth(),c=d+10,p=d+r-o-10;e.parents().on("mousemove vmousemove",function(e){leftValue=e.pageX+l-o,leftValue<c?leftValue=c:leftValue>p&&(leftValue=p),widthValue=100*(leftValue+o/2-d)/r+"%",$(".draggable").css("left",widthValue).on("mouseup vmouseup",function(){$(this).removeClass("draggable"),i.removeClass("resizable")}),$(".resizable").css("width",widthValue),updateLabel(t,i,"left"),updateLabel(n,i,"right")}).on("mouseup vmouseup",function(){e.removeClass("draggable"),i.removeClass("resizable")}),s.preventDefault()}).on("mouseup vmouseup",function(){e.removeClass("draggable"),i.removeClass("resizable")})}function updateLabel(e,i,a){"left"==a?e.offset().left+e.outerWidth()<i.offset().left+i.outerWidth()?e.removeClass("is-hidden"):e.addClass("is-hidden"):e.offset().left>i.offset().left+i.outerWidth()?e.removeClass("is-hidden"):e.addClass("is-hidden")}function checkPosition(e){e.each(function(){var e=$(this);$(window).scrollTop()+.5*$(window).height()>e.offset().top&&e.addClass("is-visible")})}function drags(e,i,a,n,t){e.on("mousedown vmousedown",function(s){e.addClass("draggable"),i.addClass("resizable");var o=e.outerWidth(),l=e.offset().left+o-s.pageX,d=a.offset().left,r=a.outerWidth(),c=d+10,p=d+r-o-10;e.parents().on("mousemove vmousemove",function(e){leftValue=e.pageX+l-o,leftValue<c?leftValue=c:leftValue>p&&(leftValue=p),widthValue=100*(leftValue+o/2-d)/r+"%",$(".draggable").css("left",widthValue).on("mouseup vmouseup",function(){$(this).removeClass("draggable"),i.removeClass("resizable")}),$(".resizable").css("width",widthValue),updateLabel(t,i,"left"),updateLabel(n,i,"right")}).on("mouseup vmouseup",function(){e.removeClass("draggable"),i.removeClass("resizable")}),s.preventDefault()}).on("mouseup vmouseup",function(){e.removeClass("draggable"),i.removeClass("resizable")})}function updateLabel(e,i,a){"left"==a?e.offset().left+e.outerWidth()<i.offset().left+i.outerWidth()?e.removeClass("is-hidden"):e.addClass("is-hidden"):e.offset().left>i.offset().left+i.outerWidth()?e.removeClass("is-hidden"):e.addClass("is-hidden")}jQuery(document).ready(function(e){new Swiper(".swiper-container",{pagination:".swiper-pagination",paginationClickable:!0,slidesPerView:3,spaceBetween:30,breakpoints:{1100:{slidesPerView:3,spaceBetween:30},768:{slidesPerView:2,spaceBetween:30},640:{slidesPerView:2,spaceBetween:30},320:{slidesPerView:2,spaceBetween:15}}}),new Swiper(".swiper-container-web",{pagination:".pagination-web",paginationClickable:!0,spaceBetween:30,preloadImages:!0,lazyLoading:!0}),new Swiper(".swiper-container-nvbc",{pagination:".pagination-nvbc",paginationClickable:!0,spaceBetween:30,slidesPerView:1}),new Swiper(".swiper-container-ac",{pagination:".pagination-ac",paginationClickable:!0,spaceBetween:30,slidesPerView:1}),new Swiper(".swiper-container-hpac",{pagination:".pagination-hpac",paginationClickable:!0,spaceBetween:30,slidesPerView:1}),checkPosition(e(".cd-image-container")),e(window).on("scroll",function(){checkPosition(e(".cd-image-container"))}),e(".cd-image-container").each(function(){var i=e(this);drags(i.find(".cd-handle"),i.find(".cd-resize-img"),i,i.find('.cd-image-label[data-type="original"]'),i.find('.cd-image-label[data-type="modified"]'))}),e(window).on("resize",function(){e(".cd-image-container").each(function(){var i=e(this);updateLabel(i.find('.cd-image-label[data-type="modified"]'),i.find(".cd-resize-img"),"left"),updateLabel(i.find('.cd-image-label[data-type="original"]'),i.find(".cd-resize-img"),"right")})})}),jQuery(document).ready(function(e){new Swiper(".swiper-container",{pagination:".swiper-pagination",paginationClickable:!0,slidesPerView:3,spaceBetween:30,breakpoints:{1100:{slidesPerView:3,spaceBetween:30},768:{slidesPerView:2,spaceBetween:30},640:{slidesPerView:2,spaceBetween:30},320:{slidesPerView:2,spaceBetween:15}}}),new Swiper(".swiper-container-web",{pagination:".pagination-web",paginationClickable:!0,spaceBetween:30,preloadImages:!0,lazyLoading:!0}),new Swiper(".swiper-container-nvbc",{pagination:".pagination-nvbc",paginationClickable:!0,spaceBetween:30,slidesPerView:1}),new Swiper(".swiper-container-ac",{pagination:".pagination-ac",paginationClickable:!0,spaceBetween:30,slidesPerView:1}),new Swiper(".swiper-container-hpac",{pagination:".pagination-hpac",paginationClickable:!0,spaceBetween:30,slidesPerView:1});checkPosition(e(".cd-image-container")),e(window).on("scroll",function(){checkPosition(e(".cd-image-container"))}),e(".cd-image-container").each(function(){var i=e(this);drags(i.find(".cd-handle"),i.find(".cd-resize-img"),i,i.find('.cd-image-label[data-type="original"]'),i.find('.cd-image-label[data-type="modified"]'))}),e(window).on("resize",function(){e(".cd-image-container").each(function(){var i=e(this);updateLabel(i.find('.cd-image-label[data-type="modified"]'),i.find(".cd-resize-img"),"left"),updateLabel(i.find('.cd-image-label[data-type="original"]'),i.find(".cd-resize-img"),"right")})})});