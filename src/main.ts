import type { WCPage } from "acode/editor/page";
import plugin from '../plugin.json';
// replaced Typo with harper.js
import { binaryInlined, WorkerLinter } from "harper.js"

class AcodePlugin {
    public baseUrl: string | undefined;
    protected styleMarkerLayer = "<style type='text/css' id='spellMarker'>.ace_marker-layer .misspelled { position: absolute; z-index: -2; border-bottom: 1px solid red; margin-bottom: -1px; }</style>"
    protected styleMisspelledMarker = "<style type='text/css' id='misspelledMarker'>.misspelled { border-bottom: 1px solid red; margin-bottom: -1px; }</style>"
    private currentlySpellChecking = false
    private currentMarkers: number[] = []
    // use a flexible any type for harper instance
    private dictionary: any = null;
    private debounceTimer: number | null = null;
    private readonly DEBOUNCE_DELAY = 500; // ms

    // Check the spelling of a line, and return [start, end]-pairs for misspelled words.
    // harper.js implementations may be sync or async for .check; make this async/robust.
    public async misspelled(line: string): Promise<number[][]> {
        const words = line.split(/([^a-zA-Z\-']+)/);
        let i = 0;
        const bads: number[][] = [];

        for (let j = 0; j < words.length; j++) {
            const word = words[j];
            // Only check actual words (not separators)
            if (/^[a-zA-Z\-']+$/.test(word)) {
                const checkWord = word.replace(/[^a-zA-Z\-']/g, '');
                if (checkWord && this.dictionary) {
                    try {
                        const result = this.dictionary.lint ? this.dictionary.lint(checkWord) : true;
                        console.log(result)
                        // support both sync boolean or Promise<boolean>
                        const isCorrect = await Promise.resolve(result);
                        if (!isCorrect) {
                            bads.push([i, i + word.length]);
                        }
                    } catch (e) {
                        // if check fails, consider it correct to avoid noisy markers
                        console.warn('Spell check failed for', checkWord, e);
                    }
                }
            }
            i += word.length;
        }
        return bads;
    }

    async init($page: WCPage, cacheFile: any, cacheFileUrl: string): Promise<void> {

        console.log(this.baseUrl)
        // instantiate harper; the package may accept (lang, options)
        try {
            // try common constructor signature; keep it permissive
            // @ts-ignore
            this.dictionary = new WorkerLinter({ binary: binaryInlined })

            // harper.js may require an explicit load/init; handle known method names
            // if (this.dictionary.load) {
            //     await this.dictionary.load();
            // } else if (this.dictionary.init) {
            //     await this.dictionary.init();
            // } else if (this.dictionary.ready) {
            //     await this.dictionary.ready();
            // }
        } catch (e) {
            console.error('Failed to initialize harper.js dictionary:', e);
            this.dictionary = null;
        }

        editorManager.editor.commands.addCommand({
            name: "Spell Check",
            description: "Spell Check",
            exec: async () => {
                const startTime = performance.now()
                await this.spellCheckOfFile()
                console.log(performance.now() - startTime)
            },
        });

        // Add real-time spell checking
        const session = editorManager.activeFile.session;
        // @ts-ignore
        session.on('change', () => {
            this.onEditorChange();
        });

        document.head.insertAdjacentHTML("beforeend", this.styleMarkerLayer);
        document.head.insertAdjacentHTML("beforeend", this.styleMisspelledMarker);

    }

    // Handle editor changes with debouncing
    private onEditorChange(): void {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new timer
        // @ts-ignore
        this.debounceTimer = setTimeout(() => {
            // fire-and-forget; function is async
            this.spellCheckVisibleLines();
        }, this.DEBOUNCE_DELAY);
    }

    // Spell check only the visible lines for better performance
    private async spellCheckVisibleLines(): Promise<void> {
        if (this.currentlySpellChecking) return;

        this.currentlySpellChecking = true;

        try {
            const session = editorManager.activeFile.session;
            const Range = ace.require('ace/range').Range;

            // Get visible range
            // @ts-ignore
            const visibleRange = editorManager.editor.renderer.$textLayer.visibleRange || { start: { row: 0 }, end: { row: session.getLength() - 1 } };
            const startRow = Math.max(0, visibleRange.start.row - 5); // Check a few extra lines
            const endRow = Math.min(session.getLength() - 1, visibleRange.end.row + 5);

            // Clear existing markers in visible range
            this.clearMarkersInRange(startRow, endRow);

            // Check spelling for visible lines
            for (let row = startRow; row <= endRow; row++) {
                const line = session.getLine(row);
                const misspellings = await this.misspelled(line);

                // Add markers for misspelled words
                for (const [startCol, endCol] of misspellings) {
                    // @ts-ignore
                    const range = new Range(row, startCol, row, endCol);
                    const markerId = session.addMarker(range, "misspelled", "text", true);
                    this.currentMarkers.push(markerId);
                }
            }
        } finally {
            this.currentlySpellChecking = false;
        }
    }

    // Clear markers in a specific range
    private clearMarkersInRange(startRow: number, endRow: number): void {
        const session = editorManager.activeFile.session;

        // Filter out markers that are in the range
        const markersToKeep: number[] = [];
        for (const markerId of this.currentMarkers) {
            // @ts-ignore
            const marker = session.getMarkers()[markerId];
            if (marker) {
                const markerRow = marker.range?.start.row;
                if (markerRow && (markerRow < startRow || markerRow > endRow)) {
                    markersToKeep.push(markerId);
                } else {
                    session.removeMarker(markerId);
                }
            }
        }
        this.currentMarkers = markersToKeep;
    }

    async spellCheckOfFile(): Promise<void> {
        console.log("AcodePlugin :: spell Check", editorManager.activeFile.name);

        const session = editorManager.activeFile.session;

        try {
            // Clear all existing markers first
            this.clearAllMarkers();

            const Range = ace.require('ace/range').Range;
            const lines = session.getDocument().getAllLines();
            for (let i = 0; i < lines.length; i++) {
                // Check spelling of this line.
                const misspellings = await this.misspelled(lines[i]);

                // Add markers for misspelled words
                for (const [startCol, endCol] of misspellings) {
                    // @ts-ignore
                    const range = new Range(i, startCol, i, endCol);
                    const markerId = session.addMarker(range, "misspelled", "text", true);
                    this.currentMarkers.push(markerId);
                }
            }
        } finally {
            this.currentlySpellChecking = false;
        }
    }

    // Clear all markers
    private clearAllMarkers(): void {
        const session = editorManager.activeFile.session;
        for (const markerId of this.currentMarkers) {
            session.removeMarker(markerId);
        }
        this.currentMarkers = [];
    }


    async destroy(): Promise<void> {
        // Clear any pending debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Remove command
        editorManager.editor.commands.removeCommand({
            name: "Spell Check",
            exec: () => this.spellCheckOfFile(),
        });

        // Clear all markers
        this.clearAllMarkers();

        // Remove styles
        document.getElementById("spellMarker")?.remove();
        document.getElementById("misspelledMarker")?.remove();
        console.info("Spell Check cmd removed");
    }
}

if (window.acode) {
    const acodePlugin = new AcodePlugin();
    acode.setPluginInit(plugin.id, async (baseUrl: string, $page: WCPage, { cacheFileUrl, cacheFile }: any) => {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        acodePlugin.baseUrl = baseUrl;
        try {
            await acodePlugin.init($page, cacheFile, cacheFileUrl);
        } catch (e) {
            console.error(e);
        }
    });
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}
