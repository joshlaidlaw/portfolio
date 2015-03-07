/*===========================
Swiper AMD Export
===========================*/
if (typeof(module) !== 'undefined')
{
    module.exports = Swiper;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return Swiper;
    });
}

var mySwiper = new Swiper ('.swiper-container', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
  openPos: "relative",
  pagination: '.swiper-pagination',
  paginationClickable: true,
  
})     

var nav = responsiveNav(".nav-collapse");

$( '#stickyNav' ).fixedsticky();

