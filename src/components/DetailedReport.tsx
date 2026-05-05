import { ComparisonResult, Language } from '@/engine/types';
import SimilarityGauge from './SimilarityGauge';

const LANGUAGE_LABELS: Record<Language, string> = {
  c: 'C', cpp: 'C++', java: 'Java', python: 'Python',
};

interface DetailedReportProps {
  result: ComparisonResult;
  code1: string;
  code2: string;
  lang1: Language;
  lang2: Language;
}

function getVerdict(score: number) {
  if (score >= 80) return { label: 'High Risk — Likely Plagiarism', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: '🚨' };
  if (score >= 60) return { label: 'Moderate Risk — Significant Similarity', color: 'text-warning', bg: 'bg-warning/10 border-warning/30', icon: '⚠️' };
  if (score >= 40) return { label: 'Low-Moderate — Some Shared Patterns', color: 'text-primary', bg: 'bg-primary/10 border-primary/30', icon: '📊' };
  return { label: 'Low Risk — Appears Original', color: 'text-success', bg: 'bg-success/10 border-success/30', icon: '✅' };
}

function getBarColor(val: number) {
  if (val >= 75) return 'bg-destructive';
  if (val >= 50) return 'bg-warning';
  return 'bg-success';
}

const DetailedReport = ({ result, code1, code2, lang1, lang2 }: DetailedReportProps) => {
  const verdict = getVerdict(result.overallSimilarity);

  const highlightedA = new Set<number>();
  const highlightedB = new Set<number>();
  result.matchedBlocks.forEach(b => {
    for (let l = b.file1Lines[0]; l <= b.file1Lines[1]; l++) highlightedA.add(l);
    for (let l = b.file2Lines[0]; l <= b.file2Lines[1]; l++) highlightedB.add(l);
  });

  const renderCode = (code: string, highlighted: Set<number>) => {
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

  const metrics = [
    { label: 'Token Similarity', value: result.tokenSimilarity, desc: 'Normalized token sequence matching via LCS algorithm' },
    { label: 'Structure Similarity', value: result.structureSimilarity, desc: 'Abstract Syntax Tree (AST) structural comparison' },
    { label: 'Control Flow Similarity', value: result.controlFlowSimilarity, desc: 'Branching and looping pattern analysis' },
  ];

  const techniques = [
    { name: 'Comment & Whitespace Removal', status: '✓', detail: 'Stripped before analysis' },
    { name: 'Identifier Normalization', status: '✓', detail: `Variables → VAR_n, Functions → FUNC_n` },
    { name: 'Control Structure Normalization', status: '✓', detail: 'for/while/do-while → LOOP' },
    { name: 'Cross-Language IR', status: '✓', detail: `${LANGUAGE_LABELS[lang1]} ↔ ${LANGUAGE_LABELS[lang2]}` },
    { name: 'Token Sequence LCS', status: '✓', detail: `Weight: 35%` },
    { name: 'AST Flattened Comparison', status: '✓', detail: `Weight: 35%` },
    { name: 'Control Flow Extraction', status: '✓', detail: `Weight: 30%` },
  ];

  return (
    <div className="space-y-5">
      {/* Verdict Banner */}
      <div className={`rounded-xl border p-6 ${verdict.bg}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{verdict.icon}</span>
              <h3 className={`text-lg font-bold ${verdict.color}`}>{verdict.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Overall plagiarism score based on weighted analysis of token, structure, and control flow similarity.
            </p>
          </div>
          <SimilarityGauge percentage={result.overallSimilarity} label="Overall" size="lg" />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-secondary/50 border-b border-border">
          <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Score Breakdown</h3>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex justify-center gap-8">
            <SimilarityGauge percentage={result.tokenSimilarity} label="Token" />
            <SimilarityGauge percentage={result.structureSimilarity} label="Structure" />
            <SimilarityGauge percentage={result.controlFlowSimilarity} label="Control Flow" />
          </div>
          <div className="space-y-3 pt-2">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono text-foreground font-medium">{m.label}</span>
                  <span className="font-mono font-bold" style={{ color: m.value >= 75 ? 'hsl(var(--destructive))' : m.value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>
                    {m.value.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(m.value)}`} style={{ width: `${m.value}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanations */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-secondary/50 border-b border-border">
          <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Analysis Findings</h3>
        </div>
        <div className="p-5 space-y-2">
          {result.explanations.map((exp, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-secondary-foreground leading-relaxed">
              <span className="text-muted-foreground/50 font-mono text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <p>{exp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Matched Blocks */}
      {result.matchedBlocks.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-3 bg-secondary/50 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Matched Code Blocks</h3>
            <span className="text-xs font-mono text-muted-foreground">{result.matchedBlocks.length} block(s)</span>
          </div>
          <div className="divide-y divide-border">
            {result.matchedBlocks.map((block, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary">#{i + 1}</span>
                  <span className="text-xs text-muted-foreground">{block.description}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-secondary border border-border">
                    File A: L{block.file1Lines[0]}–{block.file1Lines[1]}
                  </span>
                  <span className="text-muted-foreground/40">↔</span>
                  <span className="px-2 py-0.5 rounded bg-secondary border border-border">
                    File B: L{block.file2Lines[0]}–{block.file2Lines[1]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-side Code */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-secondary/50 border-b border-border">
          <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Side-by-Side Comparison</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div>
            <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">File A</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{LANGUAGE_LABELS[lang1]}</span>
            </div>
            <div className="max-h-[400px] overflow-auto code-panel">{renderCode(code1, highlightedA)}</div>
          </div>
          <div>
            <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">File B</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{LANGUAGE_LABELS[lang2]}</span>
            </div>
            <div className="max-h-[400px] overflow-auto code-panel">{renderCode(code2, highlightedB)}</div>
          </div>
        </div>
      </div>

      {/* Techniques Used */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-secondary/50 border-b border-border">
          <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Analysis Techniques Applied</h3>
        </div>
        <div className="divide-y divide-border">
          {techniques.map((t) => (
            <div key={t.name} className="px-5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-success font-mono">{t.status}</span>
                <span className="text-xs font-mono text-foreground">{t.name}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{t.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">File A Tokens</p>
          <p className="text-2xl font-bold font-mono text-foreground">{result.file1Tokens.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">File B Tokens</p>
          <p className="text-2xl font-bold font-mono text-foreground">{result.file2Tokens.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Matched Blocks</p>
          <p className="text-2xl font-bold font-mono text-primary">{result.matchedBlocks.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Overall Score</p>
          <p className={`text-2xl font-bold font-mono ${result.overallSimilarity >= 75 ? 'text-destructive' : result.overallSimilarity >= 50 ? 'text-warning' : 'text-success'}`}>
            {result.overallSimilarity.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailedReport;
