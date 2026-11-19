// Alignment helper: snaps a dragged box to the edges and centres of its
// neighbours and of the page, within a tolerance expressed in pixels.
export const SNAP_TOLERANCE_PX = 6;

const ownLines = (start, size) => [start, start + size / 2, start + size];

const nearestDelta = (ownLinesArr, targets, tolerance) => {
  let best = null;
  let guide = null;
  ownLinesArr.forEach((own) => {
    targets.forEach((target) => {
      const delta = target - own;
      if (Math.abs(delta) > tolerance) return;
      if (best === null || Math.abs(delta) < Math.abs(best)) {
        best = delta;
        guide = target;
      }
    });
  });
  return { delta: best, guide };
};

/**
 * @param {object} box - { x, y, width, height } in pixels.
 * @param {number[]} verticalTargets - x coordinates to align to.
 * @param {number[]} horizontalTargets - y coordinates to align to.
 * @param {number} tolerance - maximum distance in pixels.
 * @returns {{x:number, y:number, guideX:number|null, guideY:number|null, snapped:boolean}}
 */
export const snapBox = ({
  x,
  y,
  width,
  height,
  verticalTargets = [],
  horizontalTargets = [],
  tolerance = SNAP_TOLERANCE_PX
}) => {
  const vx = nearestDelta(ownLines(x, width), verticalTargets, tolerance);
  const hy = nearestDelta(ownLines(y, height), horizontalTargets, tolerance);
  return {
    x: vx.delta === null ? x : x + vx.delta,
    y: hy.delta === null ? y : y + hy.delta,
    guideX: vx.guide,
    guideY: hy.guide,
    snapped: vx.delta !== null || hy.delta !== null
  };
};

// Builds the alignment targets from the sibling widgets of the same page.
// Every widget contributes its two edges and its centre.
export const alignmentTargets = (widgets = [], { excludeKey } = {}) => {
  const verticalTargets = [];
  const horizontalTargets = [];
  widgets.forEach((widget) => {
    if (!widget || widget.key === excludeKey) return;
    const x = Number(widget.xPx) || 0;
    const y = Number(widget.yPx) || 0;
    const w = Number(widget.widthPx) || 0;
    const h = Number(widget.heightPx) || 0;
    verticalTargets.push(x, x + w / 2, x + w);
    horizontalTargets.push(y, y + h / 2, y + h);
  });
  return { verticalTargets, horizontalTargets };
};
