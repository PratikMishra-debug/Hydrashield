import { RISK_COLORS } from "../lib/floodModel";

export default function RiskGauge({ probability = 0, level = "Low", size = 220 }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arcFraction = 0.75; // gauge is 3/4 circle
  const startAngle = 135;
  const dash = circumference * arcFraction;
  const progress = (probability / 100) * dash;
  const color = RISK_COLORS[level] || RISK_COLORS.Low;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1B3C52"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1), stroke 400ms" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-4xl font-semibold" style={{ color }}>
          {probability}%
        </span>
        <span className="eyebrow mt-1">{level} Risk</span>
      </div>
    </div>
  );
}
