import { sveltekitUrl } from "$lib/demo";
import { describe, test } from "vitest";

describe("demo test", () => {
  test("svelte is secure", ({ expect }) => {
    expect(sveltekitUrl).toMatch(/^https:\/\//);
  });
});
