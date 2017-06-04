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

    var latinToCyrillicFirstMap = {
        'yo': 'ё',
        'zh': 'ж',
        'kh': 'х',
        'ts': 'ц',
        'ch': 'ч',
        'sch': 'щ',
        'shch': 'щ',
        'sh': 'ш',
        'eh': 'э',
        'yu': 'ю',
        'ya': 'я',
        "'": 'ь'
    };

    var multipleLatinChars = {
        'z': ['ж', 'з'],
        'c': ['ц', 'ч']
    };


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

    function _latinToCyrillicVariants(str) {
        var variants;
        // Replace first special "big" symbols
        Object.keys(latinToCyrillicFirstMap).forEach(function (char) {
           str = str.split(char).join(latinToCyrillicFirstMap[char]);
        });
        var charts = str.split('');

        variants = _extendVariants([charts], 0, charts.length);
        variants = variants.map(function (variant) {
            return _replace(variant.join(''));
        });

        return variants;


        function _extendVariants(variants, idx, len) {
            if(idx == len){
                return variants;
            }
            var extended = [];
            variants.forEach(function (variant) {
                var currentChart = variant[idx];
                if(multipleLatinChars[currentChart]){
                    multipleLatinChars[currentChart].forEach(function (chart) {
                        var v =variant.slice();
                        v[idx] = chart;
                        extended.push(v);
                    });
                }
            });
            if(!extended.length){
                extended = variants;
            }
            return _extendVariants(extended, idx+1, len);
        }

        function _replace(str) {
            var latinAlphabet = 'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ';
            var rusAlphabet = 'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ';
            for (var i = 0; i < latinAlphabet.length; i++) {
                str = str.split(latinAlphabet.charAt(i)).join(rusAlphabet.charAt(i));
            }
            return str;
        }
    }


    window.uiDropDownUsersMatcher = uiDropDownUsersMatcher;
})(window);