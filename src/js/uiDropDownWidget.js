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
        serverLimit: 1000,

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

        // Управление


        function open() {
            self._hoveredIdx = 0;
            if ((!self.options.multiple && self.options.autocomplete) || !self.getSelected().length) {
                _hideSelectedContainer();
            }
            _showSuggestionList();
            search();
        }

        function search() {
            self._hoveredIdx = -1;
            _lookup();
            _renderAllMatchedSuggestions();
        }

        function close() {
            self._hoveredIdx = -1;
            _hideSuggestionsList();
            if (self.options.multiple && self.getSelected().length) {
                _hideInputElement();
            }
            if (!self.options.multiple && self.getSelected().length) {
                _hideInputElement();
                _showSelectedContainer();
            }
        }


        self._cache = {};
        self._lastVal = null;
        self._serverQuryIsRunning = false;
        self._matchesSuggestionIds = Object.create(null);
        self._hoveredIdx = -1;

        init();


        /*************************************************
         * Внутненние методы для работы с DOM.
         * Созадние елементов и их отображение
         ************************************************/


        //  --------------------------
        //  Инициализация и создание
        //  --------------------------

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

        //  --------------------------
        //  Управление отображением
        //  ---------------------------

        function _showSelectedContainer() {
            self._selectedContainer.addClass('show');
        }

        function _hideSelectedContainer() {
            self._selectedContainer.removeClass('show');
        }

        function _hideInputElement() {
            if (self.getSelected().length) {
                self.inputElement.style.display = 'none';
            }
        }

        function _showInputElement() {
            self.inputElement.style.display = 'block';
            if (!self.options.autocomplete && self.getSelected().length) {
                self.inputElement.addClass('ui-drop-down-input-hidden');
            } else {
                self.inputElement.removeClass('ui-drop-down-input-hidden');
            }
        }

        function _focusInputElement() {
            if (document.activeElement !== self.inputElement.element) {
                self.inputElement.element.focus();
            }
        }

        function _showSuggestionList() {
            self._suggestionsWrapper.addClass('show');
            _positionSuggestionList();
        }

        function _hideSuggestionsList() {
            self._suggestionsWrapper.removeClass('show');
        }

        function _activateInputElement() {
            _showInputElement();
            _focusInputElement();
        }

        // ------------------------------------
        // Управление
        // ------------------------------------

        function _clearAllHovered() {
            var suggestionElements = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);
            suggestionElements.forEach(function (suggestionElement) {
                suggestionElement = UiElement(suggestionElement);
                suggestionElement.removeClass('ui-drop-down-hovered');
            })
        }

        function _hoveSuggestionByIdx(idx) {
            _clearAllHovered();
            var suggestionElements = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);
            var suggestion = suggestionElements[idx];
            if(suggestion){
                suggestion = UiElement(suggestion);
                suggestion.addClass('ui-drop-down-hovered');
                self._hoveredSuggestion = suggestion;
            }
        }

        function _selectSuggestionByIdx(idx) {
            var suggestion = self.matchedSuggestions[idx];
            if(suggestion){
                onSelectSuggestion(suggestion, self._hoveredSuggestion.element);
            }
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


        /*************************************************
         * Обработка событий. Events
         ************************************************/

        function _initBindings() {
            self.inputElement.on('focus', _onFocusInputHandler);
            self.inputElement.on('keyup', _deBounce(_onKeyUpInputHandler, 300));
            self.inputElement.on('blur', onBlurInputElementHandler);

            self._dropDownInputWrapper.on('click', _onClickWrapperHandler);

            self._suggestionsWrapper.on('mouseenter', onHoverSuggestionsWrapperHandler);
            self._suggestionsWrapper.on('mouseleave', onMouseLeaveSuggestionsWrapperHandler);
            self._dropDownInputWrapper.on('keyup', _onKeyDownWrapperHandler, true);
        }


        function _onKeyDownWrapperHandler(event) {
            console.log(event);
            if(event.keyCode == 40 || event.key == 'ArrowDown'){
                self._hoveredIdx = Math.min(self._hoveredIdx + 1,  self.matchedSuggestions.length);
                _hoveSuggestionByIdx(self._hoveredIdx);
                event.stopPropagation();
            }

            if(event.key == 'ArrowUp'){
                self._hoveredIdx = Math.max(self._hoveredIdx - 1, 0);
                _hoveSuggestionByIdx(self._hoveredIdx);
                event.stopPropagation();
            }

            if(event.keyCode == 13){
                _selectSuggestionByIdx(self._hoveredIdx);
            }

            if(event.key == 'Escape'){
                close();
            }
        }

        function _onFocusInputHandler() {
            open();
        }

        function _onKeyUpInputHandler() {
            search();
        }

        function _onClickWrapperHandler(event) {
            var target = event.target;

            if (event.target === this) {
                _activateInputElement();
                return;
            }

            if (event.target == self._dropDownIcon.element) {
                _activateInputElement();
                return;
            }

            if (target.getAttribute('data-is-remove-button') == 'true') {
                _removeSelectedSuggestionByElement(target);
                if (!self.getSelected().length) {
                    _hideSelectedContainer();
                    _showInputElement();
                }
                return;
            }

            _activateInputElement();
        }


        function onBlurInputElementHandler() {
            if (self._suggestionsWrapper.hovered) {
                return;
            }
            close();
        }

        function onHoverSuggestionsWrapperHandler() {
            self._suggestionsWrapper.hovered = true;
        }

        function onMouseLeaveSuggestionsWrapperHandler() {
            self._suggestionsWrapper.hovered = false;
        }

        function onSelectSuggestion(suggestion, element) {
            if (!self.options.multiple) {
                _clearLastSelected();
            }

            _addItemToSelected(suggestion);

            element.parentNode.removeChild(element);
            self.inputElement.val('');

            _hideSuggestionsList();
            _renderSelectedSuggestion(suggestion);
            _hideInputElement();

            // Событие не будет послано брузером. Поэтому нужно простваить руками.
            self._suggestionsWrapper.hovered = false;
            _showSelectedContainer();
        }

        /*************************************************
         * Утилиты
         ************************************************/

        //  -------------------------
        //  Инициализация
        //  -------------------------

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

        //  -------------------------
        //  Работа с вариантами
        //  -------------------------

        function _isSelected(item) {
            return Boolean(self.selectedItems[item[self.options.suggestionIdentifierProperty]]);
        }

        function _addItemToSelected(item) {
            self.selectedItems[item[self.options.suggestionIdentifierProperty]] = item;
        }

        function _isInMatched(item) {
            return Boolean(self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]]);
        }

        function _addToMatched(item) {
            self.matchedSuggestions.push(item);
            self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]] = true;
        }

        //  -----------------------
        //  Общее
        //  -----------------------

        function _deBounce(func, wait, immediate) {
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

        // ------------------------------------
        // Отображаение вариантов и выбранных
        // ------------------------------------


        function _renderAllMatchedSuggestions() {

            // Если пачка предложений пуста, то производить очистку и показвать сообщение нужно только
            // Если предложения не смогут появиться с сервера

            if (!self.matchedSuggestions.length && !self._serverQuryIsRunning) {
                _clearMatchedSuggestionsList();
                _showEmptySuggestionMessage();
                return;
            }

            // Если запрос еще выпоняется, то очистку списка нужно производить
            // Только если есть записи

            if (self.matchedSuggestions.length) {
                _clearMatchedSuggestionsList();
            }
            self.matchedSuggestions.forEach(function (item) {
                _renderMatchedSuggestion(item);
            });
        }


        function _renderMatchedSuggestion(suggestion) {
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

        function _renderSelectedSuggestion(suggestion) {
            var selectedItem = DropDownSelectedSuggestionItem(
                self._selectedItemTemplate, suggestion, self.options.multiple
            );
            selectedItem.render();
            self._selectedContainer.append(selectedItem.uiElement);
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

        function _clearMatchedSuggestionsList() {
            var children = Array.prototype.slice.apply(self._suggestionsWrapper.element.children);

            children.forEach(function (childNode) {
                self._suggestionsWrapper.removeChild(childNode);
            });
        }

        function _showEmptySuggestionMessage() {
            var dropDownItem = DropDownSuggestionItem(self.options.emptyMessageTemplate, {name: 'empty'});
            dropDownItem.render();
            self._suggestionsWrapper.append(dropDownItem.uiElement.element);
        }

        function _removeSelectedSuggestionByElement(element) {
            // TODO: Добавить id. Чтобы не зависеть от верстки
            var uid = element.getAttribute('data-user-id');
            var container = element.parentNode;
            container = container.parentNode;
            delete self.selectedItems[uid];
            container.parentNode.removeChild(container);
        }

        /***********************************************
         * Поиск
         ************************************************/


        //  ---------------------------------------------
        //  Локальный поиск на клиенте
        //  ---------------------------------------------

        function _lookUpEmptyPrefix() {
            var counter = 0;
            var idx = 0;
            while (counter < self.options.limit && idx < self.suggestions.length) {
                var item = self.suggestions[idx];
                if (_isSelected(item)) {
                    idx++;
                    continue;
                }
                _addToMatched(item);
                counter++;
                idx++;
            }
        }

        function _lookup() {
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
                    _addToMatched(self.suggestions[idx]);
                    counter++;
                }
                idx++;
            }
            console.timeEnd('lookUp');

            if (self.options.serverSide) {
                _serverLookUp(prefix);
            }
        }


        //  ---------------------------------------------
        //  Поиск с сервера
        //  ---------------------------------------------


        function _appendMatchedSuggestionsFromServer(suggestions) {
            suggestions.forEach(function (suggestion) {
                if (!_isSelected(suggestion) && !_isInMatched(suggestion) && self.matchedSuggestions.length < self.options.limit) {
                    _addToMatched(suggestion);
                    _renderMatchedSuggestion(suggestion);
                }
            });
        }

        function _onServerLookUpLoaded(prefix, response) {
            self._cache[prefix] = response.result;
            if (!self.matchedSuggestions.length) {
                _clearMatchedSuggestionsList();
            }
            if (response.result.length) {
                _appendMatchedSuggestionsFromServer(response.result);
            } else if (!self.matchedSuggestions.length) {
                _showEmptySuggestionMessage();
            }
        }

        function _serverLookUp(prefix) {
            if (prefix == '') {
                return;
            }

            self._serverQuryIsRunning = true;
            var _cached = self._cache[prefix];
            var findParams = {};

            if (_cached) {
                _appendMatchedSuggestionsFromServer(_cached);
                self._serverQuryIsRunning = false;
                return;
            }

            // Нужноиспользовать достаточно большой лимит для запроса на сервер
            // Чтобы не столкнуться с проблеиой недоступности данных по првефиксу
            findParams[self.options.serverSideFindProperty] = prefix;
            findParams['limit'] = self.options.serverLimit;

            uiDropDownajax({
                method: self.options.serverSideMethod,
                url: self.options.serverSideUrl,
                data: findParams,
                params: findParams,
                onError: function (xrh) {
                    console.log('ERROR', xrh.statusText);
                    if (!self.matchedSuggestions.length) {
                        _clearMatchedSuggestionsList();
                        _showEmptySuggestionMessage();
                    }
                    self._serverQuryIsRunning = false;
                },
                onSuccess: function (response) {
                    _onServerLookUpLoaded(prefix, response);
                    self._serverQuryIsRunning = false;
                }
            });
        }

    }

    window.UiDropDown = UiDropDown;
})(window);