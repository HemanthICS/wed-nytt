import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

const STEPS = [
  { num: '01', label: 'Decide' },
  { num: '02', label: 'Design' },
  { num: '03', label: 'Accelerate' },
  { num: '04', label: 'Govern' },
  { num: '05', label: 'Reuse' },
];

/** Clamp a scroll-range value to the valid [0, 1] window */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function SenzaiLoopTransition() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Top-level transforms for timeline line
  const tlHeight  = useTransform(scrollYProgress, [0.45, 0.9], [0, 210]);
  const tlOpacity = useTransform(scrollYProgress, [0.45, 0.5], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="loop-transition-outer"
      style={{ height: '200vh', position: 'relative' }}
    >
      <div className="loop-transition-sticky">
        <div className="loop-transition-stage">

          {/* Timeline line */}
          <motion.div
            className="tl-line"
            style={{ height: tlHeight, opacity: tlOpacity }}
          />

          {/* Timeline dot */}
          <motion.div
            className="tl-dot"
            style={{ top: 134, opacity: tlOpacity }}
          />

          {/* Cards — horizontal → vertical */}
          {STEPS.map((step, i) => (
            <TransitionCard
              key={step.num}
              step={step}
              index={i}
              progress={scrollYProgress}
            />
          ))}

          {/* Nav labels that fade in as cards dissolve */}
          {STEPS.map((step, i) => (
            <NavItem
              key={`nav-${step.num}`}
              label={step.label}
              index={i}
              progress={scrollYProgress}
            />
          ))}

        </div>
      </div>
    </div>
  );
}

/* ─── TransitionCard ──────────────────────────────────────────────────────── */
function TransitionCard({
  step,
  index,
  progress,
}: {
  step: { num: string; label: string };
  index: number;
  progress: MotionValue<number>;
}) {
  const p1Range: [number, number] = [0, 0.6];

  const dissolveStart = clamp01(0.45 + index * 0.04);
  const dissolveEnd   = clamp01(dissolveStart + 0.18); // was 0.2 — safely inside [0,1]

  const startX = 16 + index * 210;
  const startY = 60;
  const destX  = 40;
  const destY  = 140 + index * 52;

  const left    = useTransform(progress, p1Range, [startX, destX]);
  const top     = useTransform(progress, p1Range, [startY, destY]);
  const width   = useTransform(progress, p1Range, [190, 150]);
  const height  = useTransform(progress, p1Range, [130, 48]);
  const opacity = useTransform(progress, [dissolveStart, dissolveEnd], [1, 0]);
  const pointerEvents = useTransform(
    progress,
    (v) => (v < dissolveEnd ? 'auto' : 'none'),
  );

  return (
    <motion.div
      className="loop-transition-card"
      style={{
        left,
        top,
        width,
        height,
        opacity,
        pointerEvents: pointerEvents as MotionValue<'auto' | 'none'>,
      }}
    >
      <span className="card-num">{step.num}</span>
      <span className="card-label">{step.label}</span>
    </motion.div>
  );
}

/* ─── NavItem ─────────────────────────────────────────────────────────────── */
/**
 * Stagger: 5 items in [0.45 … 1.0] = 0.55 range.
 * Each item gets a 0.18 fade-in window with 0.085 stagger between starts.
 * Worst case: start[4] = 0.45 + 4×0.085 = 0.79, end[4] = 0.97  ✓ within [0,1]
 */
function NavItem({
  label,
  index,
  progress,
}: {
  label: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = clamp01(0.45 + index * 0.085);
  const end   = clamp01(start + 0.18);

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const x       = useTransform(progress, [start, end], [-16, 0]);

  return (
    <motion.div
      className="nav-item-transition"
      style={{
        top: 140 + index * 52,
        left: 40,
        opacity,
        x,
      }}
    >
      {label}
    </motion.div>
  );
}
