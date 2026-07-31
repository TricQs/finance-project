import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Sparkles, Wallet, TrendingUp, Compass, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

interface TourStep {
  title: string;
  description: string;
  targetSelector: string;
  position: "right" | "bottom" | "top";
  borderRadius?: number;
  requireSidebarClick?: boolean;
  allowTargetClick?: boolean;
  requiredPath?: string;
}

const STEP_ICONS = [Sparkles, Wallet, TrendingUp, Compass, PlusCircle];

interface TourStep {
  title: string;
  description: string;
  targetSelector: string;
  position: "right" | "bottom" | "top";
  borderRadius?: number;
  requireSidebarClick?: boolean;
  allowTargetClick?: boolean;
  requiredPath?: string;
}

interface OnboardingTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingTour({ forceOpen = false, onClose }: OnboardingTourProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  } | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const animFrameIdRef = useRef<number | null>(null);
  const scrolledStepRef = useRef<number | null>(null);

  const tourSteps: TourStep[] = [
    {
      title: t.tour.step1Title,
      description: t.tour.step1Desc,
      targetSelector: "#tour-hero-banner",
      position: "bottom",
      borderRadius: 24,
    },
    {
      title: t.tour.step2Title,
      description: t.tour.step2Desc,
      targetSelector: "#tour-networth-card",
      position: "bottom",
      borderRadius: 16,
    },
    {
      title: t.tour.step3Title,
      description: t.tour.step3Desc,
      targetSelector: "#tour-chart",
      position: "top",
      borderRadius: 24,
    },
    {
      title: t.tour.step4Title,
      description: t.tour.step4Desc,
      targetSelector: "#tour-accounts-link",
      position: "right",
      borderRadius: 16,
      requireSidebarClick: true,
    },
    {
      title: t.tour.step5Title,
      description: t.tour.step5Desc,
      targetSelector: "#tour-add-account",
      position: "bottom",
      borderRadius: 16,
      allowTargetClick: true,
      requiredPath: "/accounts",
    },
  ];

  // Helper to scroll all scrollable main containers to top 0
  const scrollToContainerTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const scrollables = document.querySelectorAll(".overflow-y-auto, main, div.flex-1");
      scrollables.forEach((c) => {
        c.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial check for new users
  useEffect(() => {
    if (forceOpen) {
      scrollToContainerTop();
      setOpen(true);
      setCurrentStep(0);
      return;
    }

    const hasCompleted = localStorage.getItem("uangku_onboarding_completed");
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        scrollToContainerTop();
        setOpen(true);
        setCurrentStep(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [forceOpen, scrollToContainerTop]);

  // Transition to step 5 when user reaches /accounts page
  useEffect(() => {
    if (open && pathname === "/accounts" && currentStep === 3) {
      setCurrentStep(4);
    }
  }, [pathname, open, currentStep]);

  // Auto-scroll target element into view cleanly without cutting off top titles
  const autoScrollToTarget = useCallback((el: Element) => {
    if (scrolledStepRef.current !== currentStep) {
      scrolledStepRef.current = currentStep;

      if (currentStep === 0) {
        // Step 1: Force scroll main container to top 0
        scrollToContainerTop();
      } else if (currentStep === 2) {
        // Step 3 (Grafik & Kategori): Scroll to center on the single chart card
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const rect = el.getBoundingClientRect();
        const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
        if (rect.top < 80 || rect.bottom > viewportH - 60) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  }, [currentStep, scrollToContainerTop]);

  // Throttled updateRect for maximum web performance
  const updateRect = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    animFrameIdRef.current = requestAnimationFrame(() => {
      const step = tourSteps[currentStep];
      if (!step) return;

      const elements = document.querySelectorAll(step.targetSelector);
      if (elements.length > 0) {
        // Pick the visible element (for mobile vs desktop)
        let visibleEl = Array.from(elements).find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top >= -500;
        }) || elements[0];

        autoScrollToTarget(visibleEl);

        const rect = visibleEl.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        });
      } else {
        setTargetRect(null);
      }
    });
  }, [currentStep, autoScrollToTarget, tourSteps]);

  // Continuously recalculate targetRect during entrance animations (first 500ms)
  useEffect(() => {
    if (!open) return;

    updateRect();

    const interval = setInterval(updateRect, 40);
    const timer = setTimeout(() => {
      clearInterval(interval);
      updateRect();
    }, 450);

    const scrollContainers = document.querySelectorAll(".overflow-y-auto");
    scrollContainers.forEach((c) => c.addEventListener("scroll", updateRect, { passive: true }));
    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      scrollContainers.forEach((c) => c.removeEventListener("scroll", updateRect));
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [currentStep, open, pathname, updateRect]);

  // Handle tour trigger: Only open tour ONCE ON /dashboard AFTER page has fully loaded
  useEffect(() => {
    const handleCheckAndOpen = () => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      if (params.get("tour") === "true") {
        if (pathname === "/dashboard") {
          scrollToContainerTop();
          setOpen(true);
          setCurrentStep(0);
        } else {
          router.push("/dashboard?tour=true");
        }
      }
    };

    handleCheckAndOpen();

    const handleCustomOpen = () => {
      scrollToContainerTop();
      setTimeout(scrollToContainerTop, 100);
      scrolledStepRef.current = null;
      if (pathname === "/dashboard") {
        setOpen(true);
        setCurrentStep(0);
      } else {
        router.push("/dashboard?tour=true");
      }
    };

    window.addEventListener("open-uangku-tour", handleCustomOpen);
    window.addEventListener("popstate", handleCheckAndOpen);

    return () => {
      window.removeEventListener("open-uangku-tour", handleCustomOpen);
      window.removeEventListener("popstate", checkQuery);
    };
    function checkQuery() {
      handleCheckAndOpen();
    }
  }, [pathname, router, scrollToContainerTop]);

  // Listen for sidebar click on Step 4
  useEffect(() => {
    if (!open || currentStep !== 3) return;

    const accountsBtns = document.querySelectorAll("#tour-accounts-link, [data-tour='accounts']");
    if (accountsBtns.length === 0) return;

    const handleAccountsClick = () => {
      setCurrentStep(4);
    };

    accountsBtns.forEach((btn) => btn.addEventListener("click", handleAccountsClick));
    return () => {
      accountsBtns.forEach((btn) => btn.removeEventListener("click", handleAccountsClick));
    };
  }, [open, currentStep]);

  function handleClose() {
    localStorage.setItem("uangku_onboarding_completed", "true");
    setOpen(false);
    setCurrentStep(0);
    scrolledStepRef.current = null;
    onClose?.();
    if (typeof window !== "undefined" && window.location.search.includes("tour=true")) {
      router.replace(pathname);
    }
  }

  function handleNext() {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  }

  if (!mounted || !open) return null;

  // Don't render Step 5 if not on /accounts page yet
  if (currentStep === 4 && pathname !== "/accounts") {
    return null;
  }

  const step = tourSteps[currentStep];
  const StepIcon = STEP_ICONS[currentStep] || Sparkles;
  const isLastStep = currentStep === tourSteps.length - 1;
  const isClickableTarget = step.requireSidebarClick || step.allowTargetClick || currentStep === 4;

  // Calculate Tooltip Box Position & Pointer Arrow dynamically for Desktop & Mobile
  let popoverTop = "50%";
  let popoverLeft = "50%";
  let arrowClass = "";
  let arrowStyle: React.CSSProperties = {};

  if (targetRect) {
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const isMobile = screenWidth < 768;

    if (step.position === "right" && !isMobile) {
      // Desktop Sidebar target (Step 4)
      popoverLeft = `${Math.min(screenWidth - 410, targetRect.right + 16)}px`;
      popoverTop = `${Math.max(16, Math.min(screenHeight - 240, targetRect.top - 10))}px`;
      arrowClass = "absolute -left-2.5 top-6 size-5 bg-zinc-900 rotate-45 rounded-xs border-l border-b border-amber-400";
    } else if (step.position === "right" && isMobile) {
      // Mobile Bottom Nav target (Step 4 on mobile devices)
      const popoverLeftNum = Math.max(16, Math.min(screenWidth - 390, targetRect.left - 120));
      const buttonCenter = targetRect.left + targetRect.width / 2;
      const arrowOffset = Math.max(24, Math.min(340, buttonCenter - popoverLeftNum));

      popoverLeft = `${popoverLeftNum}px`;
      popoverTop = `${Math.max(16, targetRect.top - 210)}px`;
      arrowClass = "absolute -bottom-2.5 size-5 bg-zinc-900 rotate-45 rounded-xs border-b border-r border-amber-400 -translate-x-1/2";
      arrowStyle = { left: `${arrowOffset}px` };
    } else if (step.position === "bottom") {
      if (currentStep === 4) {
        // Step 5 (5 dari 5): Center arrow under + Tambah Rekening button
        const popoverLeftNum = Math.max(16, Math.min(screenWidth - 390, targetRect.right - 390));
        const buttonCenter = targetRect.left + targetRect.width / 2;
        const arrowOffset = Math.max(24, Math.min(340, buttonCenter - popoverLeftNum));

        popoverLeft = `${popoverLeftNum}px`;
        popoverTop = `${Math.min(screenHeight - 240, targetRect.bottom + 16)}px`;
        arrowClass = "absolute -top-2.5 size-5 bg-zinc-900 rotate-45 rounded-xs border-t border-l border-amber-400 -translate-x-1/2";
        arrowStyle = { left: `${arrowOffset}px` };
      } else {
        popoverLeft = `${Math.max(16, Math.min(screenWidth - 390, targetRect.left))}px`;
        popoverTop = `${Math.min(screenHeight - 240, targetRect.bottom + 16)}px`;
        arrowClass = "absolute -top-2.5 left-10 size-5 bg-zinc-900 rotate-45 rounded-xs border-t border-l border-amber-400";
      }
    } else if (step.position === "top") {
      popoverLeft = `${Math.max(16, Math.min(screenWidth - 390, targetRect.left + 10))}px`;
      popoverTop = `${Math.max(16, targetRect.top - 230)}px`;
      arrowClass = "absolute -bottom-2.5 left-12 size-5 bg-zinc-900 rotate-45 rounded-xs border-b border-r border-amber-400";
    }
  }

  const borderRadius = step.borderRadius || 16;

  return createPortal(
    <div className="fixed inset-0 z-[99999] font-sans overflow-hidden pointer-events-none">
      {/* SVG MASK OVERLAY WITH EXACT MATCHING CORNER RADIUS */}
      <svg className="fixed inset-0 size-full z-[99998] pointer-events-auto cursor-not-allowed">
        <defs>
          <mask id="spotlight-mask-svg">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 4}
                y={targetRect.top - 4}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx={borderRadius}
                ry={borderRadius}
                fill="black"
                className="transition-all duration-150 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.55)"
          mask="url(#spotlight-mask-svg)"
        />
      </svg>

      {/* ILLUMINATED SPOTLIGHT RING matching exact rounded shape - CLICKABLE ON STEP 5 */}
      {targetRect && (
        <div
          className={`fixed z-[99999] ring-4 ring-amber-400 bg-transparent transition-all duration-150 ease-out ${isClickableTarget ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
            }`}
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            borderRadius: `${borderRadius}px`,
          }}
          onClick={() => {
            if (step.requireSidebarClick) {
              router.push("/accounts");
              setCurrentStep(4);
            } else if (currentStep === 4) {
              const realBtn = document.querySelector("#tour-add-account") as HTMLElement;
              if (realBtn) realBtn.click();
              handleClose();
            }
          }}
        />
      )}

      {/* SOLID COLOR HIGH-CONTRAST READABLE TOOLTIP POPOVER BOX */}
      <div
        className="fixed z-[100000] pointer-events-auto w-[calc(100vw-32px)] sm:w-[390px] bg-zinc-900 text-white pt-5 px-5 sm:px-6 pb-3 sm:pb-3.5 rounded-3xl shadow-2xl border-2 border-amber-400 font-sans transition-all duration-150 ease-out"
        style={{
          top: popoverTop,
          left: popoverLeft,
        }}
      >
        {/* Arrow Pointer */}
        {targetRect && <div className={arrowClass} style={arrowStyle} />}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <span className="bg-amber-400 text-zinc-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
            {currentStep + 1} {t.tour.stepCount} {tourSteps.length}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <StepIcon className="size-4" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
              {step.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm font-normal text-zinc-200 leading-relaxed pl-0.5">
            {step.description}
          </p>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800">
          <div>
            {!isLastStep && (
              <button
                onClick={handleClose}
                className="text-xs font-semibold text-zinc-400 hover:text-white hover:underline cursor-pointer"
              >
                {t.tour.skipTour}
              </button>
            )}
          </div>

          {!step.requireSidebarClick && (
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs rounded-2xl px-5 h-9 shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>{isLastStep ? t.tour.finish : t.tour.next}</span>
              {!isLastStep && <ArrowRight className="size-3.5" />}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
