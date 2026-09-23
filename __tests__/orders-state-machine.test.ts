import { OrdersBackendService, orderEvents } from "@/services/orders-backend-service";
import { OrderStatus } from "@/types/orders";

describe("Orders State Machine & Backend Service", () => {
  beforeEach(() => {
    OrdersBackendService.resetStore();
  });

  it("retrieves the initial list of orders", async () => {
    const result = await OrdersBackendService.getOrders("vendor_dev_123");
    expect(result.orders.length).toBeGreaterThan(0);
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it("retrieves a single order by ID", async () => {
    const order = await OrdersBackendService.getOrderById("ord-1001");
    expect(order).not.toBeNull();
    expect(order?.id).toBe("ord-1001");
  });

  it("handles valid status transitions and updates escrow state on delivery", async () => {
    // Current status of ord-1001 is 'processing' (which corresponds to 'confirmed' step in timeline)
    // Let's transition to 'shipped'
    const updated = await OrdersBackendService.transitionStatus("ord-1001", "shipped");
    expect(updated.deliveryStatus).toBe("shipped");

    // Transition to 'delivered' (triggers A2 escrow release)
    const delivered = await OrdersBackendService.transitionStatus("ord-1001", "delivered");
    expect(delivered.deliveryStatus).toBe("delivered");
    expect(delivered.escrowStatus).toBe("released_to_vendor");
  });

  it("emits events on status transition", async () => {
    const transitionListener = jest.fn();
    orderEvents.on("order:transition", transitionListener);

    await OrdersBackendService.transitionStatus("ord-1001", "shipped");

    expect(transitionListener).toHaveBeenCalledTimes(1);
    const eventArgs = transitionListener.mock.calls[0][0];
    expect(eventArgs.orderId).toBe("ord-1001");
    expect(eventArgs.to).toBe("shipped");

    orderEvents.off("order:transition", transitionListener);
  });

  it("rejects invalid status transitions in state machine", async () => {
    // Cannot jump from 'processing' ('confirmed') to 'completed' without shipping & delivery
    await expect(
      OrdersBackendService.transitionStatus("ord-1001", "completed")
    ).rejects.toThrow("Invalid status transition");
  });

  it("triggers A2 escrow refund on refund request", async () => {
    // ord-1001 status is 'processing'. Let's refund it
    const refunded = await OrdersBackendService.transitionStatus("ord-1001", "refunded");
    expect(refunded.deliveryStatus).toBe("cancelled");
    expect(refunded.paymentStatus).toBe("refunded");
    expect(refunded.escrowStatus).toBe("refunded_a2_escrow");
  });
});
