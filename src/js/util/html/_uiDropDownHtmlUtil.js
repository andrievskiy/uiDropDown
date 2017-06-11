/**
 * Утилиты для работы с html
 */
(function (window) {

    var ESCAPE_CHARS = {
        '¢': 'cent',
        '£': 'pound',
        '¥': 'yen',
        '€': 'euro',
        '©': 'copy',
        '®': 'reg',
        '<': 'lt',
        '>': 'gt',
        '"': 'quot',
        '&': 'amp',
        '\'': '#39'
    }, regex;

    function _makeRegexpString() {
        var regexString = '[';

        for (var key in ESCAPE_CHARS) {
            regexString += key;
        }
        regexString += ']';

        return regexString;
    }

    regex = new RegExp(_makeRegexpString(), 'g');

    /**
     * Производит экранирование html символов
     * @param str
     * @returns {*}
     */
    function uiDropDownHtmlEscaping(str) {
        if(typeof str != 'string'){
            return str;
        }
        return str.replace(regex, function (m) {
            return '&' + ESCAPE_CHARS[m] + ';';
        });
    }

    window.uiDropDownHtmlEscaping = uiDropDownHtmlEscaping;
})(window);