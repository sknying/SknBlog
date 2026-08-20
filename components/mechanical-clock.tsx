"use client";

import { useEffect, useState, type CSSProperties } from "react";

const HOUR_MARKERS = [
  "#9b7cf7",
  "#7789ff",
  "#4bb9e8",
  "#43c5a3",
  "#9fd052",
  "#f1aa4d",
  "#ef5c63",
  "#ed6e8d",
  "#dd70b5",
  "#c66fd3",
  "#b075e8",
  "#a17bf2"
] as const;

type ClockStyle = CSSProperties & Record<`--${string}`, string>;

function formatTime(value: Date | null) {
  if (!value) {
    return "正在校准当前时间";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(value);
}

export function MechanicalClock({ className = "" }: { className?: string }) {
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

  return (
    <button
      className={`mechanical-clock${isFast ? " is-fast" : ""}${className ? ` ${className}` : ""}`}
      type="button"
      aria-label={`当前时间 ${timeLabel}，齿轮正在${speedLabel}旋转，点击切换速度`}
      aria-pressed={isFast}
      title={`当前时间 ${timeLabel} · 点击切换齿轮速度`}
      onClick={() => setIsFast((current) => !current)}
    >
      <span className="mechanical-clock__visual" aria-hidden="true">
        <span className="mechanical-clock__gear mechanical-clock__gear--outer" />
        <span className="mechanical-clock__gear mechanical-clock__gear--inner" />
        <span className="mechanical-clock__dial">
          <span className="mechanical-clock__spectrum" />
          <span className="mechanical-clock__face">
            {HOUR_MARKERS.map((color, index) => (
              <span
                className="mechanical-clock__marker"
                key={color}
                style={{
                  "--clock-marker-angle": `${index * 30}deg`,
                  "--clock-marker-color": color
                } as ClockStyle}
              />
            ))}
            <span className="mechanical-clock__cardinal mechanical-clock__cardinal--twelve">12</span>
            <span className="mechanical-clock__cardinal mechanical-clock__cardinal--six">6</span>
            <span
              className="mechanical-clock__hand mechanical-clock__hand--hour"
              style={{ "--clock-hand-angle": `${hourAngle}deg` } as ClockStyle}
            />
            <span
              className="mechanical-clock__hand mechanical-clock__hand--minute"
              style={{ "--clock-hand-angle": `${minuteAngle}deg` } as ClockStyle}
            />
            <span
              className="mechanical-clock__hand mechanical-clock__hand--second"
              style={{ "--clock-hand-angle": `${secondAngle}deg` } as ClockStyle}
            />
            <span className="mechanical-clock__pin" />
          </span>
        </span>
        <span className="mechanical-clock__speed-light" />
      </span>
    </button>
  );
}
