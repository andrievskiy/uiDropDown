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
    var CYRILLIC_TO_LATIN_KEYBOARD = {};

    Object.keys(LATIN_TO_CYRILLIC_KEYBOARD).map(function (key) {
        var k = LATIN_TO_CYRILLIC_KEYBOARD[key];
        CYRILLIC_TO_LATIN_KEYBOARD[k] = key;
    });


    var LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP = {
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

    var CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP = {};

    Object.keys(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP).map(function (key) {
        var k = LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[key];
        CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[k] = key;
    });

    var MULTIPLE_LATIN_CHARTS = {
        'y': ['ы', 'ё', 'ю', 'я'],
        'z': ['ж', 'з'],
        'k': ['х', 'к'],
        't': ['ц', 'т'],
        'c': ['ц', 'ч',  'щ'],
        's': ['ш', 'щ', 'с'],
        'e': ['е', 'э']
    };

    var LATIN_ALPHABET = 'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ';
    var CYRILLIC_ALPHABET = 'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ';


    function _toCyrillicKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += LATIN_TO_CYRILLIC_KEYBOARD[chart] || chart;
        });

        return result;
    }

    function _toLatinKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += CYRILLIC_TO_LATIN_KEYBOARD[chart] || chart;
        });
        return result;
    }

    /**
     * Получение всех возможных уникальных вариантов для поиска
     *
     * @param prefix
     * @returns {Array}
     * @private
     */
    function _getPrefixVariables(prefix) {
        var variables = [];
        var cyrillicKeyboard;
        var latinKeyboard;

        // Получение всех кирилических вариантов по латинице
        // За счет того, что латиница уже, то одну строку на ней
        // Можжно представить несколькими на кирилице
        // Например: z = ж/z = з
        variables = variables.concat(_latinToCyrillicVariants(prefix));

        // Приведение кириллицы к латинице
        // Например: юа => yoa
        variables.push(_cyrillicToLatinVariants(prefix));


        // Приведение расладок

        cyrillicKeyboard = _toCyrillicKeyboard(prefix);
        latinKeyboard = _toLatinKeyboard(prefix);
        variables.push(cyrillicKeyboard);
        variables.push(latinKeyboard);

        // Транслитерация для раскладок
        // Например: кщпщя -> rogoz -> рогоз
        variables.push(_cyrillicToLatinVariants(cyrillicKeyboard));
        variables = variables.concat(_latinToCyrillicVariants(latinKeyboard));

        // Вывод уникальных валидаторов
        // TODO: Оптимизироввать через set
        variables = variables.filter(function (item, idx, array) {
            return array.indexOf(item) === idx;
        });

        return variables;
    }


    function _latinToCyrillicVariants(str) {
        var variants;
        var charts;

        // Сначала происходит замена "букв" из нескольких символов
        Object.keys(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP).forEach(function (char) {
           str = str.split(char).join(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[char]);
        });

        charts = str.split('');

        variants = _extendVariants(charts);
        variants = variants.map(function (variant) {
            return _replace(variant.join(''));
        });

        return variants;

        /**
         * Производит расширение вариантов для  символов соответствующих нескольким русским буквам
         * при условии что символ находится в конце строки (т.е. невозиожно определить к чему он приводится)
         * @param charts
         * @returns {*[]}
         * @private
         */
        function _extendVariants(charts) {
            var variants = [charts];
            var lastChart = charts[charts.length - 1];
            var chartVariants;

            if(MULTIPLE_LATIN_CHARTS[lastChart]){
                variants = [];
                chartVariants = MULTIPLE_LATIN_CHARTS[lastChart];
                chartVariants.forEach(function (chartVar) {

                    var newVariant = charts.slice(0, charts.length - 1);
                    newVariant.push(chartVar);
                    variants.push(newVariant);
                });
            }
            return variants;
        }

        function _replace(str) {
            for (var i = 0; i < LATIN_ALPHABET.length; i++) {
                str = str.split(LATIN_ALPHABET.charAt(i)).join(CYRILLIC_ALPHABET.charAt(i));
            }
            return str;
        }
    }


    function _cyrillicToLatinVariants(str) {
        // Сначала происходит замена "букв" из нескольких символов
        Object.keys(CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP).forEach(function (char) {
           str = str.split(char).join(CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[char]);
        });

        function _replace(str) {
            for (var i = 0; i < CYRILLIC_ALPHABET.length; i++) {
                str = str.split(CYRILLIC_ALPHABET.charAt(i)).join(LATIN_ALPHABET.charAt(i));
            }
            return str;
        }
        return _replace(str);
    }


    /**
     * Производит сравнение по префиксу с учетом раскладок и транслитерации
     * @param prefix {String}
     * @param suggestion {Object}
     * @param selectedSuggestions {Array}
     * @param options {Object}
     * @param options.byProperty {String} - свойтво по которму производится сравненение
     * @param options.uidProperty {String} - свойтво уникальный идентификатор
     * @returns {Object}
     */
    function uiDropDownUsersMatcher(prefix, suggestion, selectedSuggestions, options) {
        // TODO: произветси оптимизацию поиска
        options = options || { byProperty: 'name', uidProperty: 'uid' };

        var result = {
            matched: false,
            matchedBy: null
        };
        var prefixes, suggestionParts, matched;

        if(selectedSuggestions[suggestion[options.uidProperty]]){
            return result;
        }

        prefix = prefix.trim().toLowerCase();

        prefixes = _getPrefixVariables(prefix);

        suggestionParts = suggestion[options.byProperty].split(' ');

        suggestionParts.push(suggestion[options.byProperty]);

        matched = suggestionParts.some(function (part) {
            var originalPart = part;
            part = part.toLowerCase().trim();

            return prefixes.some(function (prefix) {
                originalPart = originalPart.slice(0, prefix.length);

                var matched =  part.slice(0, prefix.length) === prefix;
                if(matched){
                    result.matchedBy = originalPart;
                }
                return matched;
            });
        });
        result.matched = matched && !selectedSuggestions[suggestion[options.uidProperty]];
        return result;
    }

    window.uiDropDownUsersMatcher = uiDropDownUsersMatcher;
})(window);