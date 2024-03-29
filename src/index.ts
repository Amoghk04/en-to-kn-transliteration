import { words } from './corpus';
import freq_dist from './word_counts';
import { getWord } from './utils';

import getCaretCoordinates from 'textarea-caret';
import { numerals } from './schemeMap';
import { transliterate } from './transliterateUtil';
import axios from 'axios';
import { NorvigSpellChecker } from './jspell';

const spellCheck = new NorvigSpellChecker()


/**
 * HTML elements
 */
const inputTextArea = document.getElementById('inputArea') as HTMLTextAreaElement;

const menuDiv = document.getElementById('menuDiv') as HTMLDivElement;
const menuWord = document.getElementById('menuWord') as HTMLDivElement;
const suggestionDivs = document.getElementById('suggestions') as HTMLDivElement;

/**
 * Global constants
 */
const MAX_SUGGESTIONS = 10; // We show max 7 suggestions in the menu

/**
 * Global variables
 */
let _currentWord = "";

type InputEn = string;
type TransliteratedKn = string;
type Pair = [InputEn, TransliteratedKn];
let currentSuggestions: Array<Pair>;

let selectedIndex = 0;



// let caretPosition = getCaretCharacterOffsetWithin(inputTextArea);


// TODO save in cookie (?)

/**
 * Get the caret position, relative to the window 
 * @returns {object} left, top distance in pixels
 */
function getCaretGlobalPosition() {
    const r = document.getSelection()!.getRangeAt(0)
    const node = r.startContainer
    const offset = r.startOffset
    const pageOffset = { x: window.pageXOffset, y: window.pageYOffset }
    let rect, r2;

    if (offset > 0) {
        r2 = document.createRange()
        r2.setStart(node, (offset - 1))
        r2.setEnd(node, offset)
        rect = r2.getBoundingClientRect()
        return { left: rect.right + pageOffset.x, top: rect.bottom + pageOffset.y }
    }
    return { top: NaN, left: NaN }
}

// https://stackoverflow.com/questions/3972014/get-contenteditable-caret-position
// https://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022

function getCaretCharacterOffsetWithin(element: HTMLDivElement) {
    let caretOffset = 0;
    const doc = element.ownerDocument;
    const win = doc.defaultView!;
    const sel = win.getSelection()!;
    if (sel.rangeCount > 0) {
        const range = win.getSelection()!.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    }

    return caretOffset;
}

// https://stackoverflow.com/questions/19038070/html-newline-char-in-div-content-editable
function showPopupMenu() {
    // TODO handle state  of menu
    const caretGlobalPosition = getCaretGlobalPosition();
    // console.log(caretGlobalPosition);
    selectedIndex = 0;
    menuDiv.style.cssText = `display: block;` +
        `top: ${caretGlobalPosition.top}px;` +
        `left: ${caretGlobalPosition.left}px;`;
}

function hidePopupMenu() {
    selectedIndex = 0;
    menuDiv.style.cssText = "display: none;";
}

function convertRemToPixels(rem: number) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const TEXT_FONT_SIZE = convertRemToPixels(1.5)

function updateMenu(word: string) {
    _currentWord = word
    selectedIndex = 0;
    if (word) {
        _updatePopupMenu()
    } else {
        hidePopupMenu()
    }
}

const enToKn: Record<string, string> = {
    "a": "ಎ",
    "b": "ಬಿ",
    "c": "ಸಿ",
    "d": "ಡಿ",
    "e": "ಇ",
    "f": "ಎಫ್",
    "g": "ಜಿ",
    "h": "ಎಚ್",
    "i": "ಐ",
    "j": "ಜೆ",
    "k": "ಕೆ",
    "l": "ಎಲ್",
    "m": "ಎಮ್",
    "n": "ಎನ್",
    "o": "ಓ",
    "p": "ಪಿ",
    "q": "ಕ್ಯು",
    "r": "ಆರ್",
    "s": "ಎಸ್",
    "t": "ಟಿ",
    "u": "ಯು",
    "v": "ವಿ",
    "w": "ಡಬ್ಲ್ಯೂ",
    "x": "ಎಕ್ಸ್",
    "y": "ವೈ",
    "z": "ಝೆಡ್"
}

function possibleSuggestions(englishWord: InputEn): TransliteratedKn[] {
    // console.log('possible', englishWord);
    const corpusTrans = words[englishWord] || []
    // TODO fix transliterate return (return only some)
    // TODO make tests to just run this against some inputs
    const allFuncTrans = transliterate(englishWord);

    //console.log(allFuncTrans);

    const funcTrans = allFuncTrans.slice(0, 5);
    const uniqWords = new Set<string>(
        [...corpusTrans, ...funcTrans]
            .slice(0, MAX_SUGGESTIONS - 1)
    )

    // const funcTrans = [transliterate(englishWord)];

    return Array.from(uniqWords);
}

