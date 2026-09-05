"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  FormInput,
  PasswordInput,
  PhoneInput,
  OTPInput,
  CategorySelect,
  SocialButtons,
  StepIndicator,
} from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "otp" | "details";
type Status = "idle" | "loading" | "success" | "error";

interface FormErrors {
  email?: string;
  otp?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  category?: string;
  terms?: string;
}

export default function SignupPage() {
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState<Step>("email");
  const [status, setStatus] = useState<Status>("idle");
  const [globalError, setGlobalError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGlobalError("");
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    if (!email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setStatus("loading");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setStatus("idle");

    if (error) {
      setGlobalError(error.message);
      return;
    }

    setStep("otp");
    startResendCooldown();
  };

  const handleOTPSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    if (otp.length < 6) {
      setErrors({ otp: "Please enter the full 6-digit code" });
      return;
    }

    setStatus("loading");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setStatus("idle");

    if (error) {
      setErrors({ otp: "Incorrect or expired code" });
      return;
    }

    setStep("details");
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    startResendCooldown();
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
  };

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!businessName.trim()) newErrors.businessName = "Business name is required";
    if (!phone || phone.length < 10) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!category) newErrors.category = "Please select a business category";
    if (!termsAccepted) newErrors.terms = "You must accept the terms and privacy policy";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("loading");
    setGlobalError("");

    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      password,
      data: { first_name: firstName, last_name: lastName },
    });

    if (updateError || !userData.user) {
      setStatus("idle");
      setGlobalError(updateError?.message ?? "Something went wrong. Please try again.");
      return;
    }

    const { error: vendorError } = await supabase.from("vendors").insert({
      id: userData.user.id,
      name: `${firstName} ${lastName}`.trim(),
      business_name: businessName,
      phone,
      email,
      category,
    });

    if (vendorError) {
      setStatus("idle");
      setGlobalError(vendorError.message);
      return;
    }

    setStatus("success");
  };

  const stepNumber = step === "email" ? 1 : step === "otp" ? 2 : 3;

  // Success state
  if (status === "success") {
    return (
      <div className="space-y-6 text-center animate-fadeIn">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-100 ring-8 ring-success-50">
          <svg className="h-10 w-10 text-success-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Account Created!
          </h2>
          <p className="mt-2 text-sm text-body">
            Welcome to Altrivo, {firstName || "Vendor"}! Let&apos;s build your online store.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/onboarding"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 text-sm font-bold text-on-primary shadow-md transition-all hover:bg-primary-600 active:scale-[0.99]"
          >
            <span>Start Store Setup Wizard (4 Steps) &rarr;</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold text-subtle hover:text-heading transition-colors"
          >
            Skip to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Go back */}
      {step !== "email" && (
        <button
          type="button"
          onClick={() => {
            if (step === "otp") setStep("email");
            else setStep("otp");
            setErrors({});
            setGlobalError("");
          }}
          className="inline-flex items-center gap-1.5 text-sm text-body transition-colors hover:text-heading"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Go back
        </button>
      )}

      {/* Step indicator */}
      <StepIndicator current={stepNumber} />

      {/* Global error */}
      {globalError && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {globalError}
        </div>
      )}

      {/* Step 1: Email */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Create your account
            </h2>
            <p className="mt-1 text-sm text-body">
              Enter your email &mdash; we&apos;ll send a verification code to get started.
            </p>
          </div>

          <FormInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            placeholder="you@company.com"
            error={errors.email}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            }
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-lg bg-primary-500 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                Send Verification Code
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>

          <SocialButtons mode="signup" />

          <p className="text-center text-sm text-body">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-link transition-colors hover:text-link-hover">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-subtle">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-link hover:text-link-hover">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-link hover:text-link-hover">Privacy Policy</Link>
          </p>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === "otp" && (
        <form onSubmit={handleOTPSubmit} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Verify your email
            </h2>
            <p className="mt-1 text-sm text-body">
              We&apos;ve sent a 6-digit code to{" "}
              <span className="font-medium text-heading">{email}</span>
            </p>
          </div>

          <OTPInput value={otp} onChange={setOtp} error={errors.otp} />

          <button
            type="submit"
            disabled={status === "loading" || otp.length < 6}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-lg bg-primary-500 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>

          <p className="text-center text-sm text-body">
            Didn&apos;t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-subtle">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="font-semibold text-link transition-colors hover:text-link-hover"
              >
                Resend code
              </button>
            )}
          </p>
        </form>
      )}

      {/* Step 3: Registration Details */}
      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Register Details
            </h2>
            <p className="mt-1 text-sm text-body">
              Your email is verified &mdash; just a few more details to finish.
            </p>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clearError("firstName");
              }}
              placeholder="Ali"
              error={errors.firstName}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
            />
            <FormInput
              label="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clearError("lastName");
              }}
              placeholder="Khan"
              error={errors.lastName}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>

          {/* Business Name */}
          <FormInput
            label="Business Name"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              clearError("businessName");
            }}
            placeholder="Your company or business name"
            error={errors.businessName}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            }
          />

          {/* Phone */}
          <PhoneInput
            value={phone}
            onChange={(val) => {
              setPhone(val);
              clearError("phone");
            }}
            error={errors.phone}
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              clearError("password");
            }}
            showStrength
            error={errors.password}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(val) => {
              setConfirmPassword(val);
              clearError("confirmPassword");
            }}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
          />

          {/* Category */}
          <CategorySelect
            value={category}
            onChange={(val) => {
              setCategory(val);
              clearError("category");
            }}
            error={errors.category}
          />

          {/* Terms */}
          <div className="space-y-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  clearError("terms");
                }}
                className="mt-0.5 h-4 w-4 rounded border-default text-primary-500 accent-primary-500"
              />
              <span className="text-sm text-body leading-snug">
                I agree to the{" "}
                <Link href="#" className="font-medium text-link hover:text-link-hover">
                  Free Membership Agreement
                </Link>
                ,{" "}
                <Link href="#" className="font-medium text-link hover:text-link-hover">
                  Terms of Use
                </Link>
                , and{" "}
                <Link href="#" className="font-medium text-link hover:text-link-hover">
                  Privacy Policy
                </Link>{" "}
                of Altrivo.
              </span>
            </label>
            {errors.terms && (
              <p className="flex items-center gap-1 text-xs text-error-500 pl-7">
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.terms}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-lg bg-primary-500 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </>
            ) : (
              "Done"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
