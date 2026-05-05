interface SimilarityGaugeProps {
  percentage: number;
  label: string;
  size?: 'sm' | 'lg';
}

const SimilarityGauge = ({ percentage, label, size = 'sm' }: SimilarityGaugeProps) => {
  const radius = size === 'lg' ? 70 : 40;
  const stroke = size === 'lg' ? 8 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const viewSize = (radius + stroke) * 2;

  const getColor = (p: number) => {
    if (p >= 75) return 'hsl(var(--destructive))';
    if (p >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getLabel = (p: number) => {
    if (p >= 75) return 'High Risk';
    if (p >= 50) return 'Moderate';
    return 'Low Risk';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={viewSize} height={viewSize} className="transform -rotate-90">
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold font-mono ${size === 'lg' ? 'text-3xl' : 'text-lg'}`} style={{ color: getColor(percentage) }}>
            {percentage.toFixed(1)}%
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground mt-1">{getLabel(percentage)}</span>
          )}
        </div>
      </div>
      <span className={`text-muted-foreground font-medium ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>{label}</span>
    </div>
  );
};

export default SimilarityGauge;
