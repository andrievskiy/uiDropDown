/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    var DEFAULT_SUGGESTION_TEMPLATE =
        '<div class="ui-drop-down-multiple-item" data-user-id="{uid}">' +
        '<p>{name::html}</p>' +
        '</div>';

    var DEFAULT_MULTIPLE_SELECTED_ITEM_TEMPLATE =
        '<div class="ui-drop-down-selected-item">' +
        '   <div class="ui-drop-down-selected-name">{name}</div>' +
        '   <a class="ui-drop-down-selected-remove-btn" data-user-id="{uid}" data-is-remove-button="true">x</a>' +
        '</div>';

    var DEFAULT_SINGLE_SELECTED_ITEM_TEMPLATE =
        '<div class="ui-drop-down-single-selected-item">' +
        '    <div class="ui-drop-down-single-selected-name">{name}</div>' +
        '    <a class="ui-drop-down-selected-single-remove-btn" data-user-id="{uid}" data-is-remove-button="true">x</a>'
    '</div>';

    var DEFAULT_OPTIONS = {
        multiple: true,
        suggestionTemplateWithAvatar: DEFAULT_SUGGESTION_TEMPLATE,
        suggestionTemplateWithoutAvatar: DEFAULT_SUGGESTION_TEMPLATE,
        selectedMultipleItemTemplate: DEFAULT_MULTIPLE_SELECTED_ITEM_TEMPLATE,
        selectedSingleItemTemplate: DEFAULT_SINGLE_SELECTED_ITEM_TEMPLATE,
        limit: 10,
        serverSide: false,
        serverSideUrl: '/',
        serverSideMethod: 'GET',
        serverSideFindProperty: 'domain',
        showAvatars: true,
        suggestionIdentifierProperty: 'uid'
    };

    function UiDropDown(selector, options) {
        var self = this;

        options = options || {};

        /**
         * Возравщает список выбранных элементов
         * @returns {Array}
         */
        self.getSelected = function () {
            return Object.keys(self.selectedItems).map(function (key) {
                return self.selectedItems[key];
            });
        };

        self.options = Object.assign({}, DEFAULT_OPTIONS, options);

        self._cache = {};
        self._lastVal = null;

        self._suggestionTemplate = getSuggestionTemplate();
        self._selectedItemTemplate = getSelectedItemTemplate();

        self.inputElement = UiElement(selector);

        self.suggestions = self.options.suggestions || [];
        self.matcher = self.options.matcher || uiDropDownUsersMatcher;

        self.matchedSuggestions = [];
        self._matchesSuggestionIds = Object.create(null);
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

        self._dropDownInputWrapper.on('click', onClickWrapper);

        self._suggestionsWrapper.on('mouseenter', onHoverSuggestionsWrapper);
        self._suggestionsWrapper.on('mouseleave', onMouseLeaveSuggestionsWrapper);

        self._selectedContainer.on('click', onClickSelectedContainer);


        function getSuggestionTemplate() {
            if (self.options.showAvatars) {
                return self.options.suggestionTemplateWithAvatar;
            }
            return self.options.suggestionTemplateWithoutAvatar;
        }

        function getSelectedItemTemplate() {
            if (self.options.multiple) {
                return self.options.selectedMultipleItemTemplate;
            }
            return self.options.selectedSingleItemTemplate;
        }

        function isSelected(item){
            return Boolean(self.selectedItems[item[self.options.suggestionIdentifierProperty]]);
        }

        function addItemToSelected(item){
            self.selectedItems[item[self.options.suggestionIdentifierProperty]] = item;
        }

        function isInMatchedSuggestions(item){
            return Boolean(self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]]);
        }

        function addToMatchedSuggestions(item){
            self.matchedSuggestions.push(item);
            self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]] = true;
        }

        function onClickSelectedContainer(event) {
            var target = event.target;

            if (target.getAttribute('data-is-remove-button') == 'true') {
                removeSelectedSuggestion(target);

                if (!self.getSelected().length) {
                    hideSelectedContainer();
                    activateInputElement();
                }
            } else {
                activateInputElement();
                if (!self.options.multiple) {
                    hideSelectedContainer();
                }
            }

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

        function onClickWrapper(event) {
            if (event.target === this) {
                activateInputElement();
                if (!self.options.multiple) {
                    hideSelectedContainer();
                }
            }
        }

        function onBlurInputElement() {
            if (self._suggestionsWrapper.hovered) {
                return;
            }
            hideSuggestionList();
            if (self.options.multiple && self.getSelected().length) {
                hideInputElement();
            }
        }

        function onHoverSuggestionsWrapper() {
            self._suggestionsWrapper.hovered = true;
        }

        function onMouseLeaveSuggestionsWrapper() {
            self._suggestionsWrapper.hovered = false;
        }


        function _clearLastSelected() {
            Object.keys(self.selectedItems).forEach(function (prop) {
                delete self.selectedItems[prop];
            });
            var children = Array.prototype.slice.apply(self._selectedContainer.element.children);
            children.forEach(function (child) {
                child.parentNode.removeChild(child);
            });

        }

        function onSelectSuggestion(item, element) {
            if (!self.options.multiple) {
                _clearLastSelected();
            }
            addItemToSelected(item);
            element.parentNode.removeChild(element);
            self.inputElement.val('');
            hideSuggestionList();
            renderSelectedSuggestion(item);
            hideInputElement();
            // Соббытие не будет послано брузером. Поэтому нужно простваить руками.
            self._suggestionsWrapper.hovered = false;
            showSelectedContainer();
        }

        function showSelectedContainer() {
            self._selectedContainer.addClass('show');
        }

        function hideSelectedContainer() {
            self._selectedContainer.removeClass('show');
        }

        function hideInputElement() {
            if (self.getSelected().length) {
                self.inputElement.style.display = 'none';
            }
        }

        function activateInputElement() {
            self.inputElement.style.display = 'block';
            self.inputElement.element.focus();
        }


        function createSuggestionWrapper() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-autocomplete-suggestions');
            return element;
        }

        function createDropDownInputWrapper() {
            function setWidth(wrapper) {
                wrapper.style.width = self.inputElement.offsetWidth() + 'px';
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
                inputWrapperCoordinates.bottom + self._dropDownInputWrapper.clientTop() + 'px';

            self._suggestionsWrapper.style.left = inputWrapperCoordinates.left + 'px';

            self._suggestionsWrapper.style.width =
                self._dropDownInputWrapper.offsetWidth() - self._suggestionsWrapper.clientLeft()
                - self._suggestionsWrapper.clientRight() + 'px';
        }

        function clearMatchedSuggestionsList(){
             var children = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);

            children.forEach(function (childNode) {
                self._suggestionsWrapper.removeChild(childNode);
            });
        }

        function renderMatchedSuggestions(append) {
            if (!append) {
               clearMatchedSuggestionsList();
            }
            self.matchedSuggestions.forEach(function (item) {
                self._suggestionsWrapper.append(renderSuggestion(item));
            });
        }


        function renderSuggestion(suggestion) {
            // TODO: Исправить проброс matchedBy
            var matchedBy = suggestion.mathedBy;
            delete suggestion.mathedBy;

            var dropDownItem = DropDownSuggestionItem(self._suggestionTemplate, suggestion, matchedBy);
            dropDownItem.render();
            // TODO: пернести обработчик на suggestion-list. Испрользовать делегирование,
            // TODO: чтообы избавиться от лишних обработчиков
            // TODO: С ходу мешает необходимость ссылки на item(suggestion)
            dropDownItem.uiElement.on('click', function () {
                onSelectSuggestion(suggestion, this);
            });

            return dropDownItem.uiElement.element;
        }


        function removeSelectedSuggestion(element) {
            // TODO: Добавить id. Чтобы не зависеть от верстки
            var uid = element.getAttribute('data-user-id');
            var container = element.parentNode;
            delete self.selectedItems[uid];
            container.parentNode.removeChild(container);

        }

        function renderSelectedSuggestion(suggestion) {
            var selectedItem = DropDownSelectedSuggestionItem(
                self._selectedItemTemplate, suggestion, self.options.multiple
            );
            selectedItem.render();
            self._selectedContainer.append(selectedItem.uiElement);
        }

        function lookup() {
            var counter = 0;
            var idx = 0;
            var val = self.inputElement.val();

            if (val == self._lastVal && val !== '') {
                return;
            }

            self._lastVal = val;
            self.matchedSuggestions = [];
            self._matchesSuggestionIds = Object.create(null);

            if (val === '') {
                while (counter < self.options.limit && idx < self.suggestions.length) {
                    var item = self.suggestions[idx];
                    if (isSelected(item)) {
                        idx++;
                        continue;
                    }

                    addToMatchedSuggestions(item);
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
                if (matchResult.matched) {
                    self.suggestions[idx].mathedBy = matchResult.matchedBy;
                    addToMatchedSuggestions(self.suggestions[idx]);
                    counter++;
                }
                idx++;
            }
            console.timeEnd('lookUp');
            console.log('self.options.serverSide', self.options.serverSide);
            if (self.options.serverSide) {
                serverLookUp(val);
            }
        }

        function appendMatchedSuggestions(suggestions){
           suggestions.forEach(function (suggestion) {
                if(!isSelected(suggestion) && !isInMatchedSuggestions(suggestion)){
                    addToMatchedSuggestions(suggestion);
                    renderMatchedSuggestions(true);
                }
           });
        }

        function onServerLookUpLoaded(prefix, response) {
            self._cache[prefix] = response.result;
            if (response.result.length) {
                appendMatchedSuggestions(response.result);
            }
        }

        function serverLookUp(prefix) {
            if(prefix == ''){
                return;
            }
            var _cached = self._cache[prefix];

            if(_cached){
                appendMatchedSuggestions(_cached);
                return;
            }

            var findData = {};
            findData[self.options.serverSideFindProperty] = prefix;
            uiDropDownajax({
                method: self.options.serverSideMethod,
                url: self.options.serverSideUrl,
                data: findData,
                params: findData,
                onError: function (xrh) {
                    console.log('ERROR', xrh.statusText)
                },
                onSuccess: function(response){
                    onServerLookUpLoaded(prefix, response)
                }
            });
        }

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
                if (callNow) {
                    func.apply(context, args);
                }
            };
        }
    }

    window.UiDropDown = UiDropDown;
})(window);