var Typo = require("typo-js");
var dictionary = new Typo("en_US");

var is_spelled_correctly = dictionary.check("mispelled thae ma");

console.log("Is 'mispelled' spelled correctly? " + is_spelled_correctly);

var is_spelled_correctly = dictionary.check("misspelled");

console.log("Is 'misspelled' spelled correctly? " + is_spelled_correctly);
console.log("mispelled thae ma".replace(/[^a-zA-Z\-']/g, ""));
var array_of_suggestions = dictionary.suggest("mispelledthatme")

console.log("Spelling suggestions for 'mispeling': " + array_of_suggestions.join(', '));
