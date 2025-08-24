import type { WCPage } from "acode/editor/page";
import plugin from '../plugin.json';
import Typo from "typo-js"

class AcodePlugin {
    public baseUrl: string | undefined;
    protected styleMarkerLayer = "<style type='text/css' id='spellMarker'>.ace_marker-layer .misspelled { position: absolute; z-index: -2; border-bottom: 1px solid red; margin-bottom: -1px; }</style>"
    protected styleMisspelledMarker = "<style type='text/css' id='misspelledMarker'>.misspelled { border-bottom: 1px solid red; margin-bottom: -1px; }</style>"
    private currentlySpellChecking = false
    private currentMarkers: number[] = []
    private dictionary: Typo | null = null;

    // Check the spelling of a line, and return [start, end]-pairs for misspelled words.
    public misspelled(line: string) {
        var words = line.split(/[^a-zA-Z\-']/);
        var i = 0;
        var bads = [];
        for (var word in words) {
            var x = words[word] + "";
            var checkWord = x.replace(/[^a-zA-Z\-']/g, '');
            if (!this.dictionary?.check(checkWord)) {
                bads[bads.length] = [i, i + words[word].length];
            }
            i += words[word].length + 1;
        }
        return bads;
    }

    async init($page: WCPage, cacheFile: any, cacheFileUrl: string): Promise<void> {

        console.log(this.baseUrl)
        this.dictionary = new Typo("en_US", null, null, { dictionaryPath: `${this.baseUrl}/dictionaries` });

        editorManager.editor.commands.addCommand({
            name: "Spell Check",
            description: "Spell Check",
            exec: () => {
                const startTime = performance.now()
                this.spellCheckOfFile()
                console.log(performance.now() - startTime)
            },
        })

        document.head.insertAdjacentHTML("beforeend", this.styleMarkerLayer)
        document.head.insertAdjacentHTML("beforeend", this.styleMisspelledMarker)

    }

    spellCheckOfFile() {
        console.log("AcodePlugin :: spell Check", editorManager.activeFile.name);

        const session = editorManager.activeFile.session;

        try {
            var Range = ace.require('ace/range').Range
            var lines = session.getDocument().getAllLines();
            for (var i in lines) {
                // Check spelling of this line.
                //@ts-ignore
                var misspellings = this.misspelled(lines[i]);

                // Add markers and gutter markings.
                if (misspellings.length > 0) {
                    //@ts-ignore
                    session.addGutterDecoration(lines[i], "misspelled");
                }
                for (var j in misspellings) {
                    var range = new Range(i, misspellings[j][0], i, misspellings[j][1]);
                    this.currentMarkers[this.currentMarkers.length] = session.addMarker(range, "misspelled", "text", true);
                }
            }
        } finally {
            this.currentlySpellChecking = false;
            // contents_modified = false;
        }
    }


    async destroy() {
        // Add your cleanup code here
        editorManager.editor.commands.removeCommand({
            name: "Spell Check",
            description: "Spell Check",
            exec: this.spellCheckOfFile,
        })

        document.getElementById("spellMarker")?.remove()
        document.getElementById("misspelledMarker")?.remove()
        console.info("Spell Check cmd removed")
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
            console.error(e)
        }
    });
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}
