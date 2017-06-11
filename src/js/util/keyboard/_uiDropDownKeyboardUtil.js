/**
 * Created by andrievskiy on 11.06.17.
 */
(function (window) {
    'use strict';

    // Constants

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


    var MULTIPLE_LATIN_CHARTS = {
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


    function _sortKeysComparator(a, b) {
        if (a.length < b.length) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        return 0;
    }

    // Methods

    function toCyrillicKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += LATIN_TO_CYRILLIC_KEYBOARD[chart] || chart;
        });

        return result;
    }

    function toLatinKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += CYRILLIC_TO_LATIN_KEYBOARD[chart] || chart;
        });
        return result;
    }

    /**
     * getPrefixVariables -> Возвращает все варианты представления по строке
     *
     * @param prefix
     * @returns {Array}
     * @private
     */
    function getKeyboardsVariables(prefix) {
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
        variables.concat(_cyrillicToLatinVariants(prefix));

        // Приведение расладок

        cyrillicKeyboard = toCyrillicKeyboard(prefix);
        latinKeyboard = toLatinKeyboard(prefix);
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
        var chars;
        var firstChars;

        // Сначала происходит замена "букв" из нескольких символов

        firstChars = Object.keys(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP);
        firstChars.sort(_sortKeysComparator);

        firstChars.forEach(function (char) {
            str = str.split(char).join(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[char]);
        });


        chars = str.split('');

        variants = _extendVariants(chars);
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

            if (MULTIPLE_LATIN_CHARTS[lastChart]) {
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

        var firstChars = Object.keys(CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP);
        firstChars.sort(_sortKeysComparator);

        // Сначала происходит замена "букв" из нескольких символов
        firstChars.forEach(function (char) {
            str = str.split(char).join(CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[char]);
        });

        function _replace(str) {
            for (var i = 0; i < CYRILLIC_ALPHABET.length; i++) {
                str = str.split(CYRILLIC_ALPHABET.charAt(i)).join(LATIN_ALPHABET.charAt(i));
            }
            return str;
        }

        return [_replace(str)];
    }

    /**
     * Набор утилит для работы с раскладкми.
     * toCyrillicKeyboard -> Производит замену латинской раскладки на кириллицу
     * toLatinKeyboard -> Производит замену кириллической раскладки на латиницу
     * getPrefixVariables -> Возвращает все варианты представления по строке
     * @type {{toCyrillicKeyboard: toCyrillicKeyboard, toLatinKeyboard: toLatinKeyboard, getPrefixVariables: getKeyboardsVariables}}
     */
    window.uiDropDownKeyBoardUtil = {
        toCyrillicKeyboard: toCyrillicKeyboard,
        toLatinKeyboard: toLatinKeyboard,
        getPrefixVariables: getKeyboardsVariables
    };
})(window);