import { Token, TokenType, Language } from './types';

const C_CPP_KEYWORDS = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
  'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
  'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof',
  'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void',
  'volatile', 'while', 'bool', 'true', 'false', 'nullptr',
  // C++ extras
  'class', 'namespace', 'template', 'typename', 'public', 'private',
  'protected', 'virtual', 'override', 'new', 'delete', 'this',
  'try', 'catch', 'throw', 'using', 'include', 'define',
  'cout', 'cin', 'endl', 'string', 'vector', 'map', 'set',
]);

const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch',
  'char', 'class', 'const', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extends', 'final', 'finally', 'float', 'for',
  'goto', 'if', 'implements', 'import', 'instanceof', 'int',
  'interface', 'long', 'native', 'new', 'package', 'private',
  'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'void', 'volatile', 'while', 'true', 'false',
  'null', 'String', 'System', 'out', 'println', 'print',
]);

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
  'except', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
  'return', 'try', 'while', 'with', 'yield', 'print', 'input',
  'range', 'len', 'int', 'float', 'str', 'list', 'dict', 'set',
  'self',
]);

const OPERATORS = new Set([
  '+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=',
  '&&', '||', '!', '&', '|', '^', '~', '<<', '>>', '++', '--',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=',
  '->', '.', '::', '?', ':', '**', '//',
]);

const DELIMITERS = new Set(['(', ')', '{', '}', '[', ']', ';', ',', '.']);

function getKeywords(lang: Language): Set<string> {
  switch (lang) {
    case 'c':
    case 'cpp': return C_CPP_KEYWORDS;
    case 'java': return JAVA_KEYWORDS;
    case 'python': return PYTHON_KEYWORDS;
  }
}

function removeComments(code: string, lang: Language): string {
  if (lang === 'python') {
    // Remove # comments and triple-quoted strings used as comments
    let result = '';
    let i = 0;
    while (i < code.length) {
      if (code[i] === '#') {
        while (i < code.length && code[i] !== '\n') i++;
      } else if (code.substring(i, i + 3) === '"""' || code.substring(i, i + 3) === "'''") {
        const quote = code.substring(i, i + 3);
        i += 3;
        while (i < code.length - 2 && code.substring(i, i + 3) !== quote) i++;
        i += 3;
      } else {
        result += code[i];
        i++;
      }
    }
    return result;
  }

  // C-style comments for C, C++, Java
  let result = '';
  let i = 0;
  while (i < code.length) {
    if (code[i] === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') i++;
    } else if (code[i] === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
    } else if (code[i] === '"') {
      result += code[i];
      i++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') { result += code[i]; i++; }
        result += code[i];
        i++;
      }
      if (i < code.length) { result += code[i]; i++; }
    } else if (code[i] === "'") {
      result += code[i];
      i++;
      while (i < code.length && code[i] !== "'") {
        if (code[i] === '\\') { result += code[i]; i++; }
        result += code[i];
        i++;
      }
      if (i < code.length) { result += code[i]; i++; }
    } else {
      result += code[i];
      i++;
    }
  }
  return result;
}

export function tokenize(code: string, lang: Language): Token[] {
  const cleaned = removeComments(code, lang);
  const keywords = getKeywords(lang);
  const tokens: Token[] = [];
  let line = 1;
  let col = 1;
  let i = 0;
  let identCounter = 0;
  const identMap = new Map<string, string>();

  while (i < cleaned.length) {
    // Skip whitespace
    if (cleaned[i] === ' ' || cleaned[i] === '\t' || cleaned[i] === '\r') {
      col++;
      i++;
      continue;
    }

    if (cleaned[i] === '\n') {
      line++;
      col = 1;
      i++;
      continue;
    }

    // String literals
    if (cleaned[i] === '"' || cleaned[i] === "'") {
      const quote = cleaned[i];
      let str = quote;
      i++;
      col++;
      while (i < cleaned.length && cleaned[i] !== quote) {
        if (cleaned[i] === '\\') { str += cleaned[i]; i++; col++; }
        str += cleaned[i];
        i++;
        col++;
      }
      if (i < cleaned.length) { str += cleaned[i]; i++; col++; }
      tokens.push({ type: 'LITERAL_STRING', value: str, normalized: 'STR_LIT', line, column: col });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(cleaned[i])) {
      let num = '';
      let isFloat = false;
      while (i < cleaned.length && /[0-9.]/.test(cleaned[i])) {
        if (cleaned[i] === '.') isFloat = true;
        num += cleaned[i];
        i++;
        col++;
      }
      tokens.push({
        type: isFloat ? 'LITERAL_FLOAT' : 'LITERAL_INT',
        value: num,
        normalized: isFloat ? 'FLOAT_LIT' : 'INT_LIT',
        line,
        column: col,
      });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(cleaned[i])) {
      let word = '';
      const startCol = col;
      while (i < cleaned.length && /[a-zA-Z0-9_]/.test(cleaned[i])) {
        word += cleaned[i];
        i++;
        col++;
      }

      if (keywords.has(word)) {
        // Normalize keyword to language-independent form
        let normalized = word.toUpperCase();
        if (['true', 'True', 'false', 'False'].includes(word)) {
          tokens.push({ type: 'LITERAL_BOOL', value: word, normalized: 'BOOL_LIT', line, column: startCol });
        } else {
          tokens.push({ type: 'KEYWORD', value: word, normalized, line, column: startCol });
        }
      } else {
        // Normalize identifier
        if (!identMap.has(word)) {
          identMap.set(word, `VAR_${identCounter++}`);
        }
        tokens.push({
          type: 'IDENTIFIER',
          value: word,
          normalized: identMap.get(word)!,
          line,
          column: startCol,
        });
      }
      continue;
    }

    // Multi-char operators
    if (i + 1 < cleaned.length) {
      const twoChar = cleaned[i] + cleaned[i + 1];
      if (OPERATORS.has(twoChar)) {
        tokens.push({ type: 'OPERATOR', value: twoChar, normalized: twoChar, line, column: col });
        i += 2;
        col += 2;
        continue;
      }
    }

    // Single-char operators and delimiters
    const ch = cleaned[i];
    if (OPERATORS.has(ch)) {
      tokens.push({ type: 'OPERATOR', value: ch, normalized: ch, line, column: col });
    } else if (DELIMITERS.has(ch)) {
      tokens.push({ type: 'DELIMITER', value: ch, normalized: ch, line, column: col });
    } else if (ch === '#') {
      // Preprocessor directives - skip to end of line
      while (i < cleaned.length && cleaned[i] !== '\n') i++;
      continue;
    } else {
      tokens.push({ type: 'UNKNOWN', value: ch, normalized: ch, line, column: col });
    }
    i++;
    col++;
  }

  return tokens;
}
