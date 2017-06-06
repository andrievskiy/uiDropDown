/**
 * Created by andrievskiy on 05.06.2017.
 */
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}
/**
 * Модуль для работы с DOM
 */
(function (window) {
    'use strict';

    /**
     * @param selectorOrElement {String | HtmlElement}
     * @returns {_UiElement}
     * @constructor
     */
    function UiElement(selectorOrElement) {
        return new _UiElement(selectorOrElement);
    }

    /**
     * Create new DOM element and wrap to UiElement
     * @param tagName
     * @returns {_UiElement}
     */
    UiElement.create = function (tagName) {
        return new _UiElement(document.createElement(tagName));
    };


    /**
     * Класс враппера для работы с DOM елементами
     * @param selectorOrElement
     * @private
     */
    function _UiElement(selectorOrElement) {
        this.element = null;
        if (typeof selectorOrElement == "string") {
            this.element = document.querySelector(selectorOrElement);
        }
        if (selectorOrElement instanceof HTMLElement) {
            this.element = selectorOrElement;
        }
        if(this.element === null){
            console.error('Invalid or unsupported selector or dom element: ' + selectorOrElement);
        }
    }

    /**
     * Расчет координат относительно документа, учитывая clientTop/clientLeft
     * @returns {{top: number, left: number}}
     */
    _UiElement.prototype.getCoordinates = function () {
        var byWindow = this.element.getBoundingClientRect();
        var bodyElement = document.body;
        var documentElement = document.documentElement;

        var scrollTop = window.pageYOffset || documentElement.scrollTop || bodyElement.scrollTop;
        var scrollLeft = window.pageXOffset || documentElement.scrollLeft || bodyElement.scrollLeft;

        var clientTop = documentElement.clientTop || bodyElement.clientTop || 0;
        var clientLeft = documentElement.clientLeft || bodyElement.clientLeft || 0;

        return {
            top: byWindow.top + scrollTop - clientTop,
            left: byWindow.left + scrollLeft - clientLeft
        }
    };

    /**
     *
     * @returns {number}
     */
    _UiElement.prototype.clientLeft = function () {
        return this.element.clientLeft;
    };

    /**
     *
     * @returns {number}
     */
    _UiElement.prototype.clientRight = function () {
        // @TODO: Поправить на корректную работу в случае скрола
        var clientRight =  this.offsetWidth() - this.clientLeft() - this.clientWidth();
        return clientRight;
    };

    /**
     *
     * @returns {number}
     */
    _UiElement.prototype.clientTop = function () {
        return this.element.clientTop;
    };


    /**
     *
     * @returns {number}
     */
    _UiElement.prototype.offsetWidth = function () {
        return this.element.offsetWidth;
    };

    /**
     *
     * @returns {number}
     */
    _UiElement.prototype.clientWidth = function () {
        return this.element.clientWidth;
    };

    /**
     *
     * @returns {number}
     */
    _UiElement.prototype.scrollWidth = function () {
        return this.element.scrollWidth;
    };

    /**
     *
     * @param cls
     */
    _UiElement.prototype.addClass = function (cls) {
        this.element.classList.add(cls);
    };

    /**
     *
     * @param cls
     */
    _UiElement.prototype.removeClass = function (cls) {
      this.element.classList.remove(cls);
    };

    /**
     * Обернуть элемент враппером
     * @param wrapper {UiElement}
     */
    _UiElement.prototype.wrap = function (wrapper) {
        var el, parent;
        if(wrapper instanceof _UiElement){
            el = wrapper.element;
        } else{
            el = wrapper;
        }

        parent = this.element.parentNode;


        if(this.element.nextSibling){
            parent.insertBefore(el, this.element.nextSibling);
        } else {
            parent.appendChild(el);
        }
        el.appendChild(this.element);
    };

    /**
     *
     * @param value
     * @returns {*|string|Number|undefined}
     */
    _UiElement.prototype.val = function (value) {
        if(value != undefined){
            this.element.value = value;
            return;
        }
        return this.element.value;
    };

    /**
     *
     * @param eventKey
     * @param callback
     * @param stage
     */
    _UiElement.prototype.on = function (eventKey, callback, stage) {
        this.element.addEventListener(eventKey, callback, stage);
    };

    /**
     *
     * @param evenKey
     * @param callback
     * @param stage
     */
    _UiElement.prototype.off = function (evenKey, callback, stage) {
        this.element.removeEventListener(evenKey, callback, stage);
    };
    /**
     * Удалить потомка
     * @param child
     * @returns {Node}
     */
    _UiElement.prototype.removeChild =function (child) {
        return this.element.removeChild(child);
    };

    /**
     * Добаить потомка к элементу
     * @param child
     * @returns {Node}
     */
    _UiElement.prototype.append = function (child) {
        if(child instanceof _UiElement){
             return this.element.appendChild(child.element);
        }
        return this.element.appendChild(child);
    };

    _UiElement.prototype.html = function (val) {
        if(val != undefined){
            this.element.innerHTML = val;
            return;
        }
        return this.element.innerHTML;
    };

    _UiElement.prototype.remove = function(){
        this.element.parentNode.removeChild(this.element);
    };

    /**
     * Прокси для проброса style
     */
    Object.defineProperties(_UiElement.prototype, {
        style: {
            get: function () {
                return this.element.style;
            }
        }
    });

    window.UiElement = UiElement;

})(window);
(function (window) {
    var ESCAPE_CHARS = {
        '¢': 'cent',
        '£': 'pound',
        '¥': 'yen',
        '€': 'euro',
        '©': 'copy',
        '®': 'reg',
        '<': 'lt',
        '>': 'gt',
        '"': 'quot',
        '&': 'amp',
        '\'': '#39'
    }, regex;

    function _makeRegexpString() {
        var regexString = '[';

        for (var key in ESCAPE_CHARS) {
            regexString += key;
        }
        regexString += ']';

        return regexString;
    }

    regex = new RegExp(_makeRegexpString(), 'g');

    function uiDropDownHtmlEscaping(str) {
        return str.replace(regex, function (m) {
            return '&' + ESCAPE_CHARS[m] + ';';
        });
    }

    window.uiDropDownHtmlEscaping = uiDropDownHtmlEscaping;
})(window);
;(function (window) {
    function renderTemplate(template, data) {
        return template.replace(/{([\w|:]+)}/g, function (match, key) {

            var isHtml = ~key.indexOf('::html');
            if(isHtml){
                key = key.split('::')[0];
                return data[key] || '';
            }
            return uiDropDownHtmlEscaping(data[key] || '');
        })
    }
    window.uiRenderTemplate = renderTemplate;
})(window);
;(function (window) {
    var dropDownItemDefaultTemplate = '';

    function DropDownSuggestionItem(template, data, matchedBy) {
        return new _DropDownSuggestionItem(template, data, matchedBy);
    }

    function _DropDownSuggestionItem(template, data, matchedBy) {
        this.uiElement = UiElement.create('div');
        this.uiElement.addClass('ui-drop-down-item-container');

        this.template = template || dropDownItemDefaultTemplate;
        this.data = data;
        this.matchedBy = matchedBy;
        this.name = uiDropDownHtmlEscaping(this.data.name);
        this.name = this.name.replace(this.matchedBy, '<span class="ui-drop-down-highlight">' + this.matchedBy + '</span>');
        this.uid = this.data.uid;
    }
    
    _DropDownSuggestionItem.prototype.render = function () {
        var html = uiRenderTemplate(this.template, this);
        this.uiElement.html(html);
        return this.uiElement;
    };

    window.DropDownSuggestionItem = DropDownSuggestionItem;
})(window);
;(function (window) {
    var dropDownItemDefaultTemplate = '';

    function DropDownSelectedSuggestionItem(template, data, matchedBy) {
        return new _DropDownSelectedSuggestionItem(template, data, matchedBy);
    }

    function _DropDownSelectedSuggestionItem(template, data, multiple) {
        this.uiElement = UiElement.create('div');
        var containerCls = multiple ? 'ui-drop-down-selected-suggestion': 'ui-drop-down-single-selected-suggestion';
        this.uiElement.addClass(containerCls);

        this.template = template || dropDownItemDefaultTemplate;
        this.data = data;
        this.name = this.data.name;
        this.uid = this.data.uid;
    }
    
    _DropDownSelectedSuggestionItem.prototype.render = function () {
        var html = uiRenderTemplate(this.template, this);
        this.uiElement.html(html);
        return this.uiElement;
    };

    window.DropDownSelectedSuggestionItem = DropDownSelectedSuggestionItem;
})(window);
(function (window) {
    'use strict';
    var LATIN_TO_CYRILLIC_KEYBOARD = {
        'q': 'й',
        'w': 'ц',
        'e': 'у',
        'r': 'к',
        't': 'е',
        'y': 'н',
        'u': 'г',
        'i': 'ш',
        'o': 'щ',
        'p': 'з',
        '{': 'х',
        '}': 'ъ',
        'a': 'ф',
        's': 'ы',
        'd': 'в',
        'f': 'а',
        'g': 'п',
        'h': 'р',
        'j': 'о',
        'k': 'л',
        'l': 'д',
        ';': 'ж',
        "'": 'э',
        'z': 'я',
        'x': 'ч',
        'c': 'с',
        'v': 'м',
        'b': 'и',
        'n': 'т',
        'm': 'ь',
        ',': 'б',
        '.': 'ю'
    };
    var CYRILLIC_TO_LATIN_KEYBOARD = {};

    Object.keys(LATIN_TO_CYRILLIC_KEYBOARD).map(function (key) {
        var k = LATIN_TO_CYRILLIC_KEYBOARD[key];
        CYRILLIC_TO_LATIN_KEYBOARD[k] = key;
    });


    var LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP = {
        'yo': 'ё',
        'zh': 'ж',
        'kh': 'х',
        'ts': 'ц',
        'ch': 'ч',
        'sch': 'щ',
        'shch': 'щ',
        'sh': 'ш',
        'eh': 'э',
        'yu': 'ю',
        'ya': 'я',
        "'": 'ь'
    };

    var CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP = {};

    Object.keys(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP).map(function (key) {
        var k = LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[key];
        CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[k] = key;
    });

    var MULTIPLE_LATIN_CHARTS = {
        'y': ['ы', 'ё', 'ю', 'я'],
        'z': ['ж', 'з'],
        'k': ['х', 'к'],
        't': ['ц', 'т'],
        'c': ['ц', 'ч',  'щ'],
        's': ['ш', 'щ', 'с'],
        'e': ['е', 'э']
    };

    var LATIN_ALPHABET = 'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ';
    var CYRILLIC_ALPHABET = 'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ';


    function _toCyrillicKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += LATIN_TO_CYRILLIC_KEYBOARD[chart] || chart;
        });

        return result;
    }

    function _toLatinKeyboard(str) {
        var result = '';
        var charts = str.split('');
        charts.forEach(function (chart) {
            result += CYRILLIC_TO_LATIN_KEYBOARD[chart] || chart;
        });
        return result;
    }

    /**
     * Получение всех возможных уникальных вариантов для поиска
     *
     * @param prefix
     * @returns {Array}
     * @private
     */
    function _getPrefixVariables(prefix) {
        var variables = [];
        var cyrillicKeyboard;
        var latinKeyboard;

        // Получение всех кирилических вариантов по латинице
        // За счет того, что латиница уже, то одну строку на ней
        // Можжно представить несколькими на кирилице
        // Например: z = ж/z = з
        variables = variables.concat(_latinToCyrillicVariants(prefix));

        // Приведение кириллицы к латинице
        // Например: юа => yoa
        variables.push(_cyrillicToLatinVariants(prefix));


        // Приведение расладок

        cyrillicKeyboard = _toCyrillicKeyboard(prefix);
        latinKeyboard = _toLatinKeyboard(prefix);
        variables.push(cyrillicKeyboard);
        variables.push(latinKeyboard);

        // Транслитерация для раскладок
        // Например: кщпщя -> rogoz -> рогоз
        variables.push(_cyrillicToLatinVariants(cyrillicKeyboard));
        variables = variables.concat(_latinToCyrillicVariants(latinKeyboard));

        // Вывод уникальных валидаторов
        // TODO: Оптимизироввать через set
        variables = variables.filter(function (item, idx, array) {
            return array.indexOf(item) === idx;
        });

        return variables;
    }


    function _latinToCyrillicVariants(str) {
        var variants;
        var charts;

        // Сначала происходит замена "букв" из нескольких символов
        Object.keys(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP).forEach(function (char) {
           str = str.split(char).join(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[char]);
        });

        charts = str.split('');

        variants = _extendVariants(charts);
        variants = variants.map(function (variant) {
            return _replace(variant.join(''));
        });

        return variants;

        /**
         * Производит расширение вариантов для  символов соответствующих нескольким русским буквам
         * при условии что символ находится в конце строки (т.е. невозиожно определить к чему он приводится)
         * @param charts
         * @returns {*[]}
         * @private
         */
        function _extendVariants(charts) {
            var variants = [charts];
            var lastChart = charts[charts.length - 1];
            var chartVariants;

            if(MULTIPLE_LATIN_CHARTS[lastChart]){
                variants = [];
                chartVariants = MULTIPLE_LATIN_CHARTS[lastChart];
                chartVariants.forEach(function (chartVar) {

                    var newVariant = charts.slice(0, charts.length - 1);
                    newVariant.push(chartVar);
                    variants.push(newVariant);
                });
            }
            return variants;
        }

        function _replace(str) {
            for (var i = 0; i < LATIN_ALPHABET.length; i++) {
                str = str.split(LATIN_ALPHABET.charAt(i)).join(CYRILLIC_ALPHABET.charAt(i));
            }
            return str;
        }
    }


    function _cyrillicToLatinVariants(str) {
        // Сначала происходит замена "букв" из нескольких символов
        Object.keys(CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP).forEach(function (char) {
           str = str.split(char).join(CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[char]);
        });

        function _replace(str) {
            for (var i = 0; i < CYRILLIC_ALPHABET.length; i++) {
                str = str.split(CYRILLIC_ALPHABET.charAt(i)).join(LATIN_ALPHABET.charAt(i));
            }
            return str;
        }
        return _replace(str);
    }


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

        prefixes = _getPrefixVariables(prefix);

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
        showAvatars: true
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


        self.inputElement = UiElement(selector);

        self.suggestions = self.options.suggestions || [];
        self.matcher = self.options.matcher || uiDropDownUsersMatcher;

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

        self._dropDownInputWrapper.on('click', onClickWrapper);

        self._suggestionsWrapper.on('mouseenter', onHoverSuggestionsWrapper);
        self._suggestionsWrapper.on('mouseleave', onMouseLeaveSuggestionsWrapper);

        self._selectedContainer.on('click', onClickSelectedContainer);


        function onClickSelectedContainer(event) {
            var target = event.target;

            if (target.getAttribute('data-is-remove-button') == 'true') {
                removeSelectedSuggesstion(target);

                if (!self.getSelected().length) {
                    hideSelectedContainer();
                    activateInputElement();
                }
            } else {
                activateInputElement();
                if(!self.options.multiple){
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
                if(!self.options.multiple){
                    hideSelectedContainer();
                }
            }
        }

        function onBlurInputElement() {
            if (self._suggestionsWrapper.hovered) {
                return;
            }
            hideSuggestionList();
            if(self.options.multiple && self.getSelected().length){
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
            console.log(self.selectedItems);
            var children = Array.prototype.slice.apply(self._selectedContainer.element.children);
            children.forEach(function(child){
                child.remove();
            });

        }

        function onSelectSuggestion(item, element) {
            if(!self.options.multiple){
                _clearLastSelected();
            }

            self.selectedItems[item.uid] = item;
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

            var dropDownItem = DropDownSuggestionItem(self._suggestionTemplate, suggestion, matchedBy);
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


        function removeSelectedSuggesstion(element) {
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
            //var element = UiElement.create('div');
            //element.addClass('ui-drop-down-selected-suggestion');
            //element.html(uiRenderTemplate(self._selectedItemTemplate, suggestion));
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
                if (matchResult.matched) {

                    self.suggestions[idx].mathedBy = matchResult.matchedBy;
                    self.matchedSuggestions.push(self.suggestions[idx]);
                    counter++;
                }
                idx++;
            }
            console.timeEnd('lookUp');
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
//# sourceMappingURL=ui-drop-down.js.map
