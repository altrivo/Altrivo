import fs from "fs";
import path from "path";
import {
  getDailySummary,
  getGeoHeatmap,
  getSourceAttribution,
  refreshMaterializedViews,
  benchmarkQueryPerformance,
} from "@/lib/analytics/analyticsRepository";
import { GET, POST } from "@/app/api/analytics/views/route";

describe("Analytics Backend & Materialized Views", () => {
  describe("Supabase Schema Migration SQL Validation", () => {
    it("migration SQL file exists and contains page_views, sessions, materialized views, indexes, and RLS policies", () => {
      const sqlPath = path.join(process.cwd(), "supabase", "migrations", "20260810_analytics_schema.sql");
      expect(fs.existsSync(sqlPath)).toBe(true);

      const sqlContent = fs.readFileSync(sqlPath, "utf8");

      // Tables
      expect(sqlContent).toContain("CREATE TABLE IF NOT EXISTS public.page_views");
      expect(sqlContent).toContain("CREATE TABLE IF NOT EXISTS public.sessions");

      // Materialized Views
      expect(sqlContent).toContain("CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_summary_mv");
      expect(sqlContent).toContain("CREATE MATERIALIZED VIEW IF NOT EXISTS public.geo_heatmap_mv");
      expect(sqlContent).toContain("CREATE MATERIALIZED VIEW IF NOT EXISTS public.source_attribution_mv");

      // RLS Policies
      expect(sqlContent).toContain("ENABLE ROW LEVEL SECURITY");
      expect(sqlContent).toContain("CREATE POLICY page_views_vendor_select_policy");

      // Indexes
      expect(sqlContent).toContain("idx_page_views_vendor_timestamp");
      expect(sqlContent).toContain("idx_daily_summary_mv_pk");

      // Concurrent Refresh Function
      expect(sqlContent).toContain("REFRESH MATERIALIZED VIEW CONCURRENTLY");
    });
  });

  describe("Analytics Repository & Performance Benchmark", () => {
    it("returns daily summary materialized view data", () => {
      const data = getDailySummary("v-default");
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].totalPageViews).toBeGreaterThan(0);
    });

    it("returns geo heatmap materialized view data for Pakistan cities", () => {
      const data = getGeoHeatmap("v-default");
      expect(data.length).toBeGreaterThan(0);
      const karachi = data.find((d) => d.city === "Karachi");
      expect(karachi).toBeDefined();
      expect(karachi?.pageViewsCount).toBeGreaterThan(1000);
    });

    it("returns source attribution traffic breakdown", () => {
      const data = getSourceAttribution("v-default");
      expect(data.length).toBeGreaterThan(0);
      const insta = data.find((d) => d.referrer === "Instagram");
      expect(insta).toBeDefined();
    });

    it("benchmarks query execution speed to be <200ms on 100k+ rows", () => {
      const benchmark = benchmarkQueryPerformance("v-default", 100000);
      expect(benchmark.rowCount).toBe(100000);
      expect(benchmark.durationMs).toBeLessThan(200);
      expect(benchmark.isUnder200ms).toBe(true);
    });

    it("refreshes materialized views concurrently", () => {
      const res = refreshMaterializedViews();
      expect(res.status).toContain("refreshed concurrently");
      expect(res.refreshedAt).toBeDefined();
    });
  });

  describe("Analytics API Route Handlers", () => {
    it("GET /api/analytics/views returns aggregated views and performance benchmark", async () => {
      const req = {
        url: "http://localhost:3000/api/analytics/views?type=all&vendorId=v-default",
      };

      const res = await GET(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.views.dailySummary.length).toBeGreaterThan(0);
      expect(json.benchmark.isUnder200ms).toBe(true);
    });

    it("POST /api/analytics/views triggers materialized view refresh", async () => {
      const res = await POST();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.status).toContain("refreshed concurrently");
    });
  });
});
