// Token types for language-independent representation
export type TokenType =
  | 'KEYWORD'
  | 'OPERATOR'
  | 'IDENTIFIER'
  | 'LITERAL_INT'
  | 'LITERAL_FLOAT'
  | 'LITERAL_STRING'
  | 'LITERAL_CHAR'
  | 'LITERAL_BOOL'
  | 'DELIMITER'
  | 'NEWLINE'
  | 'UNKNOWN';

export interface Token {
  type: TokenType;
  value: string;
  normalized: string;
  line: number;
  column: number;
}

export type Language = 'c' | 'cpp' | 'java' | 'python';

export type ASTNodeType =
  | 'PROGRAM'
  | 'FUNCTION_DEF'
  | 'VARIABLE_DECL'
  | 'ASSIGNMENT'
  | 'IF_STATEMENT'
  | 'ELSE_CLAUSE'
  | 'LOOP'
  | 'RETURN'
  | 'FUNCTION_CALL'
  | 'EXPRESSION'
  | 'BLOCK'
  | 'CLASS_DEF'
  | 'PRINT'
  | 'INPUT'
  | 'ARRAY_ACCESS'
  | 'BINARY_OP'
  | 'UNARY_OP'
  | 'SWITCH'
  | 'CASE'
  | 'BREAK'
  | 'CONTINUE'
  | 'TRY_CATCH'
  | 'THROW'
  | 'IMPORT'
  | 'UNKNOWN';

export interface ASTNode {
  type: ASTNodeType;
  children: ASTNode[];
  value?: string;
  line?: number;
  metadata?: Record<string, string>;
}

export interface MatchedBlock {
  file1Lines: [number, number];
  file2Lines: [number, number];
  similarity: number;
  description: string;
  type: 'token' | 'structure' | 'control-flow';
}

export interface ComparisonResult {
  overallSimilarity: number;
  tokenSimilarity: number;
  structureSimilarity: number;
  controlFlowSimilarity: number;
  matchedBlocks: MatchedBlock[];
  explanations: string[];
  file1Tokens: Token[];
  file2Tokens: Token[];
  file1AST: ASTNode;
  file2AST: ASTNode;
}

// Multi-file types
export interface CodeFile {
  id: string;
  name: string;
  language: Language;
  code: string;
}

export interface PairResult {
  fileA: string; // id
  fileB: string; // id
  result: ComparisonResult;
}

export interface MultiFileResult {
  files: CodeFile[];
  pairs: PairResult[];
  matrix: number[][]; // similarity matrix [i][j]
  overallAverage: number;
  highestPair: { fileA: string; fileB: string; similarity: number } | null;
  flaggedPairs: PairResult[]; // pairs above threshold
}
