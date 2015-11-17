/* eslint-disable */
const globalObject = typeof window !== 'undefined' ? window : global;
/* eslint-enable */
const requestFrame = (
  globalObject.requestAnimationFrame ||
  ((callback) => setTimeout(callback, 1000 / 60))
);
const cancelFrame = (
  globalObject.cancelAnimationFrame ||
  ((timeoutId) => clearTimeout(timeoutId))
);
let debounceTimer = null;
let elementsWithResizeListeners = [];
function windowHasResized() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    for (const elementReference of elementsWithResizeListeners) {
      const { element, listeners, oldWidth, oldHeight } = elementReference;
      if (elementReference.frame) {
        cancelFrame(elementReference.frame);
      }
      elementReference.frame = requestFrame(() => {
        const { offsetWidth, offsetHeight } = element;
        if (offsetWidth !== oldWidth || offsetHeight !== oldHeight) {
          elementReference.oldWidth = offsetWidth;
          elementReference.oldHeight = offsetHeight;
          for (const listener of listeners) {
            listener(offsetWidth, offsetHeight);
          }
        }
      });
    }
  }, 100);
}

function addWindowResizeListener() {
  globalObject.removeEventListener('resize', windowHasResized);
  globalObject.addEventListener('resize', windowHasResized);
}

export function addElementResizeListener(element, callback) {
  if (!element || (element instanceof globalObject.HTMLElement) === false) {
    throw new Error(`element must be HTMLElement, given ${element}`);
  }
  if (typeof callback !== 'function') {
    throw new Error(`callback must be function, given ${callback}`);
  }
  let elementReference = elementsWithResizeListeners.find((item) => item.element === element);
  if (!elementReference) {
    elementReference = { element, listeners: [], frame: null };
    elementsWithResizeListeners.push(elementReference);
  }
  if (elementReference.listeners.indexOf(callback) !== -1) {
    return false;
  }
  elementReference.listeners.push(callback);
  addWindowResizeListener();
  return true;
}

export function removeElementResizeListener(element, callback) {
  const elementReference = elementsWithResizeListeners.find((item) => item.element === element);
  if (!elementReference) {
    return false;
  }
  const listenerIndex = elementReference.listeners.indexOf(callback);
  if (listenerIndex === -1) {
    return false;
  }
  elementReference.listeners = elementReference.listeners.filter((item) => item !== callback);
  if (elementReference.listeners.length === 0) {
    elementsWithResizeListeners = elementsWithResizeListeners.filter((item) => item !== elementReference);
  }
  return true;
}
