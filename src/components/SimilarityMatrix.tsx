import { MultiFileResult, CodeFile } from '@/engine/types';

interface SimilarityMatrixProps {
  result: MultiFileResult;
  onPairClick: (fileAId: string, fileBId: string) => void;
}

function getCellColor(value: number, isDiagonal: boolean): string {
  if (isDiagonal) return 'bg-muted/50';
  if (value >= 75) return 'bg-destructive/30 hover:bg-destructive/40';
  if (value >= 50) return 'bg-warning/20 hover:bg-warning/30';
  if (value >= 25) return 'bg-primary/10 hover:bg-primary/20';
  return 'bg-card hover:bg-secondary';
}

function getCellTextColor(value: number, isDiagonal: boolean): string {
  if (isDiagonal) return 'text-muted-foreground/40';
  if (value >= 75) return 'text-destructive';
  if (value >= 50) return 'text-warning';
  return 'text-foreground';
}

function getShortName(file: CodeFile): string {
  const name = file.name.replace(/\.[^.]+$/, '');
  return name.length > 10 ? name.slice(0, 10) + '…' : name;
}

const LANG_DOT: Record<string, string> = {
  c: 'bg-blue-400',
  cpp: 'bg-purple-400',
  java: 'bg-orange-400',
  python: 'bg-emerald-400',
};

const SimilarityMatrix = ({ result, onPairClick }: SimilarityMatrixProps) => {
  const { files, matrix } = result;
  const n = files.length;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 bg-secondary/50 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Similarity Matrix</h3>
        <span className="text-xs text-muted-foreground font-mono">Click a cell to inspect pair</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-24" />
              {files.map((f) => (
                <th key={f.id} className="px-2 py-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${LANG_DOT[f.language]}`} />
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[80px]">
                      {getShortName(f)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map((rowFile, i) => (
              <tr key={rowFile.id}>
                <td className="pr-3 py-1">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[80px]">
                      {getShortName(rowFile)}
                    </span>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${LANG_DOT[rowFile.language]}`} />
                  </div>
                </td>
                {files.map((_, j) => {
                  const isDiag = i === j;
                  const val = matrix[i][j];
                  return (
                    <td key={j} className="p-1">
                      <button
                        disabled={isDiag}
                        onClick={() => {
                          if (!isDiag) onPairClick(files[i].id, files[j].id);
                        }}
                        className={`w-full aspect-square min-w-[48px] rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:cursor-default ${getCellColor(val, isDiag)}`}
                      >
                        <span className={`text-xs font-mono font-bold ${getCellTextColor(val, isDiag)}`}>
                          {isDiag ? '—' : `${val.toFixed(0)}%`}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="px-5 py-3 border-t border-border flex items-center gap-4">
        <span className="text-[10px] text-muted-foreground font-mono">Legend:</span>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-card border border-border" /><span className="text-[10px] text-muted-foreground font-mono">&lt;25%</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary/15" /><span className="text-[10px] text-muted-foreground font-mono">25-50%</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-warning/25" /><span className="text-[10px] text-muted-foreground font-mono">50-75%</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-destructive/35" /><span className="text-[10px] text-muted-foreground font-mono">&gt;75%</span></div>
      </div>
    </div>
  );
};

export default SimilarityMatrix;
