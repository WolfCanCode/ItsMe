import { describe, expect, it } from "vitest";
import {
  getDisplacementFilter,
  getDisplacementMap,
} from "./displacement";

describe("liquid-glass displacement", () => {
  it("builds a data-URI displacement map SVG", () => {
    const map = getDisplacementMap({
      height: 120,
      width: 200,
      radius: 16,
      depth: 10,
    });
    expect(map.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(decodeURIComponent(map)).toContain("<svg");
    expect(decodeURIComponent(map)).toContain('height="120"');
    expect(decodeURIComponent(map)).toContain('width="200"');
  });

  it("builds a backdrop-filter url targeting #displace", () => {
    const filter = getDisplacementFilter({
      height: 120,
      width: 200,
      radius: 16,
      depth: 10,
      strength: 100,
      chromaticAberration: 2,
    });
    expect(filter.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(filter.endsWith("#displace")).toBe(true);
    expect(decodeURIComponent(filter)).toContain("feDisplacementMap");
  });
});
