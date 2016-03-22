/* global window */
const globalObject = (typeof window === 'undefined') ? global : window;
const setTimeoutTimeout = 20;
const debounceTimeout = 100;
const requestFrame = (
  globalObject.requestAnimationFrame ||
  ((finishRequestFrame) => setTimeout(finishRequestFrame, setTimeoutTimeout))
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
  }, debounceTimeout);
}

function addWindowResizeListener() {
  globalObject.removeEventListener('resize', windowHasResized);
  globalObject.addEventListener('resize', windowHasResized);
}

export function addElementResizeListener(element, handleResize) {
  if (!element || (element instanceof globalObject.HTMLElement) === false) {
    throw new Error(`element must be HTMLElement, given ${ element }`);
  }
  if (typeof handleResize !== 'function') {
    throw new Error(`callback must be function, given ${ handleResize }`);
  }
  let elementReference = elementsWithResizeListeners.find((currentItem) => currentItem.element === element);
  if (!elementReference) {
    elementReference = { element, listeners: [], frame: null, oldWidth: null, oldHeight: null };
    elementsWithResizeListeners.push(elementReference);
  }
  const notFound = -1;
  if (elementReference.listeners.indexOf(handleResize) !== notFound) {
    return false;
  }
  elementReference.listeners.push(handleResize);
  addWindowResizeListener();
  return true;
}

export function removeElementResizeListener(element, handleResize) {
  const elementReference = elementsWithResizeListeners.find((currentItem) => currentItem.element === element);
  if (!elementReference) {
    return false;
  }
  const notFound = -1;
  const listenerIndex = elementReference.listeners.indexOf(handleResize);
  if (listenerIndex === notFound) {
    return false;
  }
  elementReference.listeners = elementReference.listeners.filter((currentItem) => currentItem !== handleResize);
  if (elementReference.listeners.length === 0) {
    elementsWithResizeListeners = elementsWithResizeListeners.filter((currentItem) => currentItem !== elementReference);
  }
  return true;
}
