type LabelPosition = 'left' | 'right';

export function initImageCompare(): void {
  const containers = Array.from(document.querySelectorAll<HTMLElement>('.cd-image-container'));

  if (containers.length === 0) {
    return;
  }

  const revealVisible = () => checkPosition(containers);
  revealVisible();
  window.addEventListener('scroll', revealVisible, { passive: true });

  containers.forEach((container) => {
    const handle = container.querySelector<HTMLElement>('.cd-handle');
    const resizeImg = container.querySelector<HTMLElement>('.cd-resize-img');
    const originalLabel = container.querySelector<HTMLElement>(
      '.cd-image-label[data-type="original"]',
    );
    const modifiedLabel = container.querySelector<HTMLElement>(
      '.cd-image-label[data-type="modified"]',
    );

    if (handle && resizeImg) {
      initDrag(handle, resizeImg, container, originalLabel, modifiedLabel);
      updateLabel(modifiedLabel, resizeImg, 'left');
      updateLabel(originalLabel, resizeImg, 'right');
    }
  });

  window.addEventListener('resize', () => {
    containers.forEach((container) => {
      const resizeImg = container.querySelector<HTMLElement>('.cd-resize-img');
      const modifiedLabel = container.querySelector<HTMLElement>(
        '.cd-image-label[data-type="modified"]',
      );
      const originalLabel = container.querySelector<HTMLElement>(
        '.cd-image-label[data-type="original"]',
      );

      if (!resizeImg) {
        return;
      }

      updateLabel(modifiedLabel, resizeImg, 'left');
      updateLabel(originalLabel, resizeImg, 'right');
    });
  });
}

function checkPosition(containers: HTMLElement[]): void {
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  containers.forEach((container) => {
    const rect = container.getBoundingClientRect();
    if (rect.top <= windowHeight * 0.5) {
      container.classList.add('is-visible');
    }
  });
}

function initDrag(
  handle: HTMLElement,
  resizeElement: HTMLElement,
  container: HTMLElement,
  originalLabel: HTMLElement | null,
  modifiedLabel: HTMLElement | null,
): void {
  const onPointerMove = (event: PointerEvent) => {
    const containerRect = container.getBoundingClientRect();
    const handleWidth = handle.offsetWidth;
    const minLeft = 10;
    const maxLeft = containerRect.width - handleWidth - 10;
    const pointerX = event.clientX - containerRect.left - handleWidth / 2;
    const clampedLeft = Math.min(Math.max(pointerX, minLeft), maxLeft);
    const widthValue = `${((clampedLeft + handleWidth / 2) * 100) / containerRect.width}%`;

    handle.style.left = widthValue;
    resizeElement.style.width = widthValue;
    handle.dataset.position = widthValue;

    updateLabel(modifiedLabel, resizeElement, 'left');
    updateLabel(originalLabel, resizeElement, 'right');
  };

  const stopDragging = () => {
    handle.classList.remove('draggable');
    resizeElement.classList.remove('resizable');
    handle.releasePointerCapture?.(activePointerId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('pointercancel', stopDragging);
  };

  let activePointerId = -1;

  handle.addEventListener('pointerdown', (event) => {
    activePointerId = event.pointerId;
    handle.setPointerCapture(activePointerId);
    handle.classList.add('draggable');
    resizeElement.classList.add('resizable');
    onPointerMove(event);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    event.preventDefault();
  });
}

function updateLabel(
  label: HTMLElement | null,
  resizeElement: HTMLElement,
  position: LabelPosition,
): void {
  if (!label) {
    return;
  }

  const labelRect = label.getBoundingClientRect();
  const resizeRect = resizeElement.getBoundingClientRect();

  if (position === 'left') {
    label.classList.toggle(
      'is-hidden',
      labelRect.left + labelRect.width >= resizeRect.left + resizeRect.width,
    );
    return;
  }

  label.classList.toggle('is-hidden', labelRect.left <= resizeRect.left + resizeRect.width);
}
