import { Token, ASTNode, Language, ComparisonResult, MatchedBlock } from './types';
import { tokenize } from './lexer';
import { buildAST, flattenAST, getControlFlow } from './parser';

// Longest Common Subsequence length
function lcsLength(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  // Use space-optimized LCS
  if (m === 0 || n === 0) return 0;
  const prev = new Array(n + 1).fill(0);
  const curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    for (let j = 0; j <= n; j++) {
      prev[j] = curr[j];
      curr[j] = 0;
    }
  }
  return prev[n];
}

function tokenSequenceSimilarity(tokens1: Token[], tokens2: Token[]): number {
  const seq1 = tokens1
    .filter(t => t.type !== 'DELIMITER' && t.type !== 'UNKNOWN')
    .map(t => t.normalized);
  const seq2 = tokens2
    .filter(t => t.type !== 'DELIMITER' && t.type !== 'UNKNOWN')
    .map(t => t.normalized);

  if (seq1.length === 0 && seq2.length === 0) return 100;
  if (seq1.length === 0 || seq2.length === 0) return 0;

  const lcs = lcsLength(seq1, seq2);
  return (2 * lcs / (seq1.length + seq2.length)) * 100;
}

function structureSimilarity(ast1: ASTNode, ast2: ASTNode): number {
  const flat1 = flattenAST(ast1);
  const flat2 = flattenAST(ast2);

  if (flat1.length === 0 && flat2.length === 0) return 100;
  if (flat1.length === 0 || flat2.length === 0) return 0;

  const lcs = lcsLength(flat1, flat2);
  return (2 * lcs / (flat1.length + flat2.length)) * 100;
}

function controlFlowSimilarity(ast1: ASTNode, ast2: ASTNode): number {
  const flow1 = getControlFlow(ast1);
  const flow2 = getControlFlow(ast2);

  if (flow1.length === 0 && flow2.length === 0) return 100;
  if (flow1.length === 0 || flow2.length === 0) return 0;

  const lcs = lcsLength(flow1, flow2);
  return (2 * lcs / (flow1.length + flow2.length)) * 100;
}

function findMatchedBlocks(tokens1: Token[], tokens2: Token[]): MatchedBlock[] {
  const blocks: MatchedBlock[] = [];
  const windowSize = 5;

  // Sliding window comparison on normalized tokens
  const norm1 = tokens1.filter(t => t.type !== 'DELIMITER' && t.type !== 'UNKNOWN');
  const norm2 = tokens2.filter(t => t.type !== 'DELIMITER' && t.type !== 'UNKNOWN');

  for (let i = 0; i <= norm1.length - windowSize; i++) {
    const window1 = norm1.slice(i, i + windowSize).map(t => t.normalized).join(' ');
    for (let j = 0; j <= norm2.length - windowSize; j++) {
      const window2 = norm2.slice(j, j + windowSize).map(t => t.normalized).join(' ');
      if (window1 === window2) {
        // Extend match
        let len = windowSize;
        while (
          i + len < norm1.length &&
          j + len < norm2.length &&
          norm1[i + len].normalized === norm2[j + len].normalized
        ) {
          len++;
        }

        const line1Start = norm1[i].line;
        const line1End = norm1[Math.min(i + len - 1, norm1.length - 1)].line;
        const line2Start = norm2[j].line;
        const line2End = norm2[Math.min(j + len - 1, norm2.length - 1)].line;

        // Check for overlap with existing blocks
        const overlaps = blocks.some(b =>
          (line1Start >= b.file1Lines[0] && line1Start <= b.file1Lines[1]) ||
          (line2Start >= b.file2Lines[0] && line2Start <= b.file2Lines[1])
        );

        if (!overlaps && len >= windowSize) {
          blocks.push({
            file1Lines: [line1Start, line1End],
            file2Lines: [line2Start, line2End],
            similarity: 100,
            description: `Matching normalized token sequence (${len} tokens)`,
            type: 'token',
          });
        }
      }
    }
  }

  return blocks.slice(0, 20); // Limit to 20 blocks
}

function generateExplanations(result: Omit<ComparisonResult, 'explanations'>): string[] {
  const explanations: string[] = [];
  const overall = result.overallSimilarity;

  if (overall >= 80) {
    explanations.push('⚠️ Very high similarity detected. The programs share nearly identical logical structure and control flow patterns.');
  } else if (overall >= 60) {
    explanations.push('🔶 Significant similarity detected. The programs share substantial structural patterns.');
  } else if (overall >= 40) {
    explanations.push('📊 Moderate similarity detected. Some common patterns found, which may indicate shared algorithm design.');
  } else {
    explanations.push('✅ Low similarity. The programs appear to use different approaches.');
  }

  if (result.tokenSimilarity > 70) {
    explanations.push(`Token sequence similarity is ${result.tokenSimilarity.toFixed(1)}% — the normalized instruction patterns are highly similar, suggesting the same algorithm.`);
  }

  if (result.structureSimilarity > 70) {
    explanations.push(`AST structure similarity is ${result.structureSimilarity.toFixed(1)}% — the code organization (functions, loops, conditions) closely mirrors each other.`);
  }

  if (result.controlFlowSimilarity > 70) {
    explanations.push(`Control flow similarity is ${result.controlFlowSimilarity.toFixed(1)}% — the branching and looping patterns are nearly identical.`);
  }

  if (result.matchedBlocks.length > 0) {
    explanations.push(`Found ${result.matchedBlocks.length} matching code block(s) with identical normalized token sequences.`);
  }

  if (result.controlFlowSimilarity > result.tokenSimilarity + 20) {
    explanations.push('The control flow is more similar than token sequences — this suggests the same algorithm with different expression-level implementation.');
  }

  return explanations;
}

export function compareCode(
  code1: string,
  lang1: Language,
  code2: string,
  lang2: Language
): ComparisonResult {
  const tokens1 = tokenize(code1, lang1);
  const tokens2 = tokenize(code2, lang2);
  const ast1 = buildAST(code1, lang1);
  const ast2 = buildAST(code2, lang2);

  const tokenSim = tokenSequenceSimilarity(tokens1, tokens2);
  const structSim = structureSimilarity(ast1, ast2);
  const cfSim = controlFlowSimilarity(ast1, ast2);
  const matchedBlocks = findMatchedBlocks(tokens1, tokens2);

  // Weighted average
  const overall = tokenSim * 0.35 + structSim * 0.35 + cfSim * 0.30;

  const partial: Omit<ComparisonResult, 'explanations'> = {
    overallSimilarity: Math.round(overall * 10) / 10,
    tokenSimilarity: Math.round(tokenSim * 10) / 10,
    structureSimilarity: Math.round(structSim * 10) / 10,
    controlFlowSimilarity: Math.round(cfSim * 10) / 10,
    matchedBlocks,
    file1Tokens: tokens1,
    file2Tokens: tokens2,
    file1AST: ast1,
    file2AST: ast2,
  };

  return {
    ...partial,
    explanations: generateExplanations(partial),
  };
}
