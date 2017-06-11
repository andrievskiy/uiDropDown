;(function (window) {
    var DEFAULT_SUGGESTION_TEMPLATE =
        '<div class="ui-drop-down-suggestion-item" data-user-id="{uid}">' +
        '   <img class="ui-drop-down-suggestion-item-avatar" src="{avatarUrl}">' +
        '   <label class="ui-drop-down-suggestion-item-name">{name::html}</label>' +
        '   <span class="ui-drop-down-suggestion-item-extra">{extra}</span>' +
        '</div>';

    var DEFAULT_SUGGESTION_TEMPLATE_WITHOUT_AVATARS =
        '<div class="ui-drop-down-suggestion-item" data-user-id="{uid}">' +
        '   <label class="ui-drop-down-suggestion-item-name">{name::html}</label>' +
        '</div>';

    var DEFAULT_MULTIPLE_SELECTED_ITEM_TEMPLATE =
        '<div class="ui-drop-down-selected-item">' +
        '   <div class="ui-drop-down-selected-name"><span>{name}</span></div>' +
        '   <a class="ui-drop-down-selected-remove-btn" data-user-id="{uid}" data-is-remove-button="true"></a>' +
        '</div>';

    var DEFAULT_SINGLE_SELECTED_ITEM_TEMPLATE =
        '<div class="ui-drop-down-single-selected-item">' +
        '    <div class="ui-drop-down-single-selected-name">{name}</div>' +
        '    <a class="ui-drop-down-selected-single-remove-btn" data-user-id="{uid}" data-is-remove-button="true">+</a>' +
        '</div>';

    var DEFAULT_EMPTY_MESSAGE =
        '<div class="ui-drop-down-suggestion-item">' +
        '   <p>Пользователь не найден</p>' +
        '</div>';

    var DEFAULT_OPTIONS = {
        multiple: true,
        autocomplete: true,
        showAvatars: true,
        defaultAvatarUrl: null,
        limit: 10,

        serverSide: false,
        serverSideUrl: '/',
        serverSideMethod: 'GET',
        serverSideFindProperty: 'domain',
        suggestionIdentifierProperty: 'uid',

        suggestionTemplateWithAvatar: DEFAULT_SUGGESTION_TEMPLATE,
        suggestionTemplateWithoutAvatar: DEFAULT_SUGGESTION_TEMPLATE_WITHOUT_AVATARS,
        selectedMultipleItemTemplate: DEFAULT_MULTIPLE_SELECTED_ITEM_TEMPLATE,
        selectedSingleItemTemplate: DEFAULT_SINGLE_SELECTED_ITEM_TEMPLATE,
        emptyMessageTemplate: DEFAULT_EMPTY_MESSAGE

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
        self.matcher = self.options.matcher || uiDropDownUsersMatcher;
        self.suggestions = self.options.suggestions || [];
        self.matchedSuggestions = [];
        self.selectedItems = Object.create(null);

        function init() {
            self._suggestionTemplate = _getSuggestionTemplate();
            self._selectedItemTemplate = _getSelectedItemTemplate();
            _initInputElement();

            self._dropDownInputWrapper = _createDropDownInputWrapper();
            self._suggestionsWrapper = _createSuggestionWrapper();
            self._selectedContainer = _createSelectedSuggestionsContainer();
            self._dropDownIcon = _createDropDownIcon();
            _appendElementsToDom();
            _initBindings();
        }


        function open() {
            if ((!self.options.multiple && self.options.autocomplete) || !self.getSelected().length) {
                hideSelectedContainer();
            }
            showSuggestionList();
            search();
        }

        function search() {
            lookup();
            renderAllMatchedSuggestions();
        }

        function close() {
            hideSuggestionsList();
            if (self.options.multiple && self.getSelected().length) {
                hideInputElement();
            }
            if (!self.options.multiple && self.getSelected().length) {
                hideInputElement();
                showSelectedContainer();
            }
        }

        self._cache = {};
        self._lastVal = null;
        self._serverQuryIsRunning = false;
        self._matchesSuggestionIds = Object.create(null);

        init();


        // Dom methods. Init elements

        function _initInputElement() {
            self.inputElement = UiElement(selector);
            self.inputElement.addClass('ui-drop-down-input');
            if (!self.options.autocomplete) {
                self.inputElement.element.setAttribute('readonly', 'true');
            }
        }

        function _createDropDownIcon() {
            var e = UiElement.create('div');
            e.addClass('ui-widget-drop-down-icon');
            return e;
        }


        function _createSuggestionWrapper() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-autocomplete-suggestions');
            return element;
        }

        function _createDropDownInputWrapper() {
            function setStyles(wrapper) {
                var position = self.inputElement.css().position;
                wrapper.css({
                    width: self.inputElement.offsetWidth() + 'px',
                    position: position
                });
            }

            var element = UiElement.create('div');
            element.addClass('ui-drop-down-input-wrapper');
            setStyles(element);

            return element;
        }


        function _createSelectedSuggestionsContainer() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-selected-container');

            return element;
        }


        function _appendElementsToDom() {
            self.inputElement.wrap(self._dropDownInputWrapper);
            document.body.appendChild(self._suggestionsWrapper.element);

            self._dropDownInputWrapper.element.insertBefore(self._dropDownIcon.element, self.inputElement.element);
            self._dropDownInputWrapper.element.insertBefore(self._selectedContainer.element, self.inputElement.element);

            var originInputElementW = self.inputElement.clientWidth();

            self.inputElement.css({
                width: originInputElementW - self._dropDownIcon.offsetWidth() - 15 + 'px'
            });
        }

        // Events

        function _initBindings() {
            self.inputElement.on('focus', onFocusInputHandler);
            self.inputElement.on('keyup', deBounce(onKeyUpInputHandler, 300));
            self.inputElement.on('blur', onBlurInputElement);

            self._dropDownInputWrapper.on('click', onClickWrapper);

            self._suggestionsWrapper.on('mouseenter', onHoverSuggestionsWrapper);
            self._suggestionsWrapper.on('mouseleave', onMouseLeaveSuggestionsWrapper);
        }

        function onFocusInputHandler() {
            open();
        }

        function onKeyUpInputHandler() {
            search();
        }

        function onClickWrapper(event) {
            var target = event.target;

            if (event.target === this) {
                activateInputElement();
                return;
            }

            if (event.target == self._dropDownIcon.element) {
                activateInputElement();
                return;
            }

            if (target.getAttribute('data-is-remove-button') == 'true') {
                removeSelectedSuggestion(target);
                if (!self.getSelected().length) {
                    hideSelectedContainer();
                    showInputElement();
                }
                return;
            }

            activateInputElement();
        }

        function onBlurInputElement() {
            if (self._suggestionsWrapper.hovered) {
                return;
            }
            close();
        }

        function onHoverSuggestionsWrapper() {
            self._suggestionsWrapper.hovered = true;
        }

        function onMouseLeaveSuggestionsWrapper() {
            self._suggestionsWrapper.hovered = false;
        }

        function _getSuggestionTemplate() {
            if (self.options.showAvatars) {
                return self.options.suggestionTemplateWithAvatar;
            }
            return self.options.suggestionTemplateWithoutAvatar;
        }

        function _getSelectedItemTemplate() {
            if (self.options.multiple) {
                return self.options.selectedMultipleItemTemplate;
            }
            return self.options.selectedSingleItemTemplate;
        }

        function _isSelected(item) {
            return Boolean(self.selectedItems[item[self.options.suggestionIdentifierProperty]]);
        }

        function _addItemToSelected(item) {
            self.selectedItems[item[self.options.suggestionIdentifierProperty]] = item;
        }

        function _isInMatchedSuggestions(item) {
            return Boolean(self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]]);
        }

        function _addToMatchedSuggestions(item) {
            self.matchedSuggestions.push(item);
            self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]] = true;
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

            _addItemToSelected(item);

            element.parentNode.removeChild(element);
            self.inputElement.val('');

            hideSuggestionsList();
            renderSelectedSuggestion(item);
            hideInputElement();

            // Событие не будет послано брузером. Поэтому нужно простваить руками.
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

        function showInputElement() {
            self.inputElement.style.display = 'block';
            if (!self.options.autocomplete && self.getSelected().length) {
                self.inputElement.addClass('ui-drop-down-input-hidden');
            } else {
                self.inputElement.removeClass('ui-drop-down-input-hidden');
            }
        }

        function focusInputElement() {
            if (document.activeElement !== self.inputElement.element) {
                self.inputElement.element.focus();
            }
        }

        function activateInputElement() {
            showInputElement();
            focusInputElement();
        }

        function showSuggestionList() {
            self._suggestionsWrapper.addClass('show');
            _positionSuggestionList();
        }

        function hideSuggestionsList() {
            self._suggestionsWrapper.removeClass('show');
        }


        /**
         * Прозводит позиционирование блока предложений относительно эелемента
         * В зависимости от его позиционирования(static/relative)
         */
        function _positionSuggestionList() {
            var inputWrapperCoordinates = self._dropDownInputWrapper.getCoordinates();

            self._suggestionsWrapper.style.top =
                inputWrapperCoordinates.bottom - self._dropDownInputWrapper.clientTop() + 'px';

            self._suggestionsWrapper.style.left = inputWrapperCoordinates.left + 'px';

            self._suggestionsWrapper.style.width =
                self._dropDownInputWrapper.offsetWidth() - self._suggestionsWrapper.clientLeft() - self._suggestionsWrapper.clientRight() + 'px';
        }


        function clearMatchedSuggestionsList() {
            var children = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);

            children.forEach(function (childNode) {
                self._suggestionsWrapper.removeChild(childNode);
            });
        }


        function renderAllMatchedSuggestions() {

            // Если пачка предложений пуста, то производить очистку и показвать сообщение нужно только
            // Если предложения не смогут появиться с сервера

            if (!self.matchedSuggestions.length && !self._serverQuryIsRunning) {
                clearMatchedSuggestionsList();
                showEmptySuggestionMessage();
                return;
            }

            // Если запрос еще выпоняется, то очистку списка нужно производить
            // Только если есть записи

            if (self.matchedSuggestions.length) {
                clearMatchedSuggestionsList();
            }
            self.matchedSuggestions.forEach(function (item) {
                renderMatchedSuggestion(item);
            });
        }

        function renderMatchedSuggestion(suggestion) {
            var matchedBy = suggestion.mathedBy;
            delete suggestion.mathedBy;

            var dropDownSuggestionItem = DropDownSuggestionItem(
                self._suggestionTemplate, suggestion, matchedBy, self.options.defaultAvatarUrl
            );
            dropDownSuggestionItem.render();

            dropDownSuggestionItem.uiElement.on('click', function () {
                onSelectSuggestion(suggestion, this);
            });

            self._suggestionsWrapper.append(dropDownSuggestionItem.uiElement);
        }


        function removeSelectedSuggestion(element) {
            // TODO: Добавить id. Чтобы не зависеть от верстки
            var uid = element.getAttribute('data-user-id');
            var container = element.parentNode;
            container = container.parentNode;
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

        function _lookUpEmptyPrefix() {
            var counter = 0;
            var idx = 0;
            while (counter < self.options.limit && idx < self.suggestions.length) {
                var item = self.suggestions[idx];
                if (_isSelected(item)) {
                    idx++;
                    continue;
                }
                _addToMatchedSuggestions(item);
                counter++;
                idx++;
            }
        }

        function lookup() {
            var counter = 0;
            var idx = 0;

            var prefix = self.inputElement.val();

            if (prefix == self._lastVal && prefix !== '') {
                return;
            }

            self._lastVal = prefix;
            self.matchedSuggestions = [];
            self._matchesSuggestionIds = Object.create(null);

            if (prefix === '') {
                _lookUpEmptyPrefix();
                return;
            }

            console.time('lookUp');
            while (counter < self.options.limit && idx < self.suggestions.length) {
                var matchResult = self.matcher(prefix, self.suggestions[idx], self.selectedItems);
                if (matchResult.matched) {
                    self.suggestions[idx].mathedBy = matchResult.matchedBy;
                    _addToMatchedSuggestions(self.suggestions[idx]);
                    counter++;
                }
                idx++;
            }
            console.timeEnd('lookUp');

            if (self.options.serverSide) {
                serverLookUp(prefix);
            }
        }


        function appendMatchedSuggestionsFromServer(suggestions) {
            suggestions.forEach(function (suggestion) {
                if (!_isSelected(suggestion) && !_isInMatchedSuggestions(suggestion)) {
                    _addToMatchedSuggestions(suggestion);
                    renderMatchedSuggestion(suggestion);
                }
            });
        }

        function onServerLookUpLoaded(prefix, response) {
            self._cache[prefix] = response.result;
            if (!self.matchedSuggestions.length) {
                clearMatchedSuggestionsList();
            }
            if (response.result.length) {
                appendMatchedSuggestionsFromServer(response.result);
            } else if (!self.matchedSuggestions.length) {
                showEmptySuggestionMessage();
                self._lastIsEmpty = true;
            }
        }

        function serverLookUp(prefix) {
            if (prefix == '') {
                return;
            }
            self._serverQuryIsRunning = true;
            var _cached = self._cache[prefix];
            var findParams = {};

            if (_cached) {
                appendMatchedSuggestionsFromServer(_cached);
                self._serverQuryIsRunning = false;
                return;
            }

            findParams[self.options.serverSideFindProperty] = prefix;
            findParams['limit'] = self.options.limit;

            uiDropDownajax({
                method: self.options.serverSideMethod,
                url: self.options.serverSideUrl,
                data: findParams,
                params: findParams,
                onError: function (xrh) {
                    console.log('ERROR', xrh.statusText);
                    if (!self.matchedSuggestions.length) {
                        clearMatchedSuggestionsList();
                        showEmptySuggestionMessage();
                    }
                    self._serverQuryIsRunning = false;
                },
                onSuccess: function (response) {
                    onServerLookUpLoaded(prefix, response);
                    self._serverQuryIsRunning = false;
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

        function showEmptySuggestionMessage() {
            var dropDownItem = DropDownSuggestionItem(self.options.emptyMessageTemplate, {name: 'empty'});
            dropDownItem.render();
            self._suggestionsWrapper.append(dropDownItem.uiElement.element);
        }
    }

    window.UiDropDown = UiDropDown;
})(window);