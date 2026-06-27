export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeStandard = [0.4, 0, 0.2, 1] as const;
export const easeEmphasized = [0.16, 1, 0.3, 1] as const;

export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: easeOutExpo },
};

export const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: easeOutExpo, delay },
});

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: easeStandard },
};

export const stagger = (delay = 0.05) => ({
  animate: { transition: { staggerChildren: delay } },
});

export const slideInRight = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.2, ease: easeStandard },
};
