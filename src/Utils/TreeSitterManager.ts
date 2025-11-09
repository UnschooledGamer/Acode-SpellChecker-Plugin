// Use web-tree-sitter instead of native tree-sitter
import { Parser, Language, Query } from 'web-tree-sitter';

class TreeSitterManager {
    parsers: Map<string, Parser> = new Map();
    async initializeParsers() {
        await Parser.init();

        const jsParser = new Parser();
        const jsLanguage = await Language.load("../../node_modules/tree-sitter-javascript/tree-sitter-javascript.wasm");
        jsParser.setLanguage(jsLanguage);

        this.parsers.set('javascript', jsParser);
    }
}

export default TreeSitterManager;
