import { fetchStreamUrl } from "../lib/api";

describe("api", () => {
  describe("fetchStreamUrl", () => {
    it("is a function", () => {
      expect(typeof fetchStreamUrl).toBe("function");
    });
  });
});
