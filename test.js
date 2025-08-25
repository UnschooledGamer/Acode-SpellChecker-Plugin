import { writeFileSync } from "fs";

// Base 50 seed lines
const baseLines = [
	"Thiss line has a speling error.",
	"The quick brown fox jumps over the lazy dog.",
	"I liek to write cod everyday.",
	"Spellchecker should detect mispelled wrds.",
	"This sentence is perfectly fine.",
	"Teh rain in spain falls mainly on the plain.",
	"Correct spelling is important in proffesional writing.",
	"The computar is running very smoothly.",
	"Some words arre repeated repeated incorrectly.",
	"English has many weird spellings.",
	"Datta integrity is crucial in databases.",
	"Som people forget double letters like accomodate.",
	"Beutiful day outside with sunshine.",
	"The sun set slowly behind the mountan.",
	"This is a CORRECTLY capitalized sentence.",
	"Check for RANDOM capitalization Errors here.",
	"Typing fast can cause speeling mistakes.",
	"I have recieve the package today.",
	"Simple sentnce with missng vowels.",
	"12345 testnumbers insideaword987.",
	"Punctuation,test,case,without,spaces.",
	"Omg!!!! Too many exclamationsssss.",
	"Thisss worrrd shouldd be flaged.",
	"CamelCaseWordShouldBeTested.",
	"testCASEwithMixedUPletters.",
	"LOWERCASE all correct words here.",
	"UPPERCASE ALLCORRECTWORDS TOO.",
	"MixEd CaSe WIT out Sense.",
	"Numberslike2fastshouldbeseparated.",
	"The differnce between there and their.",
	"Weather or wether the words matter.",
	"Thay went to the store yesterday.",
	"She doesnt know how to spel \"necessary\".",
	"Some ppl use txt spk 4 chatting.",
	"CreativeInventedWoordForTesting.",
	"An extraaa a at the endd.",
	"Wordswith—unusual—dashes—inside.",
	"Odd’s use of apostrophe’s wrongly.",
	"End with a question markk??",
	"Colons: are: used: incorrectlyy:",
	"Quote without ending mark “Example.",
	"Sentence has no ending period",
	"Random gibber: asdlfkj qweorui mnzx.",
	"Coffeee tastes bettr in the morning.",
	"Definately is a common misspelling.",
	"She beleives in her abilitiess.",
	"Occured twice in thiss doccumnt.",
	"Freindship is spelt incorectly.",
	"Finally, the lasst line is done."
];

let allLines = [];

// Expand to 500 total (10 variations of the 50 seeds)
for (let i = 0; i < 10; i++) {
	for (const base of baseLines) {
		let variant = base;
		if (i > 0) {
			// Add variation on each repeat
			if (i % 2 === 0) variant = variant.toUpperCase();
			if (i % 3 === 0) variant = variant + " ###";
			if (i % 4 === 0) variant = variant.replace(/s/g, "ss");
		}
		allLines.push(variant);
	}
}

// Now build explicit TypeScript file
let output = `// spellchecker_test.ts\n`;
output += `// Auto-generated: 500 literal lines for spellchecker test\n\n`;
output += `export const testLines: string[] = [\n`;

allLines.forEach((line, idx) => {
	output += `  ${JSON.stringify(line)}${idx < allLines.length - 1 ? "," : ""}\n`;
});

output += `];\n`;

// Write file
writeFileSync("spellchecker_test.ts", output, "utf8");

console.log("✅ Generated spellchecker_test.ts with", allLines.length, "lines.");

