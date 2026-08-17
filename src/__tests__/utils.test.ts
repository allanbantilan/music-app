import { formatDuration, formatTimeAgo, getThumbnailUrl, truncate } from "../lib/utils";

describe("formatDuration", () => {
  it("formats 0 seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats seconds under a minute", () => {
    expect(formatDuration(45)).toBe("0:45");
  });

  it("formats exactly one minute", () => {
    expect(formatDuration(60)).toBe("1:00");
  });

  it("formats minutes and seconds with padding", () => {
    expect(formatDuration(125)).toBe("2:05");
  });

  it("formats large durations", () => {
    expect(formatDuration(3661)).toBe("61:01");
  });

  it("handles negative values", () => {
    expect(formatDuration(-10)).toBe("0:00");
  });

  it("formats single-digit seconds with zero padding", () => {
    expect(formatDuration(61)).toBe("1:01");
  });
});

describe("getThumbnailUrl", () => {
  const thumbnails = [
    { url: "http://example.com/100.jpg", width: 100, height: 100 },
    { url: "http://example.com/300.jpg", width: 300, height: 300 },
    { url: "http://example.com/500.jpg", width: 500, height: 500 },
  ];

  it("returns empty string for empty thumbnails", () => {
    expect(getThumbnailUrl([])).toBe("");
  });

  it("returns the closest match to preferred size", () => {
    const result = getThumbnailUrl(thumbnails, 280);
    expect(result).toBe("http://example.com/300.jpg");
  });

  it("defaults to preferred size 300", () => {
    const result = getThumbnailUrl(thumbnails);
    expect(result).toBe("http://example.com/300.jpg");
  });

  it("drops non-http urls left by old persisted data", () => {
    const bad = [
      { url: "MusicThumbnail", width: 0, height: 0 },
      { url: "[object Object],[object Object]", width: 0, height: 0 },
    ];
    expect(getThumbnailUrl(bad)).toBe("");
    // valid entry still wins even when mixed with garbage
    expect(
      getThumbnailUrl([...bad, { url: "https://x/i.jpg", width: 300, height: 300 }])
    ).toBe("https://x/i.jpg");
  });
});

describe("truncate", () => {
  it("returns text unchanged if under max length", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hell…");
  });

  it("returns exact text at max length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("formatTimeAgo", () => {
  it("returns Just now for less than 1 minute", () => {
    const recent = new Date(Date.now() - 30_000);
    expect(formatTimeAgo(recent)).toBe("Just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000);
    expect(formatTimeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60_000);
    expect(formatTimeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60_000);
    expect(formatTimeAgo(threeDaysAgo)).toBe("3d ago");
  });
});
