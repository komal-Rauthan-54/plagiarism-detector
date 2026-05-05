import { Language } from '@/engine/types';

const LANGUAGE_LABELS: Record<Language, string> = {
  c: 'C', cpp: 'C++', java: 'Java', python: 'Python',
};

interface QuickCompareProps {
  code1: string;
  code2: string;
  lang1: Language;
  lang2: Language;
  onCode1Change: (v: string) => void;
  onCode2Change: (v: string) => void;
  onLang1Change: (v: Language) => void;
  onLang2Change: (v: Language) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const QuickCompare = ({
  code1, code2, lang1, lang2,
  onCode1Change, onCode2Change, onLang1Change, onLang2Change,
  onAnalyze, isAnalyzing,
}: QuickCompareProps) => {
  const canAnalyze = code1.trim().length > 0 && code2.trim().length > 0;

  const renderEditor = (
    label: string,
    code: string,
    lang: Language,
    onCodeChange: (v: string) => void,
    onLangChange: (v: Language) => void,
  ) => (
    <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/70 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
          </div>
          <span className="text-xs font-mono text-muted-foreground font-semibold">{label}</span>
        </div>
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value as Language)}
          className="bg-muted text-foreground text-xs font-mono px-2 py-1 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {Object.entries(LANGUAGE_LABELS).map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
      </div>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        spellCheck={false}
        rows={14}
        className="w-full bg-card text-foreground font-mono text-sm leading-6 p-4 resize-y focus:outline-none flex-1 placeholder:text-muted-foreground/40"
        placeholder={`Paste your ${LANGUAGE_LABELS[lang]} code here...`}
      />
      <div className="px-4 py-1.5 bg-secondary/40 border-t border-border">
        <span className="text-[10px] font-mono text-muted-foreground/60">
          {code.split('\n').length} lines · {code.length} chars
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {renderEditor('File A', code1, lang1, onCode1Change, onLang1Change)}
        {renderEditor('File B', code2, lang2, onCode2Change, onLang2Change)}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="relative px-8 py-3 rounded-lg font-mono font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-primary"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            '▶ Check Plagiarism'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickCompare;
