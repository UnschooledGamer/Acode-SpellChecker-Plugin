# Acode Spell Checker Plugin
> update Plugin icon 🙃

A DEAD simple spell checker plugin for the Acode editor.

## Features

*   **On-Demand Spell Check**: Scans the entire current file for spelling errors.
*   **Visual Highlighting**: Misspelled words are underlined in red.
*   **Gutter Indicators**: Lines containing spelling errors are marked in the gutter for easy navigation.

## Usage

1.  Open any file in the editor.
2.  Open the command palette (usually by tapping the three-dot menu).
3.  Select the **"Spell Check"** command.
4.  The plugin will then highlight any misspelled words.

## Supported Languages

Currently, the plugin defaults to **English (US)**.

Support for other languages can be added by placing Hunspell dictionary files (`.dic` and `.aff`) into the plugin's `dictionaries` directory.

## To-Do

*   [ ] Real-time spell checking as you type.
*   [ ] Provide spelling suggestions for corrections.
*   [ ] Ability to add words to a user-defined dictionary.
*   [ ] A settings page to easily switch between installed dictionaries/languages.
*   [ ] Command to clear existing spell-check markers.

---

*This plugin is powered by [typo-js](https://github.com/cfinke/Typo.js).*
