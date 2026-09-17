import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// File-backed Event Store — persists to .data/tracking_events.json
// ---------------------------------------------------------------------------
const EVENTS_FILE = path.join(process.cwd(), ".data", "tracking_events.json");

function loadEvents(): any[] {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      return JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function appendEvent(event: any): void {
  try {
    const dir = path.dirname(EVENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const events = loadEvents();
    events.push(event);

    // Keep last 50,000 events to prevent unbounded growth
    const trimmed = events.length > 50000 ? events.slice(events.length - 50000) : events;
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(trimmed), "utf-8");
  } catch (err) {
    console.warn("[Track API] Could not persist event:", err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/track — ingest a storefront visit event
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    }

    // GeoIP Header Extraction (Vercel / Cloudflare / Custom Proxies)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const city =
      req.headers.get("x-vercel-ip-city") ||
      req.headers.get("cf-ipcity") ||
      (body.city as string) ||
      "Karachi";

    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "Pakistan";

    const eventRecord = {
      id: "evt_" + Math.random().toString(36).substring(2, 9),
      vendorId: body.vendorId || "v-default",
      storeId: body.storeId || null,
      sessionId: body.sessionId || "sess_unknown",
      page: body.page || "/",
      referrer: body.referrer || "direct",
      device: body.device || "desktop",
      city,
      country,
      ip: clientIp,
      productContext: body.productContext || null,
      timestamp: body.timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    // Persist to disk
    appendEvent(eventRecord);

    // Persist to Supabase database (real-time cloud analytics)
    if (supabaseAdmin) {
      (async () => {
        try {
          let vId = (eventRecord.vendorId || "").toString();
          let isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vId);

          if (!isValidUUID && eventRecord.storeId) {
            const sId = (eventRecord.storeId || "").toString();
            const isStoreUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sId);
            let sQuery = supabaseAdmin.from("stores").select("id, vendor_id");
            if (isStoreUUID) sQuery = sQuery.eq("id", sId);
            else sQuery = sQuery.or(`slug.eq.${sId},subdomain.eq.${sId}`);
            const { data: sData } = await sQuery.maybeSingle();
            if (sData?.vendor_id) {
              vId = sData.vendor_id;
              isValidUUID = true;
              if (!eventRecord.storeId) eventRecord.storeId = sData.id;
            }
          }

          const pageStr = String(eventRecord.page || "");
          if (!isValidUUID && pageStr) {
            const match = pageStr.match(/^\/(?:store|preview)\/([^\/?#]+)/i);
            if (match && match[1]) {
              const slug = match[1];
              const { data: sData } = await supabaseAdmin
                .from("stores")
                .select("id, vendor_id")
                .or(`slug.eq.${slug},id.eq.${slug}`)
                .maybeSingle();
              if (sData?.vendor_id) {
                vId = sData.vendor_id;
                isValidUUID = true;
                if (!eventRecord.storeId) eventRecord.storeId = sData.id;
              }
            }
          }

          if (isValidUUID) {
            // 1. Record Page View
            await supabaseAdmin.from("page_views").insert({
              vendor_id: vId,
              session_id: eventRecord.sessionId,
              page: eventRecord.page,
              city: eventRecord.city,
              country: eventRecord.country,
              device: eventRecord.device,
              referrer: eventRecord.referrer,
            });

            // 2. Record or Update Session duration
            const nowIso = new Date().toISOString();
            const { data: existingSession } = await supabaseAdmin
              .from("sessions")
              .select("session_id, started_at")
              .eq("session_id", eventRecord.sessionId)
              .maybeSingle();

            if (existingSession) {
              const started = new Date(existingSession.started_at).getTime();
              const duration = Math.max(1, Math.round((Date.now() - started) / 1000));
              await supabaseAdmin
                .from("sessions")
                .update({
                  ended_at: nowIso,
                  duration_seconds: duration,
                })
                .eq("session_id", eventRecord.sessionId);
            } else {
              await supabaseAdmin
                .from("sessions")
                .insert({
                  session_id: eventRecord.sessionId,
                  vendor_id: vId,
                  started_at: nowIso,
                  ended_at: nowIso,
                  duration_seconds: 0,
                });
            }
          }
        } catch (dbErr) {
          console.warn("[Track API] Supabase tracking notice:", dbErr);
        }
      })();
    }

    return NextResponse.json(
      {
        success: true,
        tracked: true,
        event: eventRecord,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Tracking API Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid or malformed tracking payload",
      },
      { status: 400 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/track — health check + raw event stats
// ---------------------------------------------------------------------------
export async function GET() {
  const events = loadEvents();
  return NextResponse.json({
    success: true,
    service: "Altrivo Storefront Tracking Beacon Ingestion API",
    status: "healthy",
    totalEventsStored: events.length,
  });
}
