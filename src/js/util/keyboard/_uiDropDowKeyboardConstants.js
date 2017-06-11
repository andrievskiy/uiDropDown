/**
 * Константы для работы с различными расладками.
 * Используются в uiDropDownKeyBoardUtil
 */
(function (window) {
    'use strict';
    var LATIN_TO_CYRILLIC_KEYBOARD = {
        'q': 'й',
        'w': 'ц',
        'e': 'у',
        'r': 'к',
        't': 'е',
        'y': 'н',
        'u': 'г',
        'i': 'ш',
        'o': 'щ',
        'p': 'з',
        '{': 'х',
        '[': 'х',
        ']': 'ъ',
        '}': 'ъ',
        'a': 'ф',
        's': 'ы',
        'd': 'в',
        'f': 'а',
        'g': 'п',
        'h': 'р',
        'j': 'о',
        'k': 'л',
        'l': 'д',
        ';': 'ж',
        ':': 'ж',
        "'": 'э',
        '"': 'э',
        'z': 'я',
        'x': 'ч',
        'c': 'с',
        'v': 'м',
        'b': 'и',
        'n': 'т',
        'm': 'ь',
        ',': 'б',
        '<': 'б',
        '>': 'ю',
        '.': 'ю'
    };

    var CYRILLIC_TO_LATIN_KEYBOARD = {};

    Object.keys(LATIN_TO_CYRILLIC_KEYBOARD).map(function (key) {
        var k = LATIN_TO_CYRILLIC_KEYBOARD[key];
        CYRILLIC_TO_LATIN_KEYBOARD[k] = key;
    });

    var LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP = {
        'shch': 'щ',
        'sch': 'щ',
        'yo': 'ё',
        'zh': 'ж',
        'kh': 'х',
        'ts': 'ц',
        'ch': 'ч',
        'sh': 'ш',
        'eh': 'э',
        'yu': 'ю',
        'ya': 'я',
        "'": 'ь'
    };

    var CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP = {};

    Object.keys(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP).map(function (key) {
        var k = LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[key];
        CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[k] = key;
    });


    var MULTIPLE_LATIN_CHARS = {
        'y': ['ы', 'ё', 'ю', 'я'],
        'z': ['ж', 'з'],
        'k': ['х', 'к'],
        't': ['ц', 'т'],
        'c': ['ц', 'ч', 'щ'],
        's': ['ш', 'щ', 'с'],
        'e': ['е', 'э']
    };

    var LATIN_ALPHABET = 'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ';
    var CYRILLIC_ALPHABET = 'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ';

    window.uiDropDownKeyboardConstants = {
        LATIN_TO_CYRILLIC_KEYBOARD: LATIN_TO_CYRILLIC_KEYBOARD,
        CYRILLIC_TO_LATIN_KEYBOARD: CYRILLIC_TO_LATIN_KEYBOARD,
        LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP: LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP,
        CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP: CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP,
        MULTIPLE_LATIN_CHARS: MULTIPLE_LATIN_CHARS,
        LATIN_ALPHABET: LATIN_ALPHABET,
        CYRILLIC_ALPHABET: CYRILLIC_ALPHABET
    };

})(window);