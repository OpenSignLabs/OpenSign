// @vitest-environment node
import { describe, it, expect } from "vitest";
import { snapBox, alignmentTargets, SNAP_TOLERANCE_PX } from "./snapping";

describe("snapBox", () => {
  it("snaps the left edge to a nearby target", () => {
    const result = snapBox({
      x: 103,
      y: 40,
      width: 50,
      height: 20,
      verticalTargets: [100]
    });
    expect(result.x).toBe(100);
    expect(result.guideX).toBe(100);
    expect(result.snapped).toBe(true);
  });

  it("snaps the centre to a nearby target", () => {
    const result = snapBox({
      x: 72,
      y: 40,
      width: 50,
      height: 20,
      verticalTargets: [100]
    });
    // centre is at 97, so it moves by +3
    expect(result.x).toBe(75);
    expect(result.guideX).toBe(100);
  });

  it("snaps the right edge to a nearby target", () => {
    const result = snapBox({
      x: 48,
      y: 40,
      width: 50,
      height: 20,
      verticalTargets: [100]
    });
    expect(result.x).toBe(50);
    expect(result.guideX).toBe(100);
  });

  it("does not move when the nearest target is outside the tolerance", () => {
    const result = snapBox({
      x: 40,
      y: 40,
      width: 20,
      height: 20,
      verticalTargets: [100],
      horizontalTargets: [200]
    });
    expect(result.x).toBe(40);
    expect(result.y).toBe(40);
    expect(result.snapped).toBe(false);
    expect(result.guideX).toBe(null);
  });

  it("snaps both axes independently", () => {
    const result = snapBox({
      x: 98,
      y: 198,
      width: 20,
      height: 20,
      verticalTargets: [100],
      horizontalTargets: [200]
    });
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  it("chooses the closest target when several are in range", () => {
    const result = snapBox({
      x: 100,
      y: 0,
      width: 10,
      height: 10,
      verticalTargets: [99, 104]
    });
    expect(result.x).toBe(99);
  });

  it("respects the configured tolerance", () => {
    const within = snapBox({
      x: 100 + SNAP_TOLERANCE_PX,
      y: 0,
      width: 10,
      height: 10,
      verticalTargets: [100]
    });
    expect(within.snapped).toBe(true);
    const outside = snapBox({
      x: 100 + SNAP_TOLERANCE_PX + 1,
      y: 0,
      width: 10,
      height: 10,
      verticalTargets: [100]
    });
    expect(outside.snapped).toBe(false);
  });

  it("works with an empty target list", () => {
    const result = snapBox({ x: 5, y: 6, width: 10, height: 10 });
    expect(result).toEqual({ x: 5, y: 6, guideX: null, guideY: null, snapped: false });
  });
});

describe("alignmentTargets", () => {
  const widgets = [
    { key: "a", xPx: 100, yPx: 50, widthPx: 40, heightPx: 20 },
    { key: "b", xPx: 200, yPx: 150, widthPx: 60, heightPx: 30 }
  ];

  it("produces the two edges and the centre of every widget", () => {
    const { verticalTargets, horizontalTargets } = alignmentTargets(widgets);
    expect(verticalTargets).toContain(100);
    expect(verticalTargets).toContain(120);
    expect(verticalTargets).toContain(140);
    expect(horizontalTargets).toContain(50);
    expect(horizontalTargets).toContain(60);
    expect(horizontalTargets).toContain(70);
  });

  it("excludes the widget being dragged", () => {
    const { verticalTargets } = alignmentTargets(widgets, { excludeKey: "a" });
    expect(verticalTargets).not.toContain(100);
    expect(verticalTargets).toContain(200);
  });

  it("tolerates empty input", () => {
    expect(alignmentTargets()).toEqual({
      verticalTargets: [],
      horizontalTargets: []
    });
  });
});
