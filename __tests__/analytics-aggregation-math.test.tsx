/**
 * V2 Test Suite — Analytics Aggregation Math
 * Validates KPI summary math, geo percentages, funnel drop-off, source attribution split, device split.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcConversionRate(purchases: number, totalSessions: number): number {
  if (totalSessions === 0) return 0;
  return Number(((purchases / totalSessions) * 100).toFixed(2));
}

function calcDropOffPct(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((previous - current) / previous) * 100).toFixed(1));
}

function calcPercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

function calcAvgSessionDuration(totalSeconds: number, sessions: number): number {
  if (sessions === 0) return 0;
  return Number((totalSeconds / sessions).toFixed(0));
}

// ─── KPI Summary Aggregation ──────────────────────────────────────────────────

describe("Analytics Aggregation Math — KPI Summary Cards", () => {
  it("calculates conversion rate correctly", () => {
    expect(calcConversionRate(72, 1800)).toBe(4.0);
    expect(calcConversionRate(0, 0)).toBe(0);
    expect(calcConversionRate(1, 3)).toBe(33.33);
  });

  it("calculates average session duration in seconds correctly", () => {
    expect(calcAvgSessionDuration(7200, 120)).toBe(60);
    expect(calcAvgSessionDuration(0, 0)).toBe(0);
    expect(calcAvgSessionDuration(500, 4)).toBe(125);
  });

  it("calculates total views as sum of daily page views", () => {
    const daily = [320, 410, 280, 510, 390, 440, 360];
    const total = daily.reduce((sum, n) => sum + n, 0);
    expect(total).toBe(2710);
  });

  it("calculates unique session count correctly", () => {
    const sessions = [80, 102, 70, 128, 97, 110, 90];
    const total = sessions.reduce((sum, n) => sum + n, 0);
    expect(total).toBe(677);
  });
});

// ─── Geo Heatmap City Percentage Calculations ─────────────────────────────────

describe("Analytics Aggregation Math — Geo Heatmap City Percentages", () => {
  const geoData = [
    { city: "Karachi", views: 1200 },
    { city: "Lahore", views: 800 },
    { city: "Islamabad", views: 400 },
    { city: "Rawalpindi", views: 200 },
    { city: "Faisalabad", views: 150 },
    { city: "Peshawar", views: 100 },
    { city: "Multan", views: 150 },
  ];

  const totalViews = geoData.reduce((sum, g) => sum + g.views, 0);

  it("computes correct total views across all cities", () => {
    expect(totalViews).toBe(3000);
  });

  it("calculates Karachi's percentage as the top city correctly", () => {
    expect(calcPercentage(1200, 3000)).toBe(40.0);
  });

  it("ensures all city percentages sum to 100%", () => {
    const pcts = geoData.map((g) => calcPercentage(g.views, totalViews));
    const sum = pcts.reduce((a, b) => a + b, 0);
    // Allow floating point rounding: should be within 0.5% of 100
    expect(sum).toBeGreaterThanOrEqual(99.5);
    expect(sum).toBeLessThanOrEqual(100.5);
  });
});

// ─── Source Attribution Traffic Split ─────────────────────────────────────────

describe("Analytics Aggregation Math — Source Attribution Traffic Split", () => {
  const sources = [
    { source: "Organic Search", sessions: 540 },
    { source: "Direct", sessions: 360 },
    { source: "Social Media", sessions: 270 },
    { source: "Email", sessions: 180 },
    { source: "Referral", sessions: 90 },
  ];

  const totalSessions = sources.reduce((sum, s) => sum + s.sessions, 0);

  it("computes correct total sessions from all sources", () => {
    expect(totalSessions).toBe(1440);
  });

  it("calculates organic search as the dominant source", () => {
    expect(calcPercentage(540, 1440)).toBe(37.5);
  });

  it("ensures source attribution percentages are plausible (each between 0-100)", () => {
    sources.forEach((s) => {
      const pct = calcPercentage(s.sessions, totalSessions);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  });
});

// ─── Funnel Drop-Off Calculations ─────────────────────────────────────────────

describe("Analytics Aggregation Math — Conversion Funnel Drop-Off", () => {
  const funnelSteps = [
    { step: "Page Visit", users: 10000 },
    { step: "Product View", users: 4200 },
    { step: "Add to Cart", users: 1800 },
    { step: "Checkout Started", users: 900 },
    { step: "Purchase Complete", users: 450 },
  ];

  it("calculates correct drop-off % from Page Visit to Product View", () => {
    expect(calcDropOffPct(4200, 10000)).toBe(58.0);
  });

  it("calculates correct drop-off % from Add to Cart to Checkout", () => {
    expect(calcDropOffPct(900, 1800)).toBe(50.0);
  });

  it("calculates overall funnel conversion rate from visit to purchase", () => {
    const overall = calcConversionRate(450, 10000);
    expect(overall).toBe(4.5);
  });

  it("verifies each funnel step has fewer or equal users than the previous step", () => {
    for (let i = 1; i < funnelSteps.length; i++) {
      expect(funnelSteps[i].users).toBeLessThanOrEqual(funnelSteps[i - 1].users);
    }
  });
});

// ─── Device Split Validation ───────────────────────────────────────────────────

describe("Analytics Aggregation Math — Device Split Percentages", () => {
  const devices = {
    mobile: 6800,
    desktop: 2400,
    tablet: 800,
  };

  const total = Object.values(devices).reduce((sum, v) => sum + v, 0);

  it("computes correct total device sessions", () => {
    expect(total).toBe(10000);
  });

  it("mobile accounts for the majority of sessions (>50%)", () => {
    expect(calcPercentage(devices.mobile, total)).toBe(68.0);
  });

  it("device split percentages are each non-negative and ≤100", () => {
    Object.values(devices).forEach((v) => {
      const pct = calcPercentage(v, total);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  });
});
