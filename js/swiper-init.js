// Swiper initialization for modern Swiper v11
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

// Initialize Swiper instances
export function initSwipers() {
  // Main swiper with responsive breakpoints
  const swiperContainer = document.querySelector('.swiper-container');
  if (swiperContainer) {
    new Swiper(swiperContainer, {
      modules: [Pagination],
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      slidesPerView: 3,
      spaceBetween: 30,
      breakpoints: {
        1100: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        320: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
      },
    });
  }

  // Web swiper
  const swiperWeb = document.querySelector('.swiper-container-web');
  if (swiperWeb) {
    new Swiper(swiperWeb, {
      modules: [Pagination],
      pagination: {
        el: '.pagination-web',
        clickable: true,
      },
      spaceBetween: 30,
    });
  }

  // NVBC swiper
  const swiperNVBC = document.querySelector('.swiper-container-nvbc');
  if (swiperNVBC) {
    new Swiper(swiperNVBC, {
      modules: [Pagination],
      pagination: {
        el: '.pagination-nvbc',
        clickable: true,
      },
      spaceBetween: 30,
      slidesPerView: 1,
    });
  }

  // AC swiper
  const swiperAC = document.querySelector('.swiper-container-ac');
  if (swiperAC) {
    new Swiper(swiperAC, {
      modules: [Pagination],
      pagination: {
        el: '.pagination-ac',
        clickable: true,
      },
      spaceBetween: 30,
      slidesPerView: 1,
    });
  }

  // HPAC swiper
  const swiperHPAC = document.querySelector('.swiper-container-hpac');
  if (swiperHPAC) {
    new Swiper(swiperHPAC, {
      modules: [Pagination],
      pagination: {
        el: '.pagination-hpac',
        clickable: true,
      },
      spaceBetween: 30,
      slidesPerView: 1,
    });
  }
}

