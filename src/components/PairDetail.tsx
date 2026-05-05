import { PairResult, CodeFile } from '@/engine/types';
import SimilarityGauge from './SimilarityGauge';

interface PairDetailProps {
  pair: PairResult;
  fileA: CodeFile;
  fileB: CodeFile;
  onClose: () => void;
}

const PairDetail = ({ pair, fileA, fileB, onClose }: PairDetailProps) => {
  const { result } = pair;

  const highlightedA = new Set<number>();
  const highlightedB = new Set<number>();
  result.matchedBlocks.forEach(b => {
    for (let l = b.file1Lines[0]; l <= b.file1Lines[1]; l++) highlightedA.add(l);
    for (let l = b.file2Lines[0]; l <= b.file2Lines[1]; l++) highlightedB.add(l);
  });

  const renderCodeWithHighlights = (code: string, highlighted: Set<number>) => {
    const lines = code.split('\n');
    return (
      <div className="text-xs font-mono leading-6 p-3">
        {lines.map((line, i) => (
          <div key={i} className={`flex ${highlighted.has(i + 1) ? 'line-highlight' : ''}`}>
            <span className="w-8 text-right pr-3 text-muted-foreground/40 select-none flex-shrink-0">{i + 1}</span>
            <pre className="whitespace-pre-wrap break-all">{line || ' '}</pre>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-secondary/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Pair Detail</h3>
          <span className="text-xs font-mono text-muted-foreground">
            {fileA.name} ↔ {fileB.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Gauges */}
      <div className="px-5 py-5 flex flex-wrap items-center justify-center gap-8 border-b border-border">
        <SimilarityGauge percentage={result.overallSimilarity} label="Overall" size="lg" />
        <div className="flex gap-6">
          <SimilarityGauge percentage={result.tokenSimilarity} label="Token" />
          <SimilarityGauge percentage={result.structureSimilarity} label="Structure" />
          <SimilarityGauge percentage={result.controlFlowSimilarity} label="Control Flow" />
        </div>
      </div>

      {/* Explanations */}
      <div className="px-5 py-4 border-b border-border space-y-1.5">
        {result.explanations.map((exp, i) => (
          <p key={i} className="text-xs text-secondary-foreground leading-relaxed">{exp}</p>
        ))}
      </div>

      {/* Matched Blocks */}
      {result.matchedBlocks.length > 0 && (
        <div className="px-5 py-3 border-b border-border">
          <h4 className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">Matched Blocks</h4>
          <div className="flex flex-wrap gap-2">
            {result.matchedBlocks.map((block, i) => (
              <span key={i} className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded border border-border">
                L{block.file1Lines[0]}–{block.file1Lines[1]} ↔ L{block.file2Lines[0]}–{block.file2Lines[1]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-side Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div>
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-[10px] font-mono text-muted-foreground">{fileA.name}</span>
          </div>
          <div className="max-h-[350px] overflow-auto code-panel">
            {renderCodeWithHighlights(fileA.code, highlightedA)}
          </div>
        </div>
        <div>
          <div className="px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-[10px] font-mono text-muted-foreground">{fileB.name}</span>
          </div>
          <div className="max-h-[350px] overflow-auto code-panel">
            {renderCodeWithHighlights(fileB.code, highlightedB)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairDetail;
