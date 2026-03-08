import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { TOUR_STEPS } from "./tourSteps";

const STORAGE_KEY = "onboarding_complete";
const TOOLTIP_WIDTH = 320;
const HIGHLIGHT_PAD = 8;
/** Minimum vertical space (px) below the highlight needed to render the tooltip below it. */
const MIN_SPACE_BELOW_TOOLTIP = 220;

export default function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  // Trigger tour automatically on first visit
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done !== "true") {
      setActive(true);
    }
  }, []);

  const currentStep = TOUR_STEPS[stepIndex];

  const measureTarget = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      // Allow scroll animation to settle before measuring
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect({ ...rect.toJSON() });
      }, 300);
    }
  }, [currentStep]);

  useLayoutEffect(() => {
    if (active) measureTarget();
  }, [active, stepIndex, measureTarget]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => measureTarget();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, measureTarget]);

  const endTour = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setActive(false);
  };

  const goNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      endTour();
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  };

  if (!active || !targetRect) return null;

  const hl = {
    left: targetRect.left - HIGHLIGHT_PAD,
    top: targetRect.top - HIGHLIGHT_PAD,
    width: targetRect.width + HIGHLIGHT_PAD * 2,
    height: targetRect.height + HIGHLIGHT_PAD * 2,
  };

  // Place tooltip below the highlight when there is enough room, otherwise above
  const spaceBelow = window.innerHeight - (hl.top + hl.height);
  const tooltipAbove = spaceBelow < MIN_SPACE_BELOW_TOOLTIP;
  const tooltipTop = tooltipAbove
    ? hl.top - 210
    : hl.top + hl.height + 14;

  // Keep tooltip horizontally within the viewport
  const tooltipLeft = Math.min(
    Math.max(hl.left, 12),
    window.innerWidth - TOOLTIP_WIDTH - 12
  );

  return (
    <>
      {/* Semi-transparent full-screen backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9997,
          pointerEvents: "none",
          background: "rgba(6,13,24,0.78)",
        }}
      />

      {/* Glowing highlight box around the target element */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: hl.left,
          top: hl.top,
          width: hl.width,
          height: hl.height,
          zIndex: 9998,
          borderRadius: 8,
          border: "2px solid #457B9D",
          boxShadow: "0 0 0 4px rgba(69,123,157,0.35), 0 0 20px rgba(69,123,157,0.4)",
          pointerEvents: "none",
          transition: "left 0.25s, top 0.25s, width 0.25s, height 0.25s",
        }}
      />

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label={`Onboarding step ${stepIndex + 1} of ${TOUR_STEPS.length}: ${currentStep.title}`}
        style={{
          position: "fixed",
          left: tooltipLeft,
          top: tooltipTop,
          width: TOOLTIP_WIDTH,
          zIndex: 10000,
          background: "#0d1e30",
          border: "1px solid #1e3a52",
          borderRadius: 12,
          padding: "20px 20px 16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          fontFamily: "'DM Sans', sans-serif",
          transition: "left 0.25s, top 0.25s",
        }}
      >
        {/* Skip button — always visible */}
        <button
          onClick={endTour}
          aria-label="Skip the onboarding tour"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "none",
            border: "1px solid #1e3a52",
            color: "#6b8aad",
            cursor: "pointer",
            fontSize: 11,
            padding: "3px 9px",
            borderRadius: 4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Skip Tour
        </button>

        {/* Step dot indicators */}
        <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === stepIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === stepIndex ? "#457B9D" : "#1e3a52",
                transition: "width 0.25s, background 0.25s",
              }}
            />
          ))}
        </div>

        {/* Step title */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#e8f4f8",
            marginBottom: 8,
            paddingRight: 60,
          }}
        >
          {currentStep.title}
        </div>

        {/* Step content */}
        <div
          style={{
            fontSize: 13,
            color: "#a8c8e8",
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          {currentStep.content}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            aria-label="Go to previous step"
            style={{
              background: "none",
              border: `1px solid ${stepIndex === 0 ? "#1e3a52" : "#2e4a6a"}`,
              color: stepIndex === 0 ? "#2e4a6a" : "#6b8aad",
              borderRadius: 6,
              padding: "7px 16px",
              cursor: stepIndex === 0 ? "not-allowed" : "pointer",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.15s",
            }}
          >
            ← Back
          </button>

          <span style={{ fontSize: 11, color: "#457B9D", fontFamily: "DM Mono, monospace" }}>
            {stepIndex + 1} / {TOUR_STEPS.length}
          </span>

          {stepIndex < TOUR_STEPS.length - 1 ? (
            <button
              onClick={goNext}
              aria-label="Go to next step"
              style={{
                background: "#457B9D",
                border: "none",
                color: "#fff",
                borderRadius: 6,
                padding: "7px 20px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={endTour}
              aria-label="Complete the tour and get started"
              style={{
                background: "#2A9D8F",
                border: "none",
                color: "#fff",
                borderRadius: 6,
                padding: "7px 20px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              🚀 Get Started
            </button>
          )}
        </div>
      </div>
    </>
  );
}
