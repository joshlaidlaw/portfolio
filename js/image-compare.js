// Image comparison slider functionality (vanilla JS)
// Credits: http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/

export function initImageCompare() {
  const containers = document.querySelectorAll('.cd-image-container');
  
  if (containers.length === 0) {
    return;
  }

  // Check if containers are in viewport and animate
  checkPosition(containers);
  window.addEventListener('scroll', () => {
    checkPosition(containers);
  });

  // Make each handle draggable
  containers.forEach((container) => {
    const handle = container.querySelector('.cd-handle');
    const resizeImg = container.querySelector('.cd-resize-img');
    const labelContainer = container.querySelector('.cd-image-label[data-type="original"]');
    const labelResizeElement = container.querySelector('.cd-image-label[data-type="modified"]');

    if (handle && resizeImg) {
      drags(handle, resizeImg, container, labelContainer, labelResizeElement);
    }
  });

  // Update label visibility on resize
  window.addEventListener('resize', () => {
    containers.forEach((container) => {
      const resizeImg = container.querySelector('.cd-resize-img');
      const labelModified = container.querySelector('.cd-image-label[data-type="modified"]');
      const labelOriginal = container.querySelector('.cd-image-label[data-type="original"]');

      if (resizeImg && labelModified) {
        updateLabel(labelModified, resizeImg, 'left');
      }
      if (resizeImg && labelOriginal) {
        updateLabel(labelOriginal, resizeImg, 'right');
      }
    });
  });
}

function checkPosition(containers) {
  containers.forEach((container) => {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop + windowHeight * 0.5 > rect.top + scrollTop) {
      container.classList.add('is-visible');
    }
  });
}

function drags(dragElement, resizeElement, container, labelContainer, labelResizeElement) {
  let isDragging = false;

  const handleMouseDown = (e) => {
    isDragging = true;
    dragElement.classList.add('draggable');
    resizeElement.classList.add('resizable');

    const dragWidth = dragElement.offsetWidth;
    const dragRect = dragElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const xPosition = dragRect.left + dragWidth - e.pageX;
    const containerOffset = containerRect.left;
    const containerWidth = containerRect.width;
    const minLeft = containerOffset + 10;
    const maxLeft = containerOffset + containerWidth - dragWidth - 10;

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      let leftValue = e.pageX + xPosition - dragWidth;

      // Constrain the draggable element to move inside its container
      if (leftValue < minLeft) {
        leftValue = minLeft;
      } else if (leftValue > maxLeft) {
        leftValue = maxLeft;
      }

      const widthValue = ((leftValue + dragWidth / 2 - containerOffset) * 100) / containerWidth + '%';

      dragElement.style.left = widthValue;
      resizeElement.style.width = widthValue;

      if (labelResizeElement) {
        updateLabel(labelResizeElement, resizeElement, 'left');
      }
      if (labelContainer) {
        updateLabel(labelContainer, resizeElement, 'right');
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      dragElement.classList.remove('draggable');
      resizeElement.classList.remove('resizable');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  dragElement.addEventListener('mousedown', handleMouseDown);

  // Touch support for mobile
  dragElement.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    dragElement.dispatchEvent(mouseEvent);
    e.preventDefault();
  });
}

function updateLabel(label, resizeElement, position) {
  if (!label || !resizeElement) return;

  const labelRect = label.getBoundingClientRect();
  const resizeRect = resizeElement.getBoundingClientRect();

  if (position === 'left') {
    if (labelRect.left + labelRect.width < resizeRect.left + resizeRect.width) {
      label.classList.remove('is-hidden');
    } else {
      label.classList.add('is-hidden');
    }
  } else {
    if (labelRect.left > resizeRect.left + resizeRect.width) {
      label.classList.remove('is-hidden');
    } else {
      label.classList.add('is-hidden');
    }
  }
}

