(function (window) {
    /**
     * Производит сравнение по префиксу с учетом раскладок и транслитерации
     * @param prefix {String} - префикс по которому производится поиск
     * @param suggestion {Object} - предложение, котрое нужно проверить
     * @param selectedSuggestions {Array} - уже выбранные предложения
     * @param options {Object} - список опций
     * @param options.byProperty {String} - свойтво по которму производится сравненение
     * @param options.uidProperty {String} - свойтво уникальный идентификатор
     * @returns {Object} - результат поиска
     *    {
     *      matched: {Boolean} - флаг подходит или нет объект под префикс,
     *      matchedBy: {string} - подстрока по которой произошло совпадение
     *    }
     */


    function uiDropDownUsersMatcher(prefix, suggestion, selectedSuggestions, options) {
        // TODO: Скорость работы через регулярные выражения оказалась ниже
        // TODO: Придумать способ повысить эффективность поиска
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