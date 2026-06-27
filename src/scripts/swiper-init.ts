import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

type SwiperConfig = ConstructorParameters<typeof Swiper>[1];

const setups: Array<{ selector: string; config: SwiperConfig }> = [
  {
    selector: '.swiper-container',
    config: {
      modules: [Pagination],
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      slidesPerView: 3,
      spaceBetween: 30,
      breakpoints: {
        1100: { slidesPerView: 3, spaceBetween: 30 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        640: { slidesPerView: 2, spaceBetween: 30 },
        320: { slidesPerView: 2, spaceBetween: 15 },
      },
    },
  },
  {
    selector: '.swiper-container-web',
    config: {
      modules: [Pagination],
      pagination: {
        el: '.pagination-web',
        clickable: true,
      },
      spaceBetween: 30,
    },
  },
  {
    selector: '.swiper-container-nvbc',
    config: {
      modules: [Pagination],
      pagination: {
        el: '.pagination-nvbc',
        clickable: true,
      },
      spaceBetween: 30,
      slidesPerView: 1,
    },
  },
  {
    selector: '.swiper-container-ac',
    config: {
      modules: [Pagination],
      pagination: {
        el: '.pagination-ac',
        clickable: true,
      },
      spaceBetween: 30,
      slidesPerView: 1,
    },
  },
  {
    selector: '.swiper-container-hpac',
    config: {
      modules: [Pagination],
      pagination: {
        el: '.pagination-hpac',
        clickable: true,
      },
      spaceBetween: 30,
      slidesPerView: 1,
    },
  },
];

export function initSwipers(): void {
  setups.forEach(({ selector, config }) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      new Swiper(element, config);
    }
  });
}
