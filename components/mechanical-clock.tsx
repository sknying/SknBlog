"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";

const VIEWBOX_CENTER = 120;

type ClockStyle = CSSProperties & Record<`--${string}`, string>;

function createGearPoints(teeth: number, rootRadius: number, outerRadius: number) {
  const points: string[] = [];
  const toothStep = (Math.PI * 2) / teeth;
  const profile = [
    [0, rootRadius],
    [0.12, rootRadius],
    [0.22, (rootRadius + outerRadius) / 2],
    [0.3, outerRadius],
    [0.7, outerRadius],
    [0.78, (rootRadius + outerRadius) / 2],
    [0.88, rootRadius],
    [1, rootRadius]
  ] as const;

  for (let tooth = 0; tooth < teeth; tooth += 1) {
    for (const [progress, radius] of profile) {
      const angle = tooth * toothStep + progress * toothStep - Math.PI / 2;
      const x = VIEWBOX_CENTER + Math.cos(angle) * radius;
      const y = VIEWBOX_CENTER + Math.sin(angle) * radius;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
  }

  return points.join(" ");
}

const OUTER_GEAR_POINTS = createGearPoints(30, 101, 115);
const INNER_GEAR_POINTS = createGearPoints(20, 79, 91);
const SCALE_TICKS = Array.from({ length: 60 }, (_, index) => ({
  angle: index * 6,
  major: index % 5 === 0,
  cardinal: index % 15 === 0
}));
const INNER_SPOKES = Array.from({ length: 8 }, (_, index) => index * 45);
const ROMAN_NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"] as const;
const ROMAN_MARKS = ROMAN_NUMERALS.map((label, index) => {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  const radius = 72;

  return {
    label,
    x: (VIEWBOX_CENTER + Math.cos(angle) * radius).toFixed(3),
    y: (VIEWBOX_CENTER + Math.sin(angle) * radius).toFixed(3)
  };
});
const TIME_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23"
});

function formatTime(value: Date | null) {
  return value ? TIME_FORMATTER.format(value) : "正在校准当前时间";
}