function _updatePopupMenu() {

    const coordinates = getCaretCoordinates(inputTextArea, inputTextArea.selectionEnd);
    menuDiv.style.display = 'block';
    // inputTextArea.style.fontSize
    const topPixels = inputTextArea.offsetTop - inputTextArea.scrollTop + TEXT_FONT_SIZE
    const leftPixels = inputTextArea.offsetLeft - inputTextArea.scrollLeft

    menuDiv.style.top = topPixels + coordinates.top + 'px';
    menuDiv.style.left = leftPixels + coordinates.left + 'px';

    // innerContent is not supported in old browsers
    menuWord.innerText = _currentWord;

    // TODO refactor below with PROPER code
    // TODO remove slice and let API handle it

    // const englishSuggestions = new Set<string>();

    // TODO first transliterate incorrect English spelling or 

    // TODO remove below line
    // Add words from corpus

    // Object.keys(words)
    //     .filter(
    //         w => _currentWord &&
    //             w.toLowerCase() === _currentWord.toLowerCase()
    //         // w.toLowerCase().startsWith(_currentWord.toLowerCase()) && (w.length - _currentWord.length < 3)
    //     )
    //     .slice(0, MAX_SUGGESTIONS)
    //     .forEach((suggestion) => englishSuggestions.add(suggestion))

    // Add autocorrected words

    const corrections: string[] = spellCheck.correct(2, _currentWord).filter(w => w !== _currentWord) // []

    // console.log("corrections", _currentWord, corrections)

    // corrections.forEach((corrWord) => {
    //     englishSuggestions.add(corrWord)
    // })

    // currentSuggestions = [
    //     [_currentWord, transliterate(_currentWord.toLowerCase())]
    // ] as Array<Pair>


    // searches kn words in corpus and transliterates uncorrected word
    // TODO search using startsWith as well
    const wordToTransliterate = _currentWord.toLowerCase();

    const primarySuggestions = possibleSuggestions(wordToTransliterate)
        // [en] => [ [...[en, kn]] ]
        .map(word => [_currentWord, word])
        // [[en, kn]]
        .slice(0, MAX_SUGGESTIONS - 3);


    const secondarySuggestions = corrections
        .map(en => possibleSuggestions(en).map(word => [en, word]))
        .flat()
        .slice(0, MAX_SUGGESTIONS - 4);
    // TODO enable this only for addresses
    // (freq_dist as Record<string, number>)

    const abbreviation = !(wordToTransliterate in words) && !(wordToTransliterate in freq_dist)
        ? [[
            _currentWord,
            Array.from(wordToTransliterate).map((letter) => enToKn[letter.toLowerCase()] + '.').join('')
        ]]
        : [];


    currentSuggestions = [
        ...primarySuggestions,
        ...secondarySuggestions,
        ...abbreviation
    ] as Array<Pair>;



    /*
    if (englishSuggestions.size === 0) {

        currentSuggestions = transliterate(_currentWord.toLowerCase())
            .map(kn => [_currentWord, kn])
            .slice(0, MAX_SUGGESTIONS) as Array<Pair>



    } else {

        :^)  maaduthidene is not working 

        // const trs = _currentWord.startsWith('m') ? (_: string) => [] : transliterate
        currentSuggestions =(Array.from(englishSuggestions)
            // [en] => [ [...[en, kn]] ]
            .map(en => possibleSuggestions(en).map(word => [en, word]))
            // [[en, kn]]
            .flat()
            .slice(0, MAX_SUGGESTIONS - 3) as Array<Pair> );
    }
    */

    // console.log(_currentWord, currentSuggestions)

    // TODO improve this code
    suggestionDivs.innerHTML = '';
    currentSuggestions.forEach((currentSuggestion, i) => {
        const div = document.createElement('div');
        div.setAttribute('class', 'popupDiv');

        const p = document.createElement('p');
        if (i == 0) {
            p.setAttribute('class', 'selected suggestion');
        } else {
            p.setAttribute('class', 'suggestion');
        }
        const [en, kn] = currentSuggestion;

        const enSpan = document.createElement('span');
        enSpan.innerText = en;
        p.appendChild(enSpan);

        const knSpan = document.createElement('span');
        knSpan.innerText = kn;
        p.appendChild(knSpan);

        div.appendChild(p);

        suggestionDivs.appendChild(div);
    })

    // if (suggestions.length &&
    //     _currentWord.toLowerCase() === englishSuggestions[0].toLowerCase()) {
    //     // this.innerHTML = `${suggestions[0]} ${this.innerHTML.split(' ').slice(0, -1).join(' ')}`
    //     console.log('setting', suggestions[0]);
    // }

}

