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

    function uiDropDownHtmlEscaping(str) {
        return str.replace(regex, function (m) {
            return '&' + ESCAPE_CHARS[m] + ';';
        });
    }

    window.uiDropDownHtmlEscaping = uiDropDownHtmlEscaping;
})(window);