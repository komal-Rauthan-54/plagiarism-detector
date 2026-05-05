import { Token, ASTNode, ASTNodeType, Language } from './types';
import { tokenize } from './lexer';

// Simplified parser that builds a language-independent AST
// from token streams. This is a heuristic-based parser, not a full grammar parser.

function isLoopKeyword(token: Token): boolean {
  const loops = ['FOR', 'WHILE', 'DO'];
  return token.type === 'KEYWORD' && loops.includes(token.normalized);
}

function isConditionalKeyword(token: Token): boolean {
  return token.type === 'KEYWORD' && (token.normalized === 'IF' || token.normalized === 'ELIF');
}

function isElseKeyword(token: Token): boolean {
  return token.type === 'KEYWORD' && (token.normalized === 'ELSE');
}

function isFunctionDefKeyword(token: Token, lang: Language): boolean {
  if (lang === 'python') return token.type === 'KEYWORD' && token.normalized === 'DEF';
  return false; // For C/C++/Java, we detect functions by pattern: type name(
}

function isClassKeyword(token: Token): boolean {
  return token.type === 'KEYWORD' && token.normalized === 'CLASS';
}

function isReturnKeyword(token: Token): boolean {
  return token.type === 'KEYWORD' && token.normalized === 'RETURN';
}

function isSwitchKeyword(token: Token): boolean {
  return token.type === 'KEYWORD' && token.normalized === 'SWITCH';
}

function isTryKeyword(token: Token): boolean {
  return token.type === 'KEYWORD' && token.normalized === 'TRY';
}

function isPrintKeyword(token: Token): boolean {
  const prints = ['PRINT', 'PRINTLN', 'COUT', 'PRINTF'];
  return token.type === 'KEYWORD' && prints.includes(token.normalized);
}

