import { CodeFile, Language } from '@/engine/types';

const LANG_EXTENSIONS: Record<string, Language> = {
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  java: 'java',
  py: 'python',
};

const LANGUAGE_LABELS: Record<Language, string> = {
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
};

const LANGUAGE_COLORS: Record<Language, string> = {
  c: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cpp: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  java: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  python: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function detectLanguage(filename: string): Language {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return LANG_EXTENSIONS[ext] || 'python';
}

interface FileUploadPanelProps {
  files: CodeFile[];
  onFilesChange: (files: CodeFile[]) => void;
}

let fileIdCounter = 0;

const FileUploadPanel = ({ files, onFilesChange }: FileUploadPanelProps) => {

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    Array.from(uploaded).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const code = ev.target?.result as string;
        const lang = detectLanguage(file.name);
        const newFile: CodeFile = {
          id: `file_${++fileIdCounter}`,
          name: file.name,
          language: lang,
          code,
        };
        onFilesChange([...files, newFile]);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  const handlePaste = () => {
    const lang: Language = 'python';
    const newFile: CodeFile = {
      id: `file_${++fileIdCounter}`,
      name: `untitled_${files.length + 1}`,
      language: lang,
      code: '',
    };
    onFilesChange([...files, newFile]);
  };

  const updateFile = (id: string, updates: Partial<CodeFile>) => {
    onFilesChange(files.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
          </svg>
          <span className="text-sm font-mono text-primary font-medium">Upload Files</span>
          <input
            type="file"
            multiple
            accept=".c,.cpp,.cc,.cxx,.h,.hpp,.java,.py,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={handlePaste}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary hover:bg-muted transition-colors"
        >
          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-mono text-muted-foreground font-medium">Add Empty</span>
        </button>

        <span className="text-xs font-mono text-muted-foreground ml-2">
          {files.length} file{files.length !== 1 ? 's' : ''} loaded
        </span>
      </div>

      {/* File Cards */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl bg-card/50">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-1">No files yet</p>
          <p className="text-xs text-muted-foreground/60">Upload .c, .cpp, .java, .py files or add empty editors</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="rounded-lg border border-border bg-card overflow-hidden">
              {/* File Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/70 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
                  </div>
                  <input
                    value={file.name}
                    onChange={(e) => updateFile(file.id, { name: e.target.value })}
                    className="bg-transparent text-sm font-mono text-foreground border-none focus:outline-none focus:ring-0 w-40"
                  />
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${LANGUAGE_COLORS[file.language]}`}>
                    {LANGUAGE_LABELS[file.language]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={file.language}
                    onChange={(e) => updateFile(file.id, { language: e.target.value as Language })}
                    className="bg-muted text-foreground text-xs font-mono px-2 py-1 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {Object.entries(LANGUAGE_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Code Area */}
              <textarea
                value={file.code}
                onChange={(e) => updateFile(file.id, { code: e.target.value })}
                spellCheck={false}
                rows={8}
                className="w-full bg-card text-foreground font-mono text-sm leading-6 p-4 resize-y focus:outline-none focus:ring-0 border-none placeholder:text-muted-foreground/40"
                placeholder={`Paste your ${LANGUAGE_LABELS[file.language]} code here...`}
              />
              <div className="px-4 py-1.5 bg-secondary/40 border-t border-border">
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {file.code.split('\n').length} lines · {file.code.length} chars
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadPanel;
