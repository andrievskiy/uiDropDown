/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    var defaultUiDropDownOptions = {
        limit: 10
    };

    function defaultMatcher(val, suggestion, selected) {
        val = val.trim().toLowerCase();
        var suggestionParts = suggestion.name.split(' ');

        var matched = suggestionParts.some(function (part) {
            return part.toLowerCase().slice(0, val.length) === val;
        });
        return matched && !selected[suggestion.uid];
    }

    function UiDropDown(selector, options) {
        var self = this;
        options = options || defaultUiDropDownOptions;
        this.element = UiElement(selector);
        this.suggestions = options.suggestions || [];
        this.options = options;
        this.matcher = options.matcher || defaultMatcher;

        this.matchedSuggestions = [];
        this.selectedItems = {};


        this._dropDownInputWrapper = createDropDownInputWrapper();
        this._suggestionsWrapper = createSuggestionWrapper();

        this.element.wrap(this._dropDownInputWrapper);

        this._dropDownInputWrapper.element.appendChild(this._suggestionsWrapper.element);

        this.element.on('focus', function () {
            lookup();
            showSuggestionList();
            renderMatchedItems();
        });

        this.element.on('keyup', function () {
            lookup();
            renderMatchedItems();
        });

        function createSuggestionWrapper() {
            var element = UiElement(document.createElement('div'));
            var span = document.createElement('span');
            element.element.appendChild(span);

            element.addClass('ui-drop-down-autocomplete-suggestions');
            return element;
        }

        function createDropDownInputWrapper() {
            var element = UiElement(document.createElement('div'));
            element.addClass('ui-drop-down-input-wrapper');
            return element;
        }

        function showSuggestionList() {
            self._suggestionsWrapper.addClass('show');
            positionSuggestionList();
        }


        // @TODO: Сделать правильное закрытие
        function hideSuggestionList() {
            self._suggestionsWrapper.removeClass('show');
        }

        function positionSuggestionList() {
            var inputWrapperCoordinates = self._dropDownInputWrapper.getCoordinates();

            self._suggestionsWrapper.element.style.top =
                inputWrapperCoordinates.bottom + self._dropDownInputWrapper.clientTop() + 'px';

            self._suggestionsWrapper.element.style.left = inputWrapperCoordinates.left + 'px';

            self._suggestionsWrapper.element.style.width =
                self.element.offsetWidth() - self._suggestionsWrapper.clientLeft()
                - self._suggestionsWrapper.clientRight() + 'px';
        }

        function renderMatchedItems() {
            var children = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);
            children.forEach(function (childNode) {
                self._suggestionsWrapper.element.removeChild(childNode);
            });

            self.matchedSuggestions.forEach(function (item) {
                self._suggestionsWrapper.element.appendChild(renderItem(item));
            });
        }

        function renderItem(item) {
            var element = document.createElement('div');
            element.innerHTML = '<div class="item">' + item.name + '</div>';
            element.id = item.uid;

            // TODO: разобрать на методы. Добавить setter val на uiElement
            element.addEventListener('click', function () {
                self.selectedItems[item.uid] = item;
                this.parentNode.removeChild(this);
                self.element.element.value = '';
                hideSuggestionList();
            });
            return element;
        }

        function lookup() {
            // @TODO: Оптимизировать поиск при пустом запоросе
            var val = self.element.val();
            self.matchedSuggestions = [];
            self.matchedSuggestions = self.suggestions.filter(function (suggestion) {
                return self.matcher(val, suggestion, self.selectedItems);
            });
            // Если пустой запрос необходимо ограничить количество елементов, чтобы не происходила всавка в DOM
            if(val === ''){
                self.matchedSuggestions.splice(self.options.limit);
            }

        }

    }

    window.UiDropDown = UiDropDown;
})(window);