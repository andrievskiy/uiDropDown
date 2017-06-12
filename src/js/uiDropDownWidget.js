;(function (window) {
    var DEFAULT_SUGGESTION_TEMPLATE =
        '<div class="ui-drop-down-suggestion-item" data-uid="{uid}">' +
        '   <img class="ui-drop-down-suggestion-item-avatar" src="{avatarUrl}">' +
        '   <label class="ui-drop-down-suggestion-item-name">{name::html}</label>' +
        '   <span class="ui-drop-down-suggestion-item-extra">{extra}</span>' +
        '</div>';

    var DEFAULT_SUGGESTION_TEMPLATE_WITHOUT_AVATARS =
        '<div class="ui-drop-down-suggestion-item" data-uid="{uid}">' +
        '   <label class="ui-drop-down-suggestion-item-name">{name::html}</label>' +
        '</div>';

    var DEFAULT_MULTIPLE_SELECTED_ITEM_TEMPLATE =
        '<div class="ui-drop-down-selected-item" data-is-selected-name="true">' +
        '   <div class="ui-drop-down-selected-name" data-is-selected-name="true">' +
        '       <span data-is-selected-name="true">{name}</span>' +
        '   </div>' +
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

    var ADD_NEW_BUTTON_TEMPLATE =
        '<div  class="ui-drop-down-selected-item-add-new-button">' +
        '    <div class="ui-drop-down-selected-add-new-button-name">' +
        '       Добавить' +
        '    </div>' +
        '    <a class="ui-drop-down-selected-add-btn"></a>' +
        '</div>';

    var DEFAULT_OPTIONS = {
        multiple: true,
        autocomplete: true,
        showAvatars: true,
        defaultAvatarUrl: null,
        limit: 10,
        autoInit: true,

        serverSide: false,
        serverSideUrl: '/',
        serverSideMethod: 'GET',
        serverSideFindProperty: 'domain',
        serverLimit: 1000,

        suggestionIdentifierProperty: 'uid',

        suggestionTemplateWithAvatar: DEFAULT_SUGGESTION_TEMPLATE,
        suggestionTemplateWithoutAvatar: DEFAULT_SUGGESTION_TEMPLATE_WITHOUT_AVATARS,
        selectedMultipleItemTemplate: DEFAULT_MULTIPLE_SELECTED_ITEM_TEMPLATE,
        selectedSingleItemTemplate: DEFAULT_SINGLE_SELECTED_ITEM_TEMPLATE,
        emptyMessageTemplate: DEFAULT_EMPTY_MESSAGE,
        addNewButtonTemplate: ADD_NEW_BUTTON_TEMPLATE

    };

    /**
     * Виджет для создания dropDown
     * @param {string} selector - css селектор элемента ввода. Используется querySelector. Т.е. привязка будет по
     *                            первому найденному элменту
     * @param {object} options -  Парметры виджета
     * @param {Array} options.suggestions - Список варинатов(предложений)
     * @param {Function} [options.matcher = uiDropDownUsersMatcher] - Функция для определения подходит ли эелемент
     *                                                                под критерии выбора(префикс).
     * @param {Boolean} [options.multiple = true]  - Задает режим выбора. Множественный выбор или нет. Default = true
     * @param {Boolean} [options.autocomplete = true]- Использовать ли поиск по подстроке. Default = true
     * @param {Boolean} [options.showAvatars = true] - Отображать ли автарки в спике
     * @param {String} options.defaultAvatarUrl - Url аватарки если она отсутствует у пользователя
     * @param {Number} [options.limit = 10] - Максимальное количество отображаемых элементов в списке
     * @param {Boolean} [options.autoInit = true] - Проводить ли инициализацию сразу.
     * @param {Boolean} [options.serverSide = false] - Призводить ли поиск на сервере
     * @param {String} [options.serverSideUrl = ''] - Url адрес апи для поиска
     * @param {String} [options.serverSideFindProperty = 'domain'] - Аргумент по котрому будет произведен поиск
     *                 Т.е это название GET/POST/PUT параметра по которому произойдет запрос, например:
     *                 http://api.com/fing?<serverSideFindProperty>=<prefix>
     * @param {Number} [options.serverLimit = 1000] - Лимит для запроса к серверу
     * @param {String} [options.suggestionIdentifierProperty = 'uid'] - Название аттрибута - уникального идентификатора
     *                                                                  записи(пользователя).
     *
     * @param {String} [options.suggestionTemplateWithAvatar] - Шаблон для элемента списка с аватаром
     * @param {String} [options.suggestionTemplateWithoutAvatar] - Шаблон для элемента списка без аватара
     * @param {String} [options.selectedMultipleItemTemplate] - Шаблон для выбранного элемента при множественном выборе
     * @param {String} [options.selectedSingleItemTemplate] - Шаблон для выбранного элемента при одиночном выборе
     * @param {String} [options.emptyMessageTemplate] - Шаблон для пустого сообщения
     *
     * @constructor
     *
     */
    function UiDropDown(selector, options) {
        var self = this;

        options = options || {};

        self.options = Object.assign({}, DEFAULT_OPTIONS, options);
        self.matcher = self.options.matcher || uiDropDownUsersMatcher;

        self.suggestions = self.options.suggestions || [];
        self.matchedSuggestions = [];
        self.selectedItems = Object.create(null);

        self._cache = Object.create(null);
        self._lastVal = null;
        self._serverQuryIsRunning = false;
        self._matchesSuggestionIds = Object.create(null);
        self._hoveredSuggestionUiElement = null;
        self._initialized = false;
        self._initialSelectedItems = null;

        self._scrollDelta = 55;

        // ------------------------------------
        // Public methods
        // ------------------------------------

        self.open = open;
        self.close = close;
        self.search = search;
        self.init = init;
        self.getSelected = getSelected;
        self.setSuggestions = setSuggestions;
        self.setSelected = setSelected;
        self.activate = activate;

        /**
         *  Производит ининциализацию виджета
         */
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
            if (self._initialSelectedItems) {
                self._initialSelectedItems.forEach(function (item) {
                    _applySelected(item);
                });
            }
            self._initialized = true;
        }

        /**
         * Активация виджета: показ списка предложений и активация поля поиска
         */
        function activate() {
            _activateInputElement();
        }


        /**
         * Открыть список пркдложений. (При этом элемент поиска активирован не будет)
         */
        function open() {
            _hideAddNewButton();
            if ((!self.options.multiple && self.options.autocomplete) || !self.getSelected().length) {
                _hideSelectedContainer();
            }
            _showSuggestionList();
            search();
            _scrollSuggestionWrapperTop();
        }

        /**
         * Выполнить поиск по текущему значению элемента поиска
         */
        function search() {
            var prefix = self.inputElement.val();
            _lookup(prefix);
            if (self.options.serverSide) {
                _serverLookUp(prefix);
            }
            _renderAllMatchedSuggestions();
            if (!self._serverQuryIsRunning) {
                _hoverFirstSuggestion();
            }
        }

        /**
         * Закрыть список предложений
         */
        function close() {
            _hideSuggestionsList();
            if (self.options.multiple && self.getSelected().length) {
                _hideInputElement();
                _showAddNewButton();
            }
            if (!self.options.multiple && self.getSelected().length) {
                _hideInputElement();
                _showSelectedContainer();
            }

        }


        /**
         * Получить список выбранных элементов. Важно, что в случае с multiple=false в ответе все равно
         * Будет список из 1го элемента.
         * @returns {Array}
         */
        function getSelected() {
            return Object.keys(self.selectedItems).map(function (key) {
                return self.selectedItems[key];
            });
        }

        /**
         * Утановить выбранные элементы. При этом даже если  multiple=false необходимо передавать список из одного
         * Элемента. Если  multiple=false, а списке больше одного элмента будет выбран последний.
         * @param {Array} items
         */
        function setSelected(items) {
            if (self._initialized) {
                items.forEach(function (item) {
                    _applySelected(item);
                });
            } else {
                self._initialSelectedItems = items;
            }

        }

        /**
         * Установить список возможных вариантов предложений
         * @param {Array} suggestions
         */
        function setSuggestions(suggestions) {
            self.suggestions = suggestions;
        }


        if (self.options.autoInit) {
            init();
        }

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
                self.inputElement.setAttribute('readonly', 'true');
            }
        }

        function _createDropDownIcon() {
            var element = UiElement.create('div');
            element.addClass('ui-widget-drop-down-icon');
            return element;
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
            function _createAddNewButton() {
                var addNewButton = UiElement.create('div');
                addNewButton.addClass('ui-drop-down-selected-suggestion');
                addNewButton.html(uiRenderTemplate(self.options.addNewButtonTemplate));
                self._addNewButton = addNewButton;
                return addNewButton;
            }

            var element = UiElement.create('div');
            element.addClass('ui-drop-down-selected-container');

            if(self.options.multiple){
                element.append(_createAddNewButton());
            }

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

        function _applySelected(suggestion) {
            if (!self.options.multiple) {
                _clearLastSelected();
            }

            _addItemToSelected(suggestion);
            _renderSelectedSuggestion(suggestion);
            _showSelectedContainer();
            _hideInputElement();
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
                self.inputElement.addClass('ui-drop-down-hidden');
            }
        }

        function _hideAddNewButton() {
            if(self._addNewButton){
                self._addNewButton.addClass('ui-drop-down-hidden');
            }
        }

        function _showAddNewButton() {
            if(self._addNewButton){
                self._addNewButton.removeClass('ui-drop-down-hidden')
            }
        }

        function _showInputElement() {
            self.inputElement.removeClass('ui-drop-down-hidden');
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
        // Управление - Выделеение/выбор
        // ------------------------------------

        function _clearLastHovered() {
            if (self._hoveredSuggestionUiElement) {
                self._hoveredSuggestionUiElement.removeClass('ui-drop-down-hovered');
            }
        }

        function _hoverFirstSuggestion() {
            _clearLastHovered();
            var suggestionElement = self._suggestionsWrapper.element.firstChild;
            if (suggestionElement) {
                suggestionElement = UiElement(suggestionElement);
                suggestionElement.addClass('ui-drop-down-hovered');
                self._hoveredSuggestionUiElement = suggestionElement;

            }
        }

        function _hoverSuggestionByElement(element) {
            var suggestionElement = UiElement(element);
            _clearLastHovered();
            suggestionElement.addClass('ui-drop-down-hovered');
            self._hoveredSuggestionUiElement = suggestionElement;
        }

        function _selectSuggestionByElement(uiElement) {
            var suggestionElement = uiElement.element;
            var suggestion = self.matchedSuggestions.filter(function (s) {
                return String(s[self.options.suggestionIdentifierProperty]) === String(suggestionElement.getAttribute('data-uid'));
            });

            suggestion = suggestion[0];
            if (suggestion) {
                onSelectSuggestion(suggestion, suggestionElement);
            }
        }

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
            self._dropDownInputWrapper.on('keyup', _onKeyUpWrapperHandler, true);
        }


        function _onKeyUpWrapperHandler(event) {
            var next = null;
            var prev = null;

            if (event.keyCode == uiDropDownEventsKeyCodes.ARROW_DOWN) {
                event.stopPropagation();
                if (self._hoveredSuggestionUiElement) {
                    next = self._hoveredSuggestionUiElement.next();
                    if (next) {
                        _hoverSuggestionByElement(next);
                    }
                }

                // TODO: Поправить скрол - не искользовать захардкоженное значение смещения
                // TODO: сролить 'постранично"

                _scrollSuggestionWrapperDown();
            }

            if (event.keyCode == uiDropDownEventsKeyCodes.ARROW_UP) {
                event.stopPropagation();
                if (self._hoveredSuggestionUiElement) {
                    prev = self._hoveredSuggestionUiElement.prev();
                    if (prev) {
                        _hoverSuggestionByElement(prev);
                    }
                }
                // TODO: Поправить скрол - не искользовать захардкоженное значение смещения
                // TODO: сролить 'постранично"
                _scrollSuggestionWrapperUp();
            }

            if (event.keyCode == uiDropDownEventsKeyCodes.ENTER) {
                event.stopPropagation();
                _selectSuggestionByElement(self._hoveredSuggestionUiElement);

            }

            if (event.keyCode == uiDropDownEventsKeyCodes.ESCAPE) {
                event.stopPropagation();
                close();
                self.inputElement.element.blur();
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
            // Игнорирвоать клики на имени выбранного элемента
            if(target.getAttribute('data-is-selected-name') === 'true'){
                return;
            }

            // Клик на кнопке удаления
            if (target.getAttribute('data-is-remove-button') === 'true') {
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
            _showAddNewButton();
        }

        function onHoverSuggestion(element) {
            _hoverSuggestionByElement(element)
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

            dropDownSuggestionItem.uiElement.on('mouseenter', function () {
                onHoverSuggestion(this);
            });

            self._suggestionsWrapper.append(dropDownSuggestionItem.uiElement);
        }

        function _renderSelectedSuggestion(suggestion) {
            var selectedItem = DropDownSelectedSuggestionItem(
                self._selectedItemTemplate, suggestion, self.options.multiple
            );
            selectedItem.render();
            if(self.options.multiple){
                self._selectedContainer.element.insertBefore(selectedItem.uiElement.element, self._addNewButton.element);
                return;
            }
            self._selectedContainer.append(selectedItem.uiElement);
        }

        function _clearLastSelected() {
            Object.keys(self.selectedItems).forEach(function (prop) {
                delete self.selectedItems[prop];
            });
            var children = self._selectedContainer.children();
            children.forEach(function (child) {
                child.parentNode.removeChild(child);
            });
        }

        function _clearMatchedSuggestionsList() {
            var children = self._suggestionsWrapper.children();

            children.forEach(function (childNode) {
                self._suggestionsWrapper.removeChild(childNode);
            });
        }

        function _showEmptySuggestionMessage() {
            var dropDownItem = DropDownSuggestionItem(self.options.emptyMessageTemplate, {name: 'empty'});
            dropDownItem.render();
            self._suggestionsWrapper.append(dropDownItem.uiElement);
        }

        function _removeSelectedSuggestionByElement(element) {
            var uid = element.getAttribute('data-user-id');
            var container = _getContainer(element);
            if (container) {
                container.parentNode.removeChild(container);
            }
            delete self.selectedItems[uid];

            function _getContainer(element) {
                var container = element.parentNode;
                if (container.getAttribute('data-is-selected-suggestion') === 'true') {
                    return container;
                }
                if (container === document.body) {
                    return null;
                }
                return _getContainer(container);
            }
        }

        //  ---------------------------------
        //  Скролл
        //  ---------------------------------
        function _scrollSuggestionWrapperDown() {
            self._suggestionsWrapper.element.scrollTop += self._scrollDelta;
        }

        function _scrollSuggestionWrapperUp() {
            self._suggestionsWrapper.element.scrollTop -= self._scrollDelta;
        }

        function _scrollSuggestionWrapperTop() {
            self._suggestionsWrapper.element.scrollTop = 0;
        }


        /***********************************************
         * Поиск
         ************************************************/


        //  ---------------------------------------------
        //  Локальный поиск на клиенте
        //  ---------------------------------------------

        function _lookUpEmptyPrefix() {
            for (var i = 0; i < self.suggestions.length; i++) {
                var item = self.suggestions[i];
                if (_isSelected(item)) {
                    continue;
                }
                _addToMatched(item);
                if (self.matchedSuggestions.length >= self.options.limit) {
                    break;
                }
            }
        }

        function _lookup(prefix) {
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
            for (var i = 0; i < self.suggestions.length; i++) {
                var matchResult = self.matcher(prefix, self.suggestions[i], self.selectedItems);
                if (matchResult.matched) {
                    self.suggestions[i].mathedBy = matchResult.matchedBy;
                    _addToMatched(self.suggestions[i]);
                }
                if (self.matchedSuggestions.length >= self.options.limit) {
                    break
                }
            }
            console.timeEnd('lookUp');
        }


        //  ---------------------------------------------
        //  Поиск с сервера
        //  ---------------------------------------------


        function _appendMatchedSuggestionsFromServer(suggestions) {
            for (var i = 0; i < suggestions.length; i++) {
                var suggestion = suggestions[i];
                if (!_isSelected(suggestion) && !_isInMatched(suggestion)) {
                    _addToMatched(suggestion);
                    _renderMatchedSuggestion(suggestion);
                }
                if (self.matchedSuggestions.length >= self.options.limit) {
                    break;
                }
            }
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

            _hoverFirstSuggestion();
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