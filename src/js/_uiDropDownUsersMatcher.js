(function (window) {
    'use strict';

    var latinToCyrillicKeyBoard = {
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
        "'": 'э',
        'z': 'я',
        'x': 'ч',
        'c': 'с',
        'v': 'м',
        'b': 'и',
        'n': 'т',
        'm': 'ь',
        ',': 'б',
        '.': 'ю'
    };
    var cyrillicToLatinKeyBoard = {};


    Object.keys(latinToCyrillicKeyBoard).map(function (key) {
        var k = latinToCyrillicKeyBoard[key];
        cyrillicToLatinKeyBoard[k] = key;
    });

    function uiDropDownUsersMatcher(prefix, suggestion, selectedSuggestions) {
        prefix = prefix.trim().toLowerCase();
        var prefixes = _getPrefixVariables(prefix);
        var suggestionParts = suggestion.name.split(' ');
        var matched = suggestionParts.some(function (part) {
            return prefixes.some(function (prefix) {
                return part.toLowerCase().slice(0, prefix.length) === prefix;
            });
        });
        return matched && !selectedSuggestions[suggestion.uid];
    }

    function _toCyrillicKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += latinToCyrillicKeyBoard[chart] || chart;
        });

        return result;
    }

    function _toLatinKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += cyrillicToLatinKeyBoard[chart] || chart;
        });
        return result;
    }

    function _getPrefixVariables(prefix) {
        var variables = [];
        variables.push(_toCyrillicKeyboard(prefix));
        variables.push(_toLatinKeyboard(prefix));

        return variables;
    }

    window.uiDropDownUsersMatcher = uiDropDownUsersMatcher;
})(window);