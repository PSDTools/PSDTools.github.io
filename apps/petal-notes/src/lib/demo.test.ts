import { describe, test } from "vitest";

describe("sum test", () => {
  test("adds 1 + 2 to equal 3", ({ expect }) => {
    expect(1 + 2).toBe(3);
  });
});
