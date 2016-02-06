console.log("main.js");

var swiper = new Swiper('.swiper-container', {
  pagination: '.swiper-pagination',
  paginationClickable: true,
  slidesPerView: 4,
  spaceBetween: 30,
  breakpoints: {
      1100: {
          slidesPerView: 3,
          spaceBetween: 30
      },
      768: {
          slidesPerView: 4,
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