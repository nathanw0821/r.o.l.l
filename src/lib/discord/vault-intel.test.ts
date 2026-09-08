import { describe, it, expect } from "vitest";
import { getMinervaSchedule, getDailyResetTimers } from "./vault-intel";

describe("Minerva Recon Schedule Engine", () => {
  it("correctly identifies Minerva resting / off-week status on Sep 8, 2026 (today)", () => {
    const schedule = getMinervaSchedule(new Date("2026-09-08T18:50:00Z"));

    expect(schedule.status).toBe("traveling");
    expect(schedule.statusText).toBe("🔴 **Resting & Sourcing Inventory**");
    expect(schedule.location).toBe("Foundation");
    expect(schedule.saleType).toBe("Upcoming: Minerva's Emporium (Sale #1)");
    expect(schedule.listNumber).toBe(1);
    expect(schedule.nextEventUnix).toBe(1789401600); // Mon Sep 14, 2026 16:00:00 UTC
    expect(schedule.nextEventLabel).toBe("Arrives at Foundation");
  });

  it("correctly models Sale 1 active at Foundation (Sep 14 - Sep 16, 2026)", () => {
    const schedule = getMinervaSchedule(new Date("2026-09-14T16:05:00Z"));

    expect(schedule.status).toBe("active_emporium");
    expect(schedule.statusText).toBe("🟢 **Active Now at Foundation**");
    expect(schedule.location).toBe("Foundation");
    expect(schedule.saleType).toBe("Minerva's Emporium (Sale #1)");
    expect(schedule.listNumber).toBe(1);
    expect(schedule.nextEventUnix).toBe(1789574400); // Wed Sep 16, 2026 16:00:00 UTC
    expect(schedule.nextEventLabel).toBe("Departs Appalachia");
  });

  it("correctly models Sale 2 active at The Crater (Sep 21 - Sep 23, 2026)", () => {
    const schedule = getMinervaSchedule(new Date("2026-09-21T16:05:00Z"));

    expect(schedule.status).toBe("active_emporium");
    expect(schedule.statusText).toBe("🟢 **Active Now at The Crater**");
    expect(schedule.location).toBe("The Crater");
    expect(schedule.saleType).toBe("Minerva's Emporium (Sale #2)");
    expect(schedule.listNumber).toBe(2);
    expect(schedule.nextEventUnix).toBe(1790179200); // Wed Sep 23, 2026 16:00:00 UTC
    expect(schedule.nextEventLabel).toBe("Departs Appalachia");
  });

  it("correctly models Sale 3 active at Fort Atlas (Sep 28 - Sep 30, 2026)", () => {
    const schedule = getMinervaSchedule(new Date("2026-09-28T16:05:00Z"));

    expect(schedule.status).toBe("active_emporium");
    expect(schedule.statusText).toBe("🟢 **Active Now at Fort Atlas**");
    expect(schedule.location).toBe("Fort Atlas");
    expect(schedule.saleType).toBe("Minerva's Emporium (Sale #3)");
    expect(schedule.listNumber).toBe(3);
    expect(schedule.nextEventUnix).toBe(1790784000); // Wed Sep 30, 2026 16:00:00 UTC
    expect(schedule.nextEventLabel).toBe("Departs Appalachia");
  });

  it("correctly models the off-period traveling to Big Sale 4 (Oct 2, 2026)", () => {
    const schedule = getMinervaSchedule(new Date("2026-10-02T16:05:00Z"));

    expect(schedule.status).toBe("traveling");
    expect(schedule.statusText).toBe("🔴 **Traveling & Preparing Big Sale**");
    expect(schedule.location).toBe("The Whitespring Resort");
    expect(schedule.saleType).toBe("Upcoming: Minerva's Big Sale #4");
    expect(schedule.listNumber).toBe(4);
    expect(schedule.nextEventUnix).toBe(1791475200); // Thu Oct 08, 2026 16:00:00 UTC
    expect(schedule.nextEventLabel).toBe("Arrives at Whitespring");
  });

  it("correctly models Big Sale 4 active at The Whitespring Resort (Oct 8 - Oct 12, 2026)", () => {
    const schedule = getMinervaSchedule(new Date("2026-10-08T16:05:00Z"));

    expect(schedule.status).toBe("active_big_sale");
    expect(schedule.statusText).toBe("🟡 **BIG SALE Active Now at The Whitespring Resort**");
    expect(schedule.location).toBe("The Whitespring Resort");
    expect(schedule.saleType).toBe("Minerva's Super Big Sale (Sale #4)");
    expect(schedule.listNumber).toBe(4);
    expect(schedule.nextEventUnix).toBe(1791820800); // Mon Oct 12, 2026 16:00:00 UTC
    expect(schedule.nextEventLabel).toBe("Big Sale Concludes");
  });

  it("correctly models the 1-week off-period after Big Sale 4 (Oct 13, 2026)", () => {
    const schedule = getMinervaSchedule(new Date("2026-10-13T16:05:00Z"));

    expect(schedule.status).toBe("traveling");
    expect(schedule.statusText).toBe("🔴 **Resting & Sourcing Inventory**");
    expect(schedule.location).toBe("Foundation");
    expect(schedule.saleType).toBe("Upcoming: Minerva's Emporium (Sale #5)");
    expect(schedule.listNumber).toBe(5);
    expect(schedule.nextEventUnix).toBe(1792425600); // Mon Oct 19, 2026 16:00:00 UTC
    expect(schedule.nextEventLabel).toBe("Arrives at Foundation");
  });

  it("correctly handles US Daylight Saving Time transition in November 2026 (EDT -> EST)", () => {
    // Nov 2, 2026: After DST ends, 12:00 PM EST is 17:00:00 UTC
    const sale7 = getMinervaSchedule(new Date("2026-11-02T17:05:00Z"));
    expect(sale7.status).toBe("active_emporium");
    expect(sale7.location).toBe("Fort Atlas");
    expect(sale7.listNumber).toBe(7);
    expect(sale7.nextEventUnix).toBe(1793811600); // Wed Nov 04, 2026 17:00:00 UTC

    // Nov 12, 2026: Big Sale 8
    const sale8 = getMinervaSchedule(new Date("2026-11-12T17:05:00Z"));
    expect(sale8.status).toBe("active_big_sale");
    expect(sale8.location).toBe("The Whitespring Resort");
    expect(sale8.listNumber).toBe(8);
    expect(sale8.nextEventUnix).toBe(1794848400); // Mon Nov 16, 2026 17:00:00 UTC
  });

  it("correctly models full 24-sale wrap around (Sale 24 to Sale 1)", () => {
    // Sep 3, 2026: Big Sale 24 at Whitespring
    const sale24 = getMinervaSchedule(new Date("2026-09-03T16:05:00Z"));
    expect(sale24.status).toBe("active_big_sale");
    expect(sale24.location).toBe("The Whitespring Resort");
    expect(sale24.listNumber).toBe(24);

    // Sep 7, 2026 16:05 UTC: Big Sale 24 concluded, off-week starts leading to Sale 1
    const postSale24 = getMinervaSchedule(new Date("2026-09-07T16:05:00Z"));
    expect(postSale24.status).toBe("traveling");
    expect(postSale24.location).toBe("Foundation");
    expect(postSale24.listNumber).toBe(1);
    expect(postSale24.nextEventUnix).toBe(1789401600); // Sep 14, 2026 16:00 UTC
  });
});

describe("Daily Reset Timers Engine", () => {
  it("accurately calculates 16:00 UTC reset hour during Eastern Daylight Time (EDT)", () => {
    const timers = getDailyResetTimers(new Date("2026-09-08T14:00:00Z"));
    expect(timers.resetUtcHour).toBe(16);
    expect(timers.noonResetUnix).toBe(1788883200); // Sep 8, 2026 16:00:00 UTC
  });

  it("accurately calculates 17:00 UTC reset hour during Eastern Standard Time (EST)", () => {
    const timers = getDailyResetTimers(new Date("2026-12-10T14:00:00Z"));
    expect(timers.resetUtcHour).toBe(17);
    expect(timers.noonResetUnix).toBe(1796922000); // Dec 10, 2026 17:00:00 UTC
  });
});
