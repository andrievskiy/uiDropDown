/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    var defaultUiDropDownOptions = {
        limit: 20
    };

    function UiDropDown(selector, options) {
        var self = this;
        self.cache = {};

        options = options || defaultUiDropDownOptions;

        self.lastVal = null;
        self.inputElement = UiElement(selector);
        self.suggestions = options.suggestions || [];
        self.options = options;
        self.matcher = options.matcher || uiDropDownUsersMatcher;

        self.options.itemTemplate =
            '<div class="ui-drop-down-multiple-item" data-user-id="{data.id}">' +
            '   <p>{name::html}</p>' +
            '</div>';

        self.options.selectedItemTemplae =
            '<div class="ui-drop-down-selected-item">' +
            '   <div class="ui-drop-down-selected-name">{name}</div>' +
            '   <a class="ui-drop-down-slected-remove" data-user-id="{data.uid}" data-is-remove-button="true">X</a>' +
            '</div>';

        self.matchedSuggestions = [];
        self.selectedItems = Object.create(null);

        self._dropDownInputWrapper = createDropDownInputWrapper();
        self._suggestionsWrapper = createSuggestionWrapper();
        self._selectedContainer = createSelectedSuggestionsContainer();

        self.inputElement.wrap(self._dropDownInputWrapper);
        self._dropDownInputWrapper.append(self._suggestionsWrapper.element);
        self._dropDownInputWrapper.element.insertBefore(self._selectedContainer.element, self.inputElement.element);

        self.inputElement.on('focus', onFocusInputHandler);
        self.inputElement.on('keyup', deBounce(onKeyUpInputHandler, 300));
        self.inputElement.on('blur', onBlurInputElement);

        self._dropDownInputWrapper.on('click', onWrapperClick);

        self._suggestionsWrapper.on('mouseenter', onHoverSuggestionsWrapper);
        self._suggestionsWrapper.on('mouseleave', onMouseLeaveSuggestionsWrapper);

        self.getSelected = function () {
            return Object.keys(self.selectedItems).map(function (key) {
                return self.selectedItems[key];
            });
        };

        function deBounce(func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }


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
            if (event.target === this) {
                self.inputElement.element.focus();
            }
        }

        function onBlurInputElement() {
            if (self._suggestionsWrapper.hovered) {
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
                self._suggestionsWrapper.append(renderSuggestion(item));
            });
        }

        function renderSuggestion(suggestion) {
            // TODO: Исправить проброс matchedBy
            var matchedBy = suggestion.mathedBy;
            delete suggestion.mathedBy;

            var dropDownItem = DropDownSuggestionItem(self.options.itemTemplate, suggestion, matchedBy);
            dropDownItem.render();

            // TODO: разобрать на отдельные методы. Добавить setter val на uiElement
            // TODO: пернести обработчик на suggestion-list. Испрользовать делегирование,
            // TODO: чтообы избавиться от лишних обработчиков
            // TODO: С ходу мешает необходимость ссылки на item(suggestion)
            dropDownItem.uiElement.on('click', function () {
                onSelectSuggestion(suggestion, this);
            });

            return dropDownItem.uiElement.element;
        }

        function lookup() {
            var counter = 0;
            var idx = 0;
            var val = self.inputElement.val();

            if (val == self.lastVal && val !== '') {
                return;
            }

            self.lastVal = val;
            self.matchedSuggestions = [];

            if (val === '') {
                while (counter < self.options.limit && idx < self.suggestions.length) {
                    var item = self.suggestions[idx];
                    if (self.selectedItems[item.uid]) {
                        idx++;
                        continue;
                    }
                    self.matchedSuggestions.push(item);
                    counter++;
                    idx++;
                }
                return;
            }

            console.time('lookUp');
            idx = 0;
            counter = 0;
            while (counter < self.options.limit && idx < self.suggestions.length) {
                var matchResult = self.matcher(val, self.suggestions[idx], self.selectedItems);
                if(matchResult.matched){

                    self.suggestions[idx].mathedBy = matchResult.matchedBy;
                    self.matchedSuggestions.push(self.suggestions[idx]);
                    counter++;
                }
                idx++;
            }
            console.timeEnd('lookUp');
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
            element.html(uiRenderTemplate(self.options.selectedItemTemplae, suggestion));
            self._selectedContainer.append(element.element);
        }
    }

    window.UiDropDown = UiDropDown;
})(window);