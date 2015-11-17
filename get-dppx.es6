/* global window */
export function getDppx(global) {
  const globalObject = global || (typeof window !== 'undefined' ? window : {});
  const dppxInDpi = 96;
  if ('devicePixelRatio' in globalObject) {
    return Number(globalObject.devicePixelRatio);
  } else if ('screen' in globalObject && 'deviceXDPI' in globalObject.screen) {
    return Math.round((
      Math.sqrt(globalObject.screen.deviceXDPI * globalObject.screen.deviceYDPI) / dppxInDpi
    ) * 100) / 100;
  }
  return 1;
}

export function getClosestDppx(dppxRatios, dppx = getDppx()) {
  return dppxRatios.reduce((previousDppx, current) => {
    const currentDppx = typeof current === 'number' ? current : current.dppx;
    return Math.abs(currentDppx - dppx) < Math.abs(previousDppx - dppx) ?
      currentDppx : previousDppx;
  }, -Infinity);
}
