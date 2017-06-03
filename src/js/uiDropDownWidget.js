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
        this.options.itemTemplate = '<div class="ui-item" id="{uid}"><span>{name}</span></div>';

        this.matchedSuggestions = [];
        this.selectedItems = {};

        this._dropDownInputWrapper = createDropDownInputWrapper();
        this._suggestionsWrapper = createSuggestionWrapper();

        this.element.wrap(this._dropDownInputWrapper);

        this._dropDownInputWrapper.element.appendChild(this._suggestionsWrapper.element);

        // Handlers
        this.element.on('focus', onFocusHandler);
        this.element.on('keyup', onKeyUpHandler);


        function onFocusHandler() {
            lookup();
            showSuggestionList();
            renderMatchedItems();
        }

        function onKeyUpHandler() {
            lookup();
            renderMatchedItems();
        }

        // Logic

        function createSuggestionWrapper() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-autocomplete-suggestions');
            return element;
        }

        function createDropDownInputWrapper() {
            var element = UiElement.create('div');
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

        /**
         * Прозводит позиционирование блока предложений относительно эелемента
         */
        function positionSuggestionList() {
            var inputWrapperCoordinates = self._dropDownInputWrapper.getCoordinates();

            self._suggestionsWrapper.style.top =
                inputWrapperCoordinates.bottom + self._dropDownInputWrapper.clientTop() + 'px';

            self._suggestionsWrapper.style.left = inputWrapperCoordinates.left + 'px';

            self._suggestionsWrapper.style.width =
                self.element.offsetWidth() - self._suggestionsWrapper.clientLeft()
                - self._suggestionsWrapper.clientRight() + 'px';
        }

        function renderMatchedItems() {
            var children = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);

            children.forEach(function (childNode) {
                self._suggestionsWrapper.removeChild(childNode);
            });

            self.matchedSuggestions.forEach(function (item) {
                self._suggestionsWrapper.element.appendChild(renderItem(item));
            });
        }

        function renderItem(item) {
            var element = DropDownItem(self.options.itemTemplate, item);
            element.render();

            // TODO: разобрать на методы. Добавить setter val на uiElement
            element.element.on('click', function () {
                self.selectedItems[item.uid] = item;
                this.parentNode.removeChild(this);
                self.element.val('');
                hideSuggestionList();
            });
            // @TODO:  Fix it.
            return element.element.element;
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