export type CopywritingTone = "professional" | "friendly" | "luxurious" | "playful";

export interface AiCopywritingResult {
  titles: string[];
  descriptions: string[];
}

export function generateAiCopywriting(
  keywords: string,
  tone: CopywritingTone = "professional",
): AiCopywritingResult {
  const cleanKey = keywords.trim() || "Premium Product";
  const capitalKey = cleanKey
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  if (tone === "luxurious") {
    const titles = [
      `The Signature ${capitalKey} — Masterpiece Edition`,
      `Artisan ${capitalKey} | Luxury Craftsmanship`,
      `Opulent ${capitalKey} — Timeless Elegance`,
    ].map((t) => (t.length > 60 ? t.slice(0, 57) + "..." : t));

    const descriptions = [
      `Experience unmatched sophistication with the Signature ${capitalKey}.\n\n` +
        `• Handcrafted from top-tier luxury materials for enduring durability\n` +
        `• Elegant architectural design tailored for discerning connoisseurs\n` +
        `• Exquisite finish that elevates your everyday aesthetic style\n\n` +
        `Elevate your collection today. Order your ${capitalKey} now.`,

      `Indulge in pure elegance with our refined ${capitalKey}.\n\n` +
        `• Precision craftsmanship engineered to absolute perfection\n` +
        `• Premium tactile feel with timeless visual grace\n` +
        `• Designed for those who accept nothing less than extraordinary\n\n` +
        `Claim your piece of luxury. Shop the ${capitalKey} edition now.`,

      `A celebration of prestige and artistry: The ${capitalKey}.\n\n` +
        `• Meticulously curated design for effortless luxury\n` +
        `• Superior materials ensuring pristine longevity\n` +
        `• Backed by Altrivo's master quality guarantee\n\n` +
        `Experience distinction. Reserve yours today.`,
    ];

    return { titles, descriptions };
  }

  if (tone === "friendly") {
    const titles = [
      `Meet Your New Favorite ${capitalKey}!`,
      `Everyday ${capitalKey} — Comfort & Style`,
      `Upgrade Your Routine with ${capitalKey}`,
    ].map((t) => (t.length > 60 ? t.slice(0, 57) + "..." : t));

    const descriptions = [
      `Say hello to your new everyday essential: The ${capitalKey}!\n\n` +
        `• Designed to make your daily routine smooth and enjoyable\n` +
        `• Super comfortable, reliable, and built to last\n` +
        `• Versatile style that fits perfectly into any lifestyle\n\n` +
        `Ready to love your routine? Grab your ${capitalKey} today!`,

      `Looking for the perfect ${capitalKey}? You've found it!\n\n` +
        `• Lightweight, stylish, and amazingly easy to use\n` +
        `• Loved by thousands of happy customers nationwide\n` +
        `• Thoughtfully designed with your comfort in mind\n\n` +
        `Join the happy family — order your ${capitalKey} right now!`,

      `Make every day a little brighter with ${capitalKey}.\n\n` +
        `• Soft, durable, and packed with practical convenience\n` +
        `• Clean modern design that brightens up your setup\n` +
        `• Incredible quality at a price you'll feel great about\n\n` +
        `Treat yourself today. Add ${capitalKey} to your cart now!`,
    ];

    return { titles, descriptions };
  }

  if (tone === "playful") {
    const titles = [
      `Unleash Fun with the ${capitalKey}! 🎉`,
      `Next-Gen ${capitalKey} — Bold & Playful`,
      `Say Yes to the Ultimate ${capitalKey}! ✨`,
    ].map((t) => (t.length > 60 ? t.slice(0, 57) + "..." : t));

    const descriptions = [
      `Ready to turn heads? Meet the show-stopping ${capitalKey}!\n\n` +
        `• Bold vibrant design packed with personality and pop\n` +
        `• Fun to use, impossible to ignore, and ultra-durable\n` +
        `• Created for trendsetters who love standing out\n\n` +
        `Don't sleep on this! Snag your ${capitalKey} before it sells out!`,

      `Level up your game with the all-new ${capitalKey}!\n\n` +
        `• Ultra-cool aesthetic mixed with top-tier performance\n` +
        `• Super smooth feel that turns everyday moments into fun\n` +
        `• The ultimate gift for yourself or your favorite human\n\n` +
        `Ready for maximum vibes? Get your ${capitalKey} now!`,

      `Warning: This ${capitalKey} might cause instant happiness! 😄\n\n` +
        `• Bright, energetic, and built for nonstop good times\n` +
        `• Lightweight build with heavy-duty durability\n` +
        `• Express your style with zero compromises\n\n` +
        `Bring on the fun — grab the ${capitalKey} today!`,
    ];

    return { titles, descriptions };
  }

  // Default: Professional Tone
  const titles = [
    `Professional ${capitalKey} — High Performance`,
    `High-Performance ${capitalKey} for Business`,
    `Precision Engineered ${capitalKey} Solution`,
  ].map((t) => (t.length > 60 ? t.slice(0, 57) + "..." : t));

  const descriptions = [
    `Optimize performance and efficiency with the Professional ${capitalKey}.\n\n` +
      `• Industrial-grade materials ensuring maximum operational reliability\n` +
      `• Ergonomic engineering optimized for high-volume productivity\n` +
      `• Full compliance with international quality and safety standards\n\n` +
      `Upgrade your setup. Purchase the ${capitalKey} today.`,

    `Deliver consistent results with our enterprise-grade ${capitalKey}.\n\n` +
      `• Precision manufacturing tailored for demanding workflows\n` +
      `• Seamless integration capability with superior build quality\n` +
      `• Comprehensive warranty and dedicated technical support\n\n` +
      `Ensure maximum ROI. Order your ${capitalKey} now.`,

    `Streamline your commercial operations with the ${capitalKey}.\n\n` +
      `• High durability components designed for extended utility\n` +
      `• Sleek functional design that maximizes user productivity\n` +
      `• Backed by Altrivo's professional satisfaction guarantee\n\n` +
      `Invest in proven reliability. Buy ${capitalKey} today.`,
  ];

  return { titles, descriptions };
}
