import { CodeFile, MultiFileResult, PairResult } from './types';
import { compareCode } from './comparator';

const PLAGIARISM_THRESHOLD = 50;

export function compareMultipleFiles(files: CodeFile[]): MultiFileResult {
  const n = files.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const pairs: PairResult[] = [];

  // Fill diagonal with 100
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 100;
  }

  // Compare all pairs
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const result = compareCode(files[i].code, files[i].language, files[j].code, files[j].language);
      matrix[i][j] = result.overallSimilarity;
      matrix[j][i] = result.overallSimilarity;
      pairs.push({
        fileA: files[i].id,
        fileB: files[j].id,
        result,
      });
    }
  }

  // Stats
  let totalSim = 0;
  let pairCount = 0;
  let highestSim = -1;
  let highestPair: MultiFileResult['highestPair'] = null;

  for (const pair of pairs) {
    totalSim += pair.result.overallSimilarity;
    pairCount++;
    if (pair.result.overallSimilarity > highestSim) {
      highestSim = pair.result.overallSimilarity;
      highestPair = {
        fileA: pair.fileA,
        fileB: pair.fileB,
        similarity: pair.result.overallSimilarity,
      };
    }
  }

  const flaggedPairs = pairs.filter(p => p.result.overallSimilarity >= PLAGIARISM_THRESHOLD);

  return {
    files,
    pairs,
    matrix,
    overallAverage: pairCount > 0 ? Math.round((totalSim / pairCount) * 10) / 10 : 0,
    highestPair,
    flaggedPairs,
  };
}