export function buildAST(code: string, lang: Language): ASTNode {
  const tokens = tokenize(code, lang);
  const root: ASTNode = { type: 'PROGRAM', children: [] };
  let i = 0;

  function peekToken(): Token | undefined {
    return tokens[i];
  }

  function consumeToken(): Token | undefined {
    return tokens[i++];
  }

  function skipUntil(predicate: (t: Token) => boolean): void {
    while (i < tokens.length && !predicate(tokens[i])) i++;
  }

  function collectBlock(): ASTNode {
    const block: ASTNode = { type: 'BLOCK', children: [], line: tokens[i]?.line };
    
    if (peekToken()?.value === '{') {
      consumeToken(); // {
      let depth = 1;
      const startI = i;
      while (i < tokens.length && depth > 0) {
        if (tokens[i].value === '{') depth++;
        if (tokens[i].value === '}') depth--;
        if (depth > 0) i++;
      }
      // Parse tokens between braces
      const savedI = i;
      i = startI;
      while (i < savedI) {
        const node = parseStatement();
        if (node) block.children.push(node);
      }
      if (peekToken()?.value === '}') consumeToken(); // }
    } else if (lang === 'python') {
      // Python uses indentation - collect until dedent (simplified)
      const currentLine = peekToken()?.line || 0;
      while (i < tokens.length) {
        const nextLine = peekToken()?.line;
        if (nextLine !== undefined && nextLine > currentLine) {
          const node = parseStatement();
          if (node) block.children.push(node);
        } else if (nextLine !== undefined && nextLine > currentLine + 1) {
          const node = parseStatement();
          if (node) block.children.push(node);
        } else {
          break;
        }
      }
      if (block.children.length === 0) {
        // Fallback: just parse next statement
        const node = parseStatement();
        if (node) block.children.push(node);
      }
    } else {
      // Single statement
      const node = parseStatement();
      if (node) block.children.push(node);
    }
    return block;
  }

  function parseStatement(): ASTNode | null {
    if (i >= tokens.length) return null;
    const token = peekToken()!;

    // Loop
    if (isLoopKeyword(token)) {
      consumeToken();
      const node: ASTNode = { type: 'LOOP', children: [], line: token.line, value: 'LOOP' };
      // Skip loop condition
      if (peekToken()?.value === '(') {
        let depth = 0;
        do {
          const t = consumeToken();
          if (t?.value === '(') depth++;
          if (t?.value === ')') depth--;
        } while (i < tokens.length && depth > 0);
      }
      // Python: skip 'in', range, etc until ':'
      if (lang === 'python') {
        skipUntil(t => t.value === ':');
        if (peekToken()?.value === ':') consumeToken();
      }
      node.children.push(collectBlock());
      return node;
    }

    // Conditional
    if (isConditionalKeyword(token)) {
      consumeToken();
      const node: ASTNode = { type: 'IF_STATEMENT', children: [], line: token.line };
      if (peekToken()?.value === '(') {
        let depth = 0;
        do {
          const t = consumeToken();
          if (t?.value === '(') depth++;
          if (t?.value === ')') depth--;
        } while (i < tokens.length && depth > 0);
      } else if (lang === 'python') {
        skipUntil(t => t.value === ':');
        if (peekToken()?.value === ':') consumeToken();
      }
      node.children.push(collectBlock());
      // Check for else
      if (peekToken() && isElseKeyword(peekToken()!)) {
        consumeToken();
        if (lang === 'python' && peekToken()?.value === ':') consumeToken();
        const elseNode: ASTNode = { type: 'ELSE_CLAUSE', children: [], line: peekToken()?.line };
        elseNode.children.push(collectBlock());
        node.children.push(elseNode);
      }
      return node;
    }

    // Function definition
    if (isFunctionDefKeyword(token, lang)) {
      consumeToken();
      const name = consumeToken();
      const node: ASTNode = {
        type: 'FUNCTION_DEF',
        children: [],
        line: token.line,
        value: name?.normalized || 'FUNC',
      };
      // Skip params
      if (peekToken()?.value === '(') {
        let depth = 0;
        do {
          const t = consumeToken();
          if (t?.value === '(') depth++;
          if (t?.value === ')') depth--;
        } while (i < tokens.length && depth > 0);
      }
      if (lang === 'python' && peekToken()?.value === ':') consumeToken();
      node.children.push(collectBlock());
      return node;
    }

    // C/C++/Java function detection: type identifier (
    if (lang !== 'python' && token.type === 'KEYWORD' &&
        ['INT', 'VOID', 'FLOAT', 'DOUBLE', 'CHAR', 'LONG', 'SHORT', 'BOOL', 'STRING', 'BOOLEAN'].includes(token.normalized)) {
      const savedI = i;
      consumeToken(); // type
      if (peekToken()?.type === 'IDENTIFIER' || (peekToken()?.type === 'KEYWORD' && peekToken()?.normalized === 'MAIN')) {
        const name = consumeToken();
        if (peekToken()?.value === '(') {
          const node: ASTNode = {
            type: 'FUNCTION_DEF',
            children: [],
            line: token.line,
            value: name?.normalized || 'FUNC',
          };
          let depth = 0;
          do {
            const t = consumeToken();
            if (t?.value === '(') depth++;
            if (t?.value === ')') depth--;
          } while (i < tokens.length && depth > 0);
          node.children.push(collectBlock());
          return node;
        }
      }
      // Not a function def, restore
      i = savedI;
    }

    // Class
    if (isClassKeyword(token)) {
      consumeToken();
      const name = consumeToken();
      const node: ASTNode = {
        type: 'CLASS_DEF',
        children: [],
        line: token.line,
        value: name?.normalized || 'CLASS',
      };
      // Skip extends/implements
      skipUntil(t => t.value === '{' || t.value === ':');
      if (peekToken()?.value === ':') consumeToken();
      node.children.push(collectBlock());
      return node;
    }

    // Return
    if (isReturnKeyword(token)) {
      consumeToken();
      const node: ASTNode = { type: 'RETURN', children: [], line: token.line };
      skipUntil(t => t.value === ';' || t.value === '\n');
      if (peekToken()?.value === ';') consumeToken();
      return node;
    }

    // Switch
    if (isSwitchKeyword(token)) {
      consumeToken();
      const node: ASTNode = { type: 'SWITCH', children: [], line: token.line };
      if (peekToken()?.value === '(') {
        let depth = 0;
        do {
          const t = consumeToken();
          if (t?.value === '(') depth++;
          if (t?.value === ')') depth--;
        } while (i < tokens.length && depth > 0);
      }
      node.children.push(collectBlock());
      return node;
    }

    // Try-catch
    if (isTryKeyword(token)) {
      consumeToken();
      const node: ASTNode = { type: 'TRY_CATCH', children: [], line: token.line };
      if (lang === 'python' && peekToken()?.value === ':') consumeToken();
      node.children.push(collectBlock());
      return node;
    }

    // Print
    if (isPrintKeyword(token)) {
      consumeToken();
      const node: ASTNode = { type: 'PRINT', children: [], line: token.line };
      skipUntil(t => t.value === ';' || t.value === ')');
      if (peekToken()?.value === ')' || peekToken()?.value === ';') consumeToken();
      return node;
    }

    // Assignment: identifier = expr
    if (token.type === 'IDENTIFIER') {
      const savedI = i;
      consumeToken();
      if (peekToken()?.value === '=' || peekToken()?.value === '+=' ||
          peekToken()?.value === '-=' || peekToken()?.value === '*=' ||
          peekToken()?.value === '/=') {
        consumeToken();
        const node: ASTNode = { type: 'ASSIGNMENT', children: [], line: token.line };
        skipUntil(t => t.value === ';' || t.type === 'KEYWORD');
        if (peekToken()?.value === ';') consumeToken();
        return node;
      }
      // Function call: identifier(
      if (peekToken()?.value === '(') {
        const node: ASTNode = { type: 'FUNCTION_CALL', children: [], line: token.line };
        let depth = 0;
        do {
          const t = consumeToken();
          if (t?.value === '(') depth++;
          if (t?.value === ')') depth--;
        } while (i < tokens.length && depth > 0);
        if (peekToken()?.value === ';') consumeToken();
        return node;
      }
      i = savedI;
    }

    // Variable declaration: keyword identifier
    if (token.type === 'KEYWORD' && ['INT', 'FLOAT', 'DOUBLE', 'CHAR', 'STRING', 'LONG', 'SHORT', 'BOOL', 'BOOLEAN', 'VAR', 'LET', 'CONST', 'AUTO'].includes(token.normalized)) {
      consumeToken();
      const node: ASTNode = { type: 'VARIABLE_DECL', children: [], line: token.line };
      skipUntil(t => t.value === ';' || t.value === '\n');
      if (peekToken()?.value === ';') consumeToken();
      return node;
    }

    // Import
    if (token.type === 'KEYWORD' && (token.normalized === 'IMPORT' || token.normalized === 'FROM' || token.normalized === 'INCLUDE' || token.normalized === 'USING')) {
      consumeToken();
      const node: ASTNode = { type: 'IMPORT', children: [], line: token.line };
      skipUntil(t => t.value === ';' || t.value === '\n');
      if (peekToken()?.value === ';') consumeToken();
      return node;
    }

    // Skip access modifiers
    if (token.type === 'KEYWORD' && ['PUBLIC', 'PRIVATE', 'PROTECTED', 'STATIC', 'FINAL', 'ABSTRACT'].includes(token.normalized)) {
      consumeToken();
      return parseStatement();
    }

    // Skip unknown tokens
    consumeToken();
    return null;
  }

  while (i < tokens.length) {
    const node = parseStatement();
    if (node) root.children.push(node);
  }

  return root;
}

export function flattenAST(node: ASTNode): ASTNodeType[] {
  const result: ASTNodeType[] = [node.type];
  for (const child of node.children) {
    result.push(...flattenAST(child));
  }
  return result;
}

export function getControlFlow(node: ASTNode): string[] {
  const flow: string[] = [];
  function traverse(n: ASTNode) {
    if (['LOOP', 'IF_STATEMENT', 'ELSE_CLAUSE', 'SWITCH', 'TRY_CATCH', 'RETURN', 'BREAK', 'CONTINUE'].includes(n.type)) {
      flow.push(n.type);
    }
    for (const child of n.children) {
      traverse(child);
    }
  }
  traverse(node);
  return flow;
}
