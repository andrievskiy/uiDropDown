/**
 * Модуль для работы с вариантами различных расладок.
 * Осуществляет поиск всех возможных преставлений строки.
 * Например кщпщя -> rogoz -> рогоз
 *
 */
(function (window) {
    'use strict';

    /**
     * Производит сортировку по длине строки.
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    function _sortKeysComparator(a, b) {
        if (a.length < b.length) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        return 0;
    }

    function _replaceAlaphabet(str, srcAlphabet, dstAlphabet) {
        for (var i = 0; i < srcAlphabet.length; i++) {
            str = str.split(srcAlphabet.charAt(i)).join(dstAlphabet.charAt(i));
        }
        return str;
    }

    /**
     * _latinToCyrillicVariants -> возвращает возможные варианты раскладки для латнских букв по строке
     * @param str {string}
     * @returns {Array}
     * @private
     */
    function _latinToCyrillicVariants(str) {

        var variants;
        var chars;
        var firstChars;

        // Сначала происходит замена "букв" из нескольких символов

        firstChars = Object.keys(uiDropDownKeyboardConstants.LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP);
        firstChars.sort(_sortKeysComparator);
        firstChars.forEach(function (char) {
            str = str.split(char).join(uiDropDownKeyboardConstants.LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[char]);
        });

        chars = str.split('');
        variants = _extendVariants(chars);

        variants = variants.map(function (variant) {
            return _replaceAlaphabet(
                variant.join(''), uiDropDownKeyboardConstants.LATIN_ALPHABET, uiDropDownKeyboardConstants.CYRILLIC_ALPHABET
            );
        });

        return variants;


        /**
         * Производит расширение вариантов для  символов соответствующих нескольким русским буквам
         * при условии что символ находится в конце строки (т.е. невозиожно определить к чему он приводится)
         * @param chars {string}
         * @returns {Array}
         * @private
         */
        function _extendVariants(chars) {
            var variants = [chars];
            var lastChart = chars[chars.length - 1];
            var chartVariants;

            if (uiDropDownKeyboardConstants.MULTIPLE_LATIN_CHARS[lastChart]) {
                variants = [];
                chartVariants = uiDropDownKeyboardConstants.MULTIPLE_LATIN_CHARS[lastChart];
                chartVariants.forEach(function (chartVar) {

                    var newVariant = chars.slice(0, chars.length - 1);
                    newVariant.push(chartVar);
                    variants.push(newVariant);
                });
            }
            return variants;
        }
    }


    function _cyrillicToLatinVariants(str) {

        var firstChars = Object.keys(uiDropDownKeyboardConstants.CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP);
        firstChars.sort(_sortKeysComparator);

        // Сначала происходит замена "букв" из нескольких символов
        firstChars.forEach(function (char) {
            str = str.split(char).join(uiDropDownKeyboardConstants.CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[char]);
        });

        var variant = _replaceAlaphabet(str, uiDropDownKeyboardConstants.CYRILLIC_ALPHABET, uiDropDownKeyboardConstants.LATIN_ALPHABET);

        return [variant];
    }


    /**
     * toCyrillicKeyboard -> Производит замену латинской раскладки на кириллицу
     * @param str {string}
     * @returns {string}
     */
    function toCyrillicKeyboard(str) {
        var result = '';
        var chars = str.split('');
        chars.forEach(function (chart) {
            result += uiDropDownKeyboardConstants.LATIN_TO_CYRILLIC_KEYBOARD[chart] || chart;
        });

        return result;
    }

    /**
     * toLatinKeyboard -> Производит замену кириллической раскладки на латинскую
     * @param str {string}
     * @returns {string}
     */
    function toLatinKeyboard(str) {
        var result = '';
        var chars = str.split('');
        chars.forEach(function (chart) {
            result += uiDropDownKeyboardConstants.CYRILLIC_TO_LATIN_KEYBOARD[chart] || chart;
        });
        return result;
    }


    /**
     * getPrefixVariables -> Возвращает все варианты представления по строке
     *
     * @param prefix {string}
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
        // Например: z = ж | z = з

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
        variables = variables.filter(function (item, idx, array) {
            return array.indexOf(item) === idx;
        });

        return variables;
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