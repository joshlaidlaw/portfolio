// Main entry point for portfolio site
import { initSwipers } from './swiper-init.js';
import { initImageCompare } from './image-compare.js';

// Initialize all functionality when DOM is ready
function init() {
  initSwipers();
  initImageCompare();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}