export function MechanicalClock({ className = "" }: { className?: string }) {
  const gradientId = `clock-spectrum-${useId().replaceAll(":", "")}`;
  const outerMaskId = `${gradientId}-outer-mask`;
  const innerMaskId = `${gradientId}-inner-mask`;
  const [now, setNow] = useState<Date | null>(null);
  const [isFast, setIsFast] = useState(false);

  useEffect(() => {
    let timer = 0;

    const tick = () => {
      const next = new Date();
      setNow(next);
      timer = window.setTimeout(tick, 1000 - next.getMilliseconds());
    };

    tick();
    return () => window.clearTimeout(timer);
  }, []);

  const hours = now?.getHours() ?? 0;
  const minutes = now?.getMinutes() ?? 0;
  const seconds = now?.getSeconds() ?? 0;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;
  const timeLabel = formatTime(now);
  const speedLabel = isFast ? "快速" : "慢速";
  const accessibleTime = now ? `当前时间 ${timeLabel}` : timeLabel;

  return (
    <button
      className={`mechanical-clock${isFast ? " is-fast" : ""}${className ? ` ${className}` : ""}`}
      type="button"
      aria-label={`${accessibleTime}，齿轮正在${speedLabel}旋转，点击切换速度`}
      aria-pressed={isFast}
      title={`${accessibleTime} · 点击切换齿轮速度`}
      onClick={() => setIsFast((current) => !current)}
    >
      <span className="mechanical-clock__visual" aria-hidden="true">
        <svg className="mechanical-clock__machine" viewBox="0 0 240 240">
          <defs>
            <linearGradient id={gradientId} x1="120" y1="5" x2="120" y2="235" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#8b5cf6" />
              <stop offset="0.2" stopColor="#3b82f6" />
              <stop offset="0.4" stopColor="#06b6d4" />
              <stop offset="0.58" stopColor="#22c55e" />
              <stop offset="0.77" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#ef4444" />
            </linearGradient>
            <mask id={outerMaskId} x="0" y="0" width="240" height="240" maskUnits="userSpaceOnUse">
              <polygon points={OUTER_GEAR_POINTS} fill="white" />
              <circle cx="120" cy="120" r="84" fill="black" />
            </mask>
            <mask id={innerMaskId} x="0" y="0" width="240" height="240" maskUnits="userSpaceOnUse">
              <polygon points={INNER_GEAR_POINTS} fill="white" />
              <circle cx="120" cy="120" r="61" fill="black" />
              {INNER_SPOKES.map((angle) => (
                <rect x="116" y="44" width="8" height="80" rx="3" fill="white" transform={`rotate(${angle} 120 120)`} key={angle} />
              ))}
              <circle cx="120" cy="120" r="25" fill="white" />
              <circle cx="120" cy="120" r="9" fill="black" />
            </mask>
          </defs>

          <g className="mechanical-clock__gear mechanical-clock__gear--outer">
            <rect className="mechanical-clock__gear-fill" width="240" height="240" fill={`url(#${gradientId})`} mask={`url(#${outerMaskId})`} />
            <polygon className="mechanical-clock__gear-edge" points={OUTER_GEAR_POINTS} />
            <circle className="mechanical-clock__gear-rim" cx="120" cy="120" r="84" />
          </g>

          <g className="mechanical-clock__gear mechanical-clock__gear--inner">
            <rect className="mechanical-clock__gear-fill" width="240" height="240" fill={`url(#${gradientId})`} mask={`url(#${innerMaskId})`} />
            <polygon className="mechanical-clock__gear-edge" points={INNER_GEAR_POINTS} />
            <circle className="mechanical-clock__gear-rim" cx="120" cy="120" r="61" />
            {INNER_SPOKES.map((angle) => (
              <circle className="mechanical-clock__gear-bolt" cx="120" cy="72" r="3.4" transform={`rotate(${angle} 120 120)`} key={angle} />
            ))}
          </g>

          <g className="mechanical-clock__scale">
            <circle className="mechanical-clock__scale-track" cx="120" cy="120" r="94" />
            {SCALE_TICKS.map(({ angle, major, cardinal }, index) => (
              <line
                className={`mechanical-clock__tick${major ? " mechanical-clock__tick--major" : ""}${cardinal ? " mechanical-clock__tick--cardinal" : ""}`}
                x1="120"
                y1={cardinal ? 18 : major ? 20 : 23}
                x2="120"
                y2={cardinal ? 34 : major ? 32 : 29}
                transform={`rotate(${angle} 120 120)`}
                key={index}
              />
            ))}
          </g>

          <g className="mechanical-clock__dial">
            <circle className="mechanical-clock__dial-glow" cx="120" cy="120" r="64" stroke={`url(#${gradientId})`} />
            <circle className="mechanical-clock__face" cx="120" cy="120" r="58" />
            <circle className="mechanical-clock__face-ring" cx="120" cy="120" r="51" />
            <path className="mechanical-clock__face-crosshair" d="M120 63V70M120 170V177M63 120H70M170 120H177" />
          </g>

          <g className="mechanical-clock__roman-numerals">
            {ROMAN_MARKS.map(({ label, x, y }) => (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" key={label}>{label}</text>
            ))}
          </g>

          <g className="mechanical-clock__hand mechanical-clock__hand--hour" style={{ "--clock-hand-angle": `${hourAngle}deg` } as ClockStyle}>
            <path d="M120 133L112.5 120L116.5 37L120 26L123.5 37L127.5 120Z" />
          </g>
          <g className="mechanical-clock__hand mechanical-clock__hand--minute" style={{ "--clock-hand-angle": `${minuteAngle}deg` } as ClockStyle}>
            <path d="M120 135L114 120L117.5 29L120 18L122.5 29L126 120Z" />
          </g>
          <g className="mechanical-clock__hand mechanical-clock__hand--second" style={{ "--clock-hand-angle": `${secondAngle}deg` } as ClockStyle}>
            <path d="M119.1 139L119.4 119L120 12L120.6 119L120.9 139Z" />
          </g>

          <circle className="mechanical-clock__pin-halo" cx="120" cy="120" r="8" stroke={`url(#${gradientId})`} />
          <circle className="mechanical-clock__pin" cx="120" cy="120" r="4" />
        </svg>
        <span className="mechanical-clock__speed-light" />
      </span>
    </button>
  );
}
