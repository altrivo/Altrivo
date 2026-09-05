import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Order } from "@/types/orders";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

/**
 * Subscribe to real-time changes on the orders table.
 * If Supabase is not configured, returns a fallback cleanup function.
 */
export function subscribeToOrders(
  onNewOrder: (order: Order) => void,
  onOrderUpdate?: (order: Order) => void
) {
  if (!supabase) {
    console.warn("Supabase is not configured. Realtime fallback mode active.");
    return () => {};
  }

  const channel = supabase
    .channel("realtime-vendor-orders")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload) => {
        if (payload.new) {
          const newOrder = payload.new as Order;
          onNewOrder({ ...newOrder, isNew: true });
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders" },
      (payload) => {
        if (payload.new && onOrderUpdate) {
          onOrderUpdate(payload.new as Order);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