async function sendDatatoFlask(word: string) {
    try {
        const response = await axios.post('http://localhost:5000', {
            word: word
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error: ', error);
    }
}

const word = "akashavaani";
sendDatatoFlask(word);

function setCurrentWord(event: Event) {
    // if (event.type === 'click') {
    //     console.log((event as MouseEvent).target);
    // }
    if (event.type === 'click' &&
        (event as MouseEvent).target !== inputTextArea) {
        hidePopupMenu();
        return;
    }

    // check if there's any non-whitespace text and then set current word
    if (
        inputTextArea.innerText?.trim() &&
        (_currentWord = getWord()) &&
        _currentWord.trim()
    ) {
        // console.log(_currentWord)
        // update popup menu only if current word is non-empty / undefined
        updateMenu(_currentWord);
        showPopupMenu();
    } else {
        // console.log('hiding')
        hidePopupMenu();
    }
}


function updateTextArea(this: HTMLTextAreaElement, event: KeyboardEvent) {
    // console.log('key:', event.key, selectedIndex);
    event.preventDefault();
    const key = event.key;

    if (key === 'ArrowUp' || key === 'ArrowDown') {

        // console.log(currentSuggestions.length)

        // TODO puneeth , 4 7 suggests
        // if selected index > 5, set to 0 when backspacing
        const currArrLen = currentSuggestions?.length > 0 ?
            currentSuggestions.length - 1 :
            0;
        if (currentSuggestions.length > 1) {
            // only update if number of suggestions > 1
            switch (key) {
                case 'ArrowUp':
                    selectedIndex = selectedIndex === 0 ?
                        selectedIndex :
                        (selectedIndex - 1);
                    break;
                case 'ArrowDown':
                    selectedIndex =
                        selectedIndex === currArrLen ?
                            selectedIndex :
                            (selectedIndex + 1);
                    break;
            }

            // update menu selection
            const suggestions = suggestionDivs.children;
            for (let i = 0; i < suggestions.length; ++i) {
                const p = suggestions[i].firstChild! as HTMLParagraphElement
                if (selectedIndex === i) {
                    p.setAttribute('class', 'selected suggestion')
                } else {
                    p.setAttribute('class', 'suggestion')
                }
            }
        }
    } else if (key === 'Enter' || key === 'Tab' || key === ' ') {
        // TODO space, tab not added

        // console.log(key, this.innerText, _currentWord)

        // TODO correct word before transliterating
        const suggestion = getSuggestion();
        if (suggestion != null) {
            this.value += suggestion + " "

            // console.log(transliterate(_currentWord));

            this.selectionStart = this.value.length;
            _currentWord = ""
            currentSuggestions = [];

        }

        // if (currentSuggestions.length) {
        // console.log(currentSuggestions, currentSuggestions[selectedIndex])

        // }
        hidePopupMenu();

    } else if (key.length === 1 && (/[A-Za-z]/.test(key))) {
        // TODO handle other characters
        // console.log(key, `'${this.innerHTML}'`, `'${key}'`)
        updateMenu(_currentWord + key);
        // showPopupMenu();

    } else if (key === 'Backspace') {
        if (_currentWord === "") {
            this.value = this.value.slice(0, -1);
        }
        updateMenu(_currentWord.slice(0, -1));
    } else if (key === ',') {
        // TODO add dot, etc.
        this.value += ',';
    } else if (/[\d]/.test(key)) {
        // TODO st, th, nd, rd
        const nKey = key as (keyof typeof numerals);
        this.value += numerals[nKey][0];
    }

    // other keydown events will propagate

    // https://stackoverflow.com/questions/3216013/get-the-last-item-in-an-array

    // TODO make this an API ?

    // TODO handle go back and edit prev word

    // TODO make this scalable

    // previousCaretPos += 10;
}


// window.addEventListener('click', setCurrentWord)

inputTextArea.addEventListener('keydown', updateTextArea)

function getSuggestion() {
    if (currentSuggestions.length) {
        return currentSuggestions[selectedIndex] ?
            currentSuggestions[selectedIndex][1] :
            _currentWord;
    }
    return null;
}

// inputTextArea.addEventListener('keyup', setCurrentWord)


// inputTextArea.addEventListener('input', setCurrentWord)
// inputTextArea.addEventListener('keypress', onTextAreaChange);





// 15 characters long in https://gisttransserver.in/

