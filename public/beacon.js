(function () {
  if (typeof window === "undefined") return;

  // DNT / GDPR Opt-Out Check
  var dnt =
    navigator.doNotTrack ||
    window.doNotTrack ||
    navigator.msDoNotTrack;

  if (dnt === "1" || dnt === "yes") {
    return;
  }

  // Session ID Management
  var sessionId = sessionStorage.getItem("artrivo_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    sessionStorage.setItem("artrivo_session_id", sessionId);
  }

  // Device Classification
  var ua = navigator.userAgent;
  var device = /mobile/i.test(ua)
    ? "mobile"
    : /tablet|ipad/i.test(ua)
    ? "tablet"
    : "desktop";

  // Deliver page_view event asynchronously
  setTimeout(function () {
    var payload = JSON.stringify({
      vendorId: window.ARTRIVO_VENDOR_ID || "v-default",
      sessionId: sessionId,
      page: window.location.pathname,
      referrer: document.referrer || "direct",
      device: device,
      timestamp: new Date().toISOString()
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      });
    }
  }, 300);
})();
