import { initSwipers } from './swiper-init';
import { initImageCompare } from './image-compare';

function init(): void {
  initSwipers();
  initImageCompare();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
