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
        var parent = this.element.parentNode;
        if(this.element.nextSibling){
            parent.insertBefore(wrapper.element, this.element.nextSibling);
        } else {
            parent.appendChild(wrapper.element);
        }
        wrapper.element.appendChild(this.element);
    };

    /**
     *
     * @param value
     * @returns {*|string|Number}
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
        return this.element.appendChild(child);
    };

    _UiElement.prototype.html = function (val) {
        if(val != undefined){
            this.element.innerHTML = val;
            return;
        }
        return this.element.innerHTML;
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
/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    function renderTemplate(template, data) {
          return template.replace(/{(\w+)}/g, function (match, key) {
            return data[key] || '';
        })
    }

    window.uiRenderTemplate = renderTemplate;
})(window);
/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    var dropDownItemDefaultTemplate = '';

    function DropDownItem(template, data, matchedBy) {
        return new _DropDownItem(template, data, matchedBy);
    }

    function _DropDownItem(template, data, matchedBy) {
        // TODO: Безопасный рендеринг
        this.element = UiElement.create('div');
        this.element.addClass('ui-drop-down-item-container');
        console.log('_DropI', matchedBy);

        this.template = template || dropDownItemDefaultTemplate;
        this.data = data;
        this.matchedBy = matchedBy;
        console.log('replace', this.matchedBy);
        this.name = this.data.name.replace(this.matchedBy, '<span class="highlight">' + this.matchedBy + '</span>');
    }
    
    _DropDownItem.prototype.render = function () {
        var html = uiRenderTemplate(this.template, this);
        this.element.html(html);
        return this.element;
    };

    window.DropDownItem = DropDownItem;
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

        // Получение всех кирилических вариантов по латинице
        // За счет того, что латиница уже, то одну строку на ней
        // Можжно представить несколькими на кирилице
        // Например: z = ж/z = з
        variables = variables.concat(_latinToCyrillicVariants(prefix));

        // Приведение кириллицы к латинице
        // Например: юа => yoa
        variables.push(_cyrillicToLatinVariants(prefix));


        // Приведение расладок

        var cyrillicKeyboard = _toCyrillicKeyboard(prefix);
        var latinKeyboard = _toLatinKeyboard(prefix);
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

        // Сначала происходит замена "букв" из нескольких символов
        Object.keys(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP).forEach(function (char) {
           str = str.split(char).join(LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[char]);
        });

        var charts = str.split('');

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
            if(MULTIPLE_LATIN_CHARTS[lastChart]){
                variants = [];
                var chartVariants = MULTIPLE_LATIN_CHARTS[lastChart];
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
        options = options || { byProperty: 'name', uidProperty: 'uid' };
        var result = {
            matched: false,
            matchedBy: null
        };


        if(selectedSuggestions[suggestion[options.uidProperty]]){
            return result;
        }
        var originalPrefix = prefix;
        prefix = prefix.trim().toLowerCase();

        var prefixes = _getPrefixVariables(prefix);
        // TODO: Произвести оптимизацию (использовать map)

        var suggestionParts = suggestion[options.byProperty].split(' ');
        suggestionParts.unshift(suggestion[options.byProperty]);

        var matched = suggestionParts.some(function (part) {
            part = part.toLowerCase().trim();
            return prefixes.some(function (prefix) {
                var matched =  part.slice(0, prefix.length) === prefix;
                if(matched){
                    result.matchedBy = originalPrefix;
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
        // TODO: Добавить подсветку префиксов
        self.options.itemTemplate = '<div class="ui-item" id="{data.id}"><p>{name}</p></div>';

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
                self._suggestionsWrapper.element.appendChild(renderSuggestion(item));
            });
        }

        function renderSuggestion(suggestion) {
            // TODO: Исправить проброс matchedBy
            var mathedBy = suggestion.mathedBy;
            delete suggestion.mathedBy;

            var element = DropDownItem(self.options.itemTemplate, suggestion, mathedBy);
            element.render();

            // TODO: разобрать на отдельные методы. Добавить setter val на uiElement
            // TODO: пернести обработчик на suggestion-list. Испрользовать делегирование,
            // TODO: чтообы избавиться от лишних обработчиков
            element.element.on('click', function () {
                onSelectSuggestion(suggestion, this);
            });
            // TODO: Сделать нормальный интрефейс для возврата элемента
            return element.element.element;
        }

        function lookup() {
            console.log('LOOKUP');
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

            idx = 0;
            counter = 0;
            while (counter < self.options.limit && idx < self.suggestions.length) {
                var matchResult = self.matcher(val, self.suggestions[idx], self.selectedItems);
                if(matchResult.matched){
                    // TODO: fix it correct
                    self.suggestions[idx].mathedBy = matchResult.matchedBy;
                    self.matchedSuggestions.push(self.suggestions[idx]);
                    counter++;
                }
                idx++;
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
//# sourceMappingURL=ui-drop-down.js.map
