"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SAMPLE_PRODUCTS } from "@/utils/productsMock";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { Button, Card, Badge } from "@/components/shared";
import {
  Sparkles,
  CheckCircle2,
  Package,
  Target,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Megaphone,
} from "@/components/shared/LucideIcons";

export default function NewCampaignWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState(SAMPLE_PRODUCTS[0]);
  const [selectedCopyIndex, setSelectedCopyIndex] = useState<number>(0);
  const [customCopy, setCustomCopy] = useState<string>("");

  // AI Generated Copies
  const aiCopies = [
    {
      title: "🔥 High-Converting Hook Variant",
      copy: `Transform your space with original 24K gold leaf textured impasto oil artwork from Tahleel Studio. Free Express Shipping on orders over $150!`,
    },
    {
      title: "🎨 Story & Craftsmanship Variant",
      copy: `Every brushstroke tells a story. Individually gallery-wrapped on sustainable kiln-dried pine wood stretchers. Includes hand-signed Certificate of Authenticity.`,
    },
    {
      title: "⚡ Urgency & Collector Offer Variant",
      copy: `Limited edition studio release. Elevate your gallery wall today before stock sells out!`,
    },
  ];

  // AI Targeting Config
  const [minAge, setMinAge] = useState(25);
  const [maxAge, setMaxAge] = useState(54);
  const [gender, setGender] = useState<"All" | "Men" | "Women">("All");
  const [cities, setCities] = useState(["San Francisco, CA", "Los Angeles, CA", "New York, NY", "Austin, TX"]);
  const [interests, setInterests] = useState(["Fine Art", "Interior Design", "Luxury Home Decor", "Canvas Painting"]);

  // Budget & Duration
  const [dailyBudget, setDailyBudget] = useState("45.00");
  const [durationDays, setDurationDays] = useState("14");
  const [isLaunching, setIsLaunching] = useState(false);

  const activeCopy = customCopy || aiCopies[selectedCopyIndex].copy;
  const numBudget = parseFloat(dailyBudget) || 45.0;
  const numDays = parseInt(durationDays, 10) || 14;
  const totalSpend = numBudget * numDays;

  const handleLaunchCampaign = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      alert(`🎉 Campaign "${selectedProduct.title} Meta Launch" successfully deployed to Meta Sandbox API! Payment processed via VCC •••• 4289.`);
      router.push("/campaigns");
    }, 2000);
  };

  return (
    <VendorLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-heading font-display tracking-tight flex items-center gap-2">
              <Sparkles size={24} className="text-primary-600" />
              <span>Meta Ad Campaign Creator Wizard</span>
            </h1>
            <p className="text-xs font-semibold text-body">
              AI generates ad copy, targeting, and launches on Meta Sandbox using your VCC payment card.
            </p>
          </div>
          <Badge variant="primary" size="md" className="font-extrabold font-mono">
            STEP {step} OF 5
          </Badge>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-5 gap-2">
          {["1. Select Product", "2. AI Ad Copy", "3. AI Targeting", "4. Budget & VCC", "5. Launch Ad"].map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-center text-xs font-extrabold transition-all border ${
                  isCurrent
                    ? "bg-primary-500 text-on-primary border-primary-600 shadow-sm"
                    : isDone
                    ? "bg-success-50 text-success-900 border-success-200"
                    : "bg-neutral-100 text-body border-default opacity-60"
                }`}
              >
                <div className="truncate">{label}</div>
              </div>
            );
          })}
        </div>

        {/* STEP 1: Select Product */}
        {step === 1 && (
          <Card className="p-6 space-y-6 shadow-card">
            <h2 className="text-lg font-extrabold text-heading font-display">
              Step 1: Choose Product to Promote
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20 shadow-md"
                        : "border-default bg-card hover:border-strong"
                    }`}
                  >
                    <img
                      src={prod.media[0]?.url}
                      alt={prod.title}
                      className="h-16 w-16 rounded-xl object-cover border border-default shrink-0"
                    />
                    <div>
                      <h3 className="text-xs font-extrabold text-heading line-clamp-1">{prod.title}</h3>
                      <p className="text-[11px] font-semibold text-body">{prod.category}</p>
                      <p className="text-xs font-mono font-extrabold text-heading mt-1">${prod.price.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-default">
              <Button variant="primary" size="md" onClick={() => setStep(2)} className="font-extrabold gap-2">
                <span>Next: Generate AI Ad Copy</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: AI Ad Copy */}
        {step === 2 && (
          <Card className="p-6 space-y-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-heading font-display">
                Step 2: AI Generated High-Converting Ad Copy
              </h2>
              <span className="text-xs font-extrabold text-success-700 bg-success-50 px-2.5 py-1 rounded-full border border-success-200">
                ✨ 3 AI Variants Ready
              </span>
            </div>

            <div className="space-y-4">
              {aiCopies.map((variant, idx) => {
                const isSelected = selectedCopyIndex === idx && !customCopy;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedCopyIndex(idx);
                      setCustomCopy("");
                    }}
                    className={`rounded-2xl border-2 p-4 cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "border-primary-500 bg-primary-50/50 shadow-md"
                        : "border-default bg-card hover:border-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-heading">{variant.title}</span>
                      {isSelected && <Badge variant="primary" size="sm" className="font-extrabold">SELECTED</Badge>}
                    </div>
                    <p className="text-xs font-semibold text-body leading-relaxed">"{variant.copy}"</p>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-heading mb-1">
                Or Edit Custom Copy:
              </label>
              <textarea
                rows={3}
                value={customCopy}
                onChange={(e) => setCustomCopy(e.target.value)}
                placeholder="Customise your Meta ad primary text..."
                className="w-full rounded-xl border border-default bg-input p-3 text-xs font-semibold text-heading focus:border-focus focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-default">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="font-bold border-strong">
                ← Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(3)} className="font-extrabold gap-2">
                <span>Next: AI Smart Targeting</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: AI Smart Targeting */}
        {step === 3 && (
          <Card className="p-6 space-y-6 shadow-card">
            <h2 className="text-lg font-extrabold text-heading font-display">
              Step 3: AI Target Audience & Demographics
            </h2>

            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-extrabold text-heading mb-1">Min Age</label>
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-default bg-input p-2.5 font-bold text-heading"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-heading mb-1">Max Age</label>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-default bg-input p-2.5 font-bold text-heading"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-heading mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-xl border border-default bg-input p-2.5 font-bold text-heading"
                  >
                    <option value="All">All Genders</option>
                    <option value="Women">Women Only</option>
                    <option value="Men">Men Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-heading mb-1">Target Cities</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {cities.map((city, idx) => (
                    <Badge key={idx} variant="primary" size="sm" className="font-extrabold">
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-heading mb-1">AI Interest Clusters</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {interests.map((int, idx) => (
                    <Badge key={idx} variant="accent" size="sm" className="font-extrabold">
                      🎯 {int}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-default">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="font-bold border-strong">
                ← Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(4)} className="font-extrabold gap-2">
                <span>Next: Set Budget & VCC</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: Set Budget & VCC Payment */}
        {step === 4 && (
          <Card className="p-6 space-y-6 shadow-card">
            <h2 className="text-lg font-extrabold text-heading font-display">
              Step 4: Campaign Budget & VCC Payment Card
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs font-semibold">
              <div>
                <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider">
                  Daily Budget ($)
                </label>
                <input
                  type="number"
                  step="5"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="w-full rounded-xl border border-default bg-input p-3 font-mono font-extrabold text-heading text-lg focus:border-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider">
                  Duration (Days)
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full rounded-xl border border-default bg-input p-3 font-extrabold text-heading text-sm focus:border-focus focus:outline-none"
                >
                  <option value="7">7 Days ($315 Total)</option>
                  <option value="14">14 Days ($630 Total)</option>
                  <option value="30">30 Days ($1,350 Total)</option>
                </select>
              </div>
            </div>

            {/* VCC Payment Card Overview */}
            <div className="rounded-2xl border border-success-200 bg-success-50/70 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-success-900">
                  <CreditCard size={18} className="text-success-600" />
                  <span>Payment Method: Vendor Virtual Credit Card (VCC)</span>
                </div>
                <Badge variant="success" size="sm" className="font-extrabold">VERIFIED & ACTIVE</Badge>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-bold text-heading">
                <span>Card: •••• •••• •••• 4289</span>
                <span>Available Balance: $1,500.00</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-default">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="font-bold border-strong">
                ← Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(5)} className="font-extrabold gap-2">
                <span>Next: Ad Preview & Launch</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 5: Preview & Launch */}
        {step === 5 && (
          <Card className="p-6 space-y-6 shadow-card">
            <h2 className="text-lg font-extrabold text-heading font-display">
              Step 5: Review & Deploy Ad to Meta Sandbox API
            </h2>

            {/* Visual Meta Ad Card Mockup */}
            <div className="max-w-md mx-auto rounded-2xl border border-strong bg-card p-4 shadow-modal space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center font-extrabold text-primary-800 text-xs">
                  TS
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-heading">Tahleel Studio</h4>
                  <p className="text-[10px] font-semibold text-body">Sponsored · Meta Ads</p>
                </div>
              </div>

              <p className="text-xs font-semibold text-heading leading-relaxed">
                "{activeCopy}"
              </p>

              <img
                src={selectedProduct.media[0]?.url}
                alt={selectedProduct.title}
                className="h-56 w-full object-cover rounded-xl border border-default"
              />

              <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-default">
                <div>
                  <p className="text-xs font-extrabold text-heading">{selectedProduct.title}</p>
                  <p className="text-[10px] font-mono text-body font-bold">${selectedProduct.price.toFixed(2)} USD</p>
                </div>
                <button className="rounded-xl bg-primary-500 px-3 py-1.5 text-xs font-extrabold text-on-primary">
                  Shop Now
                </button>
              </div>
            </div>

            {/* Launch Action */}
            <div className="space-y-3 text-center pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleLaunchCampaign}
                disabled={isLaunching}
                className="w-full font-extrabold shadow-md gap-2 py-3 text-base"
              >
                <Sparkles size={20} />
                <span>{isLaunching ? "Deploying to Meta Sandbox API..." : `Launch Meta Ad Campaign ($${totalSpend.toFixed(2)} via VCC)`}</span>
              </Button>

              <p className="text-[11px] font-semibold text-body flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-success-600" />
                <span>Meta Ad Account Verified · Charged via VCC •••• 4289</span>
              </p>
            </div>
          </Card>
        )}
      </div>
    </VendorLayout>
  );
}
