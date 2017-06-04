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

        self.inputElement = UiElement(selector);
        self.suggestions = options.suggestions || [];
        self.options = options;
        self.matcher = options.matcher || defaultMatcher;
        // @TODO: Добавить подсветку префиксов
        self.options.itemTemplate = '<div class="ui-item" id="{uid}"><span>{name}</span></div>';

        self.matchedSuggestions = [];
        self.selectedItems = Object.create(null); // Empty map

        self._dropDownInputWrapper = createDropDownInputWrapper();
        self._suggestionsWrapper = createSuggestionWrapper();
        self._selectedContainer = createSelectedSuggestionsContainer();

        self.inputElement.wrap(self._dropDownInputWrapper);
        self._dropDownInputWrapper.append(self._suggestionsWrapper.element);
        self._dropDownInputWrapper.element.insertBefore(self._selectedContainer.element, self.inputElement.element);


        self.inputElement.on('focus', onFocusInputHandler);
        self.inputElement.on('keyup', onKeyUpInputHandler);
        self.inputElement.on('blur', onBlurInputElement);

        self._dropDownInputWrapper.on('click', onWrapperClick);

        self._suggestionsWrapper.on('mouseover', onHoverSuggestionsWrapper);
        self._suggestionsWrapper.on('mouseleave', onMouseLeaveSuggestionsWrapper);

        self.getSelected = function () {
            return Object.keys(self.selectedItems).map(function (key) {
                return self.selectedItems[key];
            });
        };


        function onFocusInputHandler() {
            lookup();
            showSuggestionList();
            renderMatchedSuggestions();
        }

        function onKeyUpInputHandler() {
            lookup();
            renderMatchedSuggestions();
        }

        function onWrapperClick(event) {
            if(event.target === this){
                self.inputElement.element.focus();
            }
        }

        function onBlurInputElement() {
            if(self._suggestionsWrapper.hovered){
                return;
            }
            hideSuggestionList();
        }

        function onHoverSuggestionsWrapper() {
            self._suggestionsWrapper.hovered = true;
        }

        function onMouseLeaveSuggestionsWrapper() {
            self._suggestionsWrapper.hovered = false;
        }


        function createSuggestionWrapper() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-autocomplete-suggestions');
            return element;
        }

        function createDropDownInputWrapper() {
            function setWidth(wrapper) {
                wrapper.style.width = self.inputElement.clientWidth() + 'px';
            }

            var element = UiElement.create('div');
            element.addClass('ui-drop-down-input-wrapper');
            setWidth(element);

            return element;
        }

        function createSelectedSuggestionsContainer() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-selected-container');

            return element;
        }

        function showSuggestionList() {
            self._suggestionsWrapper.addClass('show');
            positionSuggestionList();
        }

        function hideSuggestionList() {
            self._suggestionsWrapper.removeClass('show');
        }

        /**
         * Прозводит позиционирование блока предложений относительно эелемента
         */
        function positionSuggestionList() {
            var inputWrapperCoordinates = self._dropDownInputWrapper.getCoordinates();

            self._suggestionsWrapper.style.top =
                inputWrapperCoordinates.bottom + self.inputElement.clientTop() + 'px';

            self._suggestionsWrapper.style.left = inputWrapperCoordinates.left + 'px';

            self._suggestionsWrapper.style.width =
                self.inputElement.offsetWidth() - self._suggestionsWrapper.clientLeft()
                - self._suggestionsWrapper.clientRight() + 'px';
        }


        function renderMatchedSuggestions() {
            var children = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);

            children.forEach(function (childNode) {
                self._suggestionsWrapper.removeChild(childNode);
            });

            self.matchedSuggestions.forEach(function (item) {
                self._suggestionsWrapper.element.appendChild(renderSuggestion(item));
            });
        }

        function renderSuggestion(suggestion) {
            var element = DropDownItem(self.options.itemTemplate, suggestion);
            element.render();

            // TODO: разобрать на методы. Добавить setter val на uiElement
            element.element.on('click', function () {
                onSelectSuggestion(suggestion, this);
            });
            // @TODO:  Fix it.
            return element.element.element;
        }

        function lookup() {
            // @TODO: Оптимизировать поиск при пустом запоросе
            var val = self.inputElement.val();
            self.matchedSuggestions = [];
            self.matchedSuggestions = self.suggestions.filter(function (suggestion) {
                return self.matcher(val, suggestion, self.selectedItems);
            });
            // Если пустой запрос необходимо ограничить количество елементов, чтобы не происходила всавка в DOM
            if(val === ''){
                self.matchedSuggestions.splice(self.options.limit);
            }
        }

        function onSelectSuggestion(item, element) {
            self.selectedItems[item.uid] = item;
            element.parentNode.removeChild(element);
            self.inputElement.val('');
            hideSuggestionList();
            renderSelectedSuggestion(item);
        }

        function renderSelectedSuggestion(suggestion) {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-selected-suggestion');
            element.html(suggestion.name);
            self._selectedContainer.append(element.element);
        }
    }

    window.UiDropDown = UiDropDown;
})(window);