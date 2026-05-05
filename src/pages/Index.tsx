import { useState } from 'react';
import { CodeFile, MultiFileResult, ComparisonResult, Language } from '@/engine/types';
import { compareMultipleFiles } from '@/engine/multiCompare';
import { compareCode } from '@/engine/comparator';
import { SAMPLE_FILES } from '@/engine/samples';
import FileUploadPanel from '@/components/FileUploadPanel';
import SimilarityMatrix from '@/components/SimilarityMatrix';
import OverviewStats from '@/components/OverviewStats';
import PairDetail from '@/components/PairDetail';
import QuickCompare from '@/components/QuickCompare';
import DetailedReport from '@/components/DetailedReport';

type Mode = 'quick' | 'multi';

const Index = () => {
  const [mode, setMode] = useState<Mode | null>(null);

  // Quick Compare state
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [lang1, setLang1] = useState<Language>('python');
  const [lang2, setLang2] = useState<Language>('python');
  const [quickResult, setQuickResult] = useState<ComparisonResult | null>(null);
  const [quickAnalyzing, setQuickAnalyzing] = useState(false);

  // Multi-file state
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [result, setResult] = useState<MultiFileResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPair, setSelectedPair] = useState<[string, string] | null>(null);

  const handleQuickAnalyze = () => {
    if (!code1.trim() || !code2.trim()) return;
    setQuickAnalyzing(true);
    setTimeout(() => {
      const res = compareCode(code1, lang1, code2, lang2);
      setQuickResult(res);
      setQuickAnalyzing(false);
    }, 600);
  };

  const handleMultiAnalyze = () => {
    if (files.length < 2) return;
    setIsAnalyzing(true);
    setSelectedPair(null);
    setTimeout(() => {
      const res = compareMultipleFiles(files);
      setResult(res);
      setIsAnalyzing(false);
    }, 600);
  };

  const loadSamples = () => {
    if (mode === 'quick') {
      setCode1(SAMPLE_FILES[0].code);
      setLang1(SAMPLE_FILES[0].language);
      setCode2(SAMPLE_FILES[1].code);
      setLang2(SAMPLE_FILES[1].language);
      setQuickResult(null);
    } else {
      setFiles([...SAMPLE_FILES]);
      setResult(null);
      setSelectedPair(null);
    }
  };

  const handleClear = () => {
    setCode1(''); setCode2(''); setQuickResult(null);
    setFiles([]); setResult(null); setSelectedPair(null);
  };

  const goHome = () => {
    setMode(null);
    handleClear();
  };

  const selectedPairData = selectedPair && result
    ? result.pairs.find(p =>
      (p.fileA === selectedPair[0] && p.fileB === selectedPair[1]) ||
      (p.fileA === selectedPair[1] && p.fileB === selectedPair[0])
    )
    : null;

  const fileA = selectedPair ? files.find(f => f.id === selectedPair[0]) : null;
  const fileB = selectedPair ? files.find(f => f.id === selectedPair[1]) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/25">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Plagiarism <span className="text-gradient-primary">Detector</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                Multi-Language · Compiler Design Project
              </p>
            </div>
          </button>
          {mode && (
            <div className="flex items-center gap-2">
              <button
                onClick={loadSamples}
                className="text-xs font-mono px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Load Samples
              </button>
              <button
                onClick={handleClear}
                className="text-xs font-mono px-3 py-1.5 rounded-md border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Mode Selection */}
        {!mode && (
          <div className="py-12 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-foreground">
                Choose <span className="text-gradient-primary">Detection Mode</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Detect plagiarism across C, C++, Java, and Python using lexical analysis,
                AST comparison, and control flow analysis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Quick Compare Card */}
              <button
                onClick={() => setMode('quick')}
                className="group text-left p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all duration-300 glow-primary"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/25 mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Quick Compare</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Compare two code files side-by-side with detailed similarity breakdown,
                  matched blocks highlighting, and in-depth analysis report.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">2 files</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">Side-by-side</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">Detailed Report</span>
                </div>
              </button>

              {/* Multi-File Card */}
              <button
                onClick={() => setMode('multi')}
                className="group text-left p-8 rounded-2xl border border-border bg-card hover:border-accent/50 hover:bg-card/80 transition-all duration-300 glow-accent"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/25 mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Multi-File Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Upload multiple files and get an N×N similarity matrix, flagged pairs,
                  average scores, and a comprehensive overview dashboard.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">N files</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">Heatmap Matrix</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">Flagged Pairs</span>
                </div>
              </button>
            </div>

            {/* Techniques */}
            <div className="max-w-4xl mx-auto pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '🔤', title: 'Lexical Analysis', desc: 'Tokenize & normalize identifiers' },
                  { icon: '🌳', title: 'AST Comparison', desc: 'Structural parse tree matching' },
                  { icon: '🔀', title: 'Control Flow', desc: 'Branch & loop pattern analysis' },
                  { icon: '🌐', title: 'Cross-Language', desc: 'C, C++, Java & Python' },
                ].map((t) => (
                  <div key={t.title} className="p-4 rounded-lg bg-card border border-border text-center">
                    <span className="text-2xl block mb-2">{t.icon}</span>
                    <p className="text-xs font-mono font-semibold text-foreground mb-1">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Compare Mode */}
        {mode === 'quick' && (
          <>
            <QuickCompare
              code1={code1} code2={code2}
              lang1={lang1} lang2={lang2}
              onCode1Change={setCode1} onCode2Change={setCode2}
              onLang1Change={setLang1} onLang2Change={setLang2}
              onAnalyze={handleQuickAnalyze}
              isAnalyzing={quickAnalyzing}
            />
            {quickResult && (
              <DetailedReport result={quickResult} code1={code1} code2={code2} lang1={lang1} lang2={lang2} />
            )}
          </>
        )}

        {/* Multi-File Mode */}
        {mode === 'multi' && (
          <>
            <FileUploadPanel files={files} onFilesChange={setFiles} />

            {files.length >= 2 && (
              <div className="flex justify-center">
                <button
                  onClick={handleMultiAnalyze}
                  disabled={isAnalyzing}
                  className="relative px-8 py-3 rounded-lg font-mono font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-primary"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing {files.length} files...
                    </span>
                  ) : (
                    `▶ Analyze ${files.length} Files (${(files.length * (files.length - 1)) / 2} pairs)`
                  )}
                </button>
              </div>
            )}

            {result && (
              <>
                <OverviewStats result={result} />
                <SimilarityMatrix
                  result={result}
                  onPairClick={(a, b) => setSelectedPair([a, b])}
                />
                {selectedPairData && fileA && fileB && (
                  <PairDetail
                    pair={selectedPairData}
                    fileA={fileA}
                    fileB={fileB}
                    onClose={() => setSelectedPair(null)}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-4">
        <div className="container max-w-7xl mx-auto px-4">
          <p className="text-[10px] text-muted-foreground font-mono text-center uppercase tracking-widest">
            Lexical Analysis · AST Comparison · Token Normalization · Control Flow Analysis
          </p>
          <p className="text-[10px] text-muted-foreground font-mono text-center mt-2">
            Developed by <span className="text-primary">Himanshu Nainwal</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
