(function (window) {
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

        prefixes = uiDropDownKeyBoardUtil.getPrefixVariables(prefix);

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