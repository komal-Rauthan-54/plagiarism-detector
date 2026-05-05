import { MultiFileResult, CodeFile } from '@/engine/types';
import SimilarityGauge from './SimilarityGauge';

interface OverviewStatsProps {
  result: MultiFileResult;
}

const LANG_LABELS: Record<string, string> = { c: 'C', cpp: 'C++', java: 'Java', python: 'Python' };
const LANG_COLORS: Record<string, string> = {
  c: 'bg-blue-500/20 text-blue-400',
  cpp: 'bg-purple-500/20 text-purple-400',
  java: 'bg-orange-500/20 text-orange-400',
  python: 'bg-emerald-500/20 text-emerald-400',
};

function getFileName(files: CodeFile[], id: string) {
  return files.find(f => f.id === id)?.name || id;
}

const OverviewStats = ({ result }: OverviewStatsProps) => {
  const { files, pairs, flaggedPairs, overallAverage, highestPair } = result;

  // Language breakdown
  const langCounts: Record<string, number> = {};
  files.forEach(f => { langCounts[f.language] = (langCounts[f.language] || 0) + 1; });

  return (
    <div className="space-y-4">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Files Analyzed</p>
          <p className="text-3xl font-bold font-mono text-foreground">{files.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Pairs Compared</p>
          <p className="text-3xl font-bold font-mono text-foreground">{pairs.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Avg Similarity</p>
          <p className="text-3xl font-bold font-mono text-primary">{overallAverage}%</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Flagged Pairs</p>
          <p className={`text-3xl font-bold font-mono ${flaggedPairs.length > 0 ? 'text-destructive' : 'text-success'}`}>
            {flaggedPairs.length}
          </p>
        </div>
      </div>

      {/* Languages */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(langCounts).map(([lang, count]) => (
          <span key={lang} className={`text-xs font-mono font-semibold px-3 py-1 rounded-full ${LANG_COLORS[lang]}`}>
            {LANG_LABELS[lang]}: {count} file{count > 1 ? 's' : ''}
          </span>
        ))}
      </div>

      {/* Highest Pair */}
      {highestPair && (
        <div className={`rounded-lg border p-4 flex items-center justify-between ${
          highestPair.similarity >= 75 ? 'border-destructive/40 bg-destructive/5' :
          highestPair.similarity >= 50 ? 'border-warning/40 bg-warning/5' :
          'border-border bg-card'
        }`}>
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Most Similar Pair</p>
            <p className="text-sm font-mono text-foreground">
              <span className="text-primary">{getFileName(files, highestPair.fileA)}</span>
              <span className="text-muted-foreground mx-2">↔</span>
              <span className="text-primary">{getFileName(files, highestPair.fileB)}</span>
            </p>
          </div>
          <SimilarityGauge percentage={highestPair.similarity} label="" size="sm" />
        </div>
      )}

      {/* Flagged Pairs List */}
      {flaggedPairs.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2.5 bg-destructive/10 border-b border-border">
            <h4 className="text-xs font-mono text-destructive uppercase tracking-widest">⚠ Flagged Pairs (≥50% similarity)</h4>
          </div>
          <div className="divide-y divide-border">
            {flaggedPairs.sort((a, b) => b.result.overallSimilarity - a.result.overallSimilarity).map((pair, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-foreground">{getFileName(files, pair.fileA)}</span>
                  <span className="text-muted-foreground/40">↔</span>
                  <span className="text-xs font-mono text-foreground">{getFileName(files, pair.fileB)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 text-[10px] font-mono text-muted-foreground">
                    <span>T:{pair.result.tokenSimilarity.toFixed(0)}%</span>
                    <span>S:{pair.result.structureSimilarity.toFixed(0)}%</span>
                    <span>CF:{pair.result.controlFlowSimilarity.toFixed(0)}%</span>
                  </div>
                  <span className={`text-sm font-mono font-bold ${
                    pair.result.overallSimilarity >= 75 ? 'text-destructive' : 'text-warning'
                  }`}>
                    {pair.result.overallSimilarity}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewStats;
