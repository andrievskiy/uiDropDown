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
     * Класс враппера для работы с DOM элементами
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
            left: byWindow.left + scrollLeft - clientLeft,
            bottom: byWindow.bottom + scrollTop - clientTop,
            right: byWindow.right + scrollLeft - clientLeft
        }
    };

    /**
     * clientLeft
     * @returns {number}
     */
    _UiElement.prototype.clientLeft = function () {
        return this.element.clientLeft;
    };

    /**
     * clientRight = в реалльности borderRightWidth
     * @returns {number}
     */
    _UiElement.prototype.clientRight = function () {
        var computedStyles = window.getComputedStyle(this.element);
        var borderRight = computedStyles.borderRightWidth;
        borderRight = borderRight.split('px')[0];
        return +borderRight;
    };

    /**
     * clientTop
     * @returns {number}
     */
    _UiElement.prototype.clientTop = function () {
        return this.element.clientTop;
    };


    /**
     * offsetWidth
     * @returns {number}
     */
    _UiElement.prototype.offsetWidth = function () {
        return this.element.offsetWidth;
    };

    /**
     *clientWidth
     * @returns {number}
     */
    _UiElement.prototype.clientWidth = function () {
        return this.element.clientWidth;
    };

    /**
     * offsetHeight
     * @returns {number}
     */
    _UiElement.prototype.offsetHeight = function () {
        return this.element.offsetHeight;
    };

    /**
     * clientHeight
     * @returns {number}
     */
    _UiElement.prototype.clientHeight = function () {
        return this.element.clientHeight;
    };



    /**
     *
     * @returns {number}
     */
    _UiElement.prototype.scrollWidth = function () {
        return this.element.scrollWidth;
    };

    /**
     * Добавить класс
     * @param cls {str}
     */
    _UiElement.prototype.addClass = function (cls) {
        this.element.classList.add(cls);
    };

    /**
     * Удалить класс
     * @param cls {str}
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
     * @param value {string | Number}
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
     * Подписка на событие
     * @param eventKey {string}
     * @param callback {Function}
     * @param stage
     */
    _UiElement.prototype.on = function (eventKey, callback, stage) {
        this.element.addEventListener(eventKey, callback, stage);
    };

    /**
     * Отмена подписки на событие
     * @param evenKey {string}
     * @param callback {Function}
     * @param stage
     */
    _UiElement.prototype.off = function (evenKey, callback, stage) {
        this.element.removeEventListener(evenKey, callback, stage);
    };

    /**
     * Удалить потомка
     * @param child {UiElement | Node}
     * @returns {Node}
     */
    _UiElement.prototype.removeChild =function (child) {
        if(child instanceof _UiElement){
            child = child.element;
        }
        return this.element.removeChild(child);
    };

    /**
     * Добаить потомка к элементу
     * @param child {UiElement | Node}
     * @returns {Node}
     */
    _UiElement.prototype.append = function (child) {
        if(child instanceof _UiElement){
             return this.element.appendChild(child.element);
        }
        return this.element.appendChild(child);
    };

    /**
     * Установаить или поллучить innerHtml
     * @param val {string}
     * @returns {string | undefined}
     */
    _UiElement.prototype.html = function (val) {
        if(val != undefined){
            this.element.innerHTML = val;
            return;
        }
        return this.element.innerHTML;
    };

    /**
     * Удаление элемента из DOM
     */
    _UiElement.prototype.remove = function(){
        this.element.parentNode.removeChild(this.element);
    };

    /**
     * Установить или получить css свойства
     * @param css {object}
     * @returns {CSSStyleDeclaration}
     */
    _UiElement.prototype.css = function (css) {
        var self = this;
        if(!css){
            return window.getComputedStyle(this.element);
        }
        Object.keys(css).forEach(function (property) {
           self.element.style[property] = css[property];
        });
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
 * Простая обертка к XMLHttpRequest
 */
(function (window) {
    function _makeGetArgs(params) {
        var parts = [];
        Object.keys(params).forEach(function (key) {
            parts.push(key + '=' + params[key]);
        });
        return '?' + parts.join('&');
    }

    function isOkStatusCode(code){
        return code >= 200 && code < 300;
    }

    /**
     * Совершает ajax запрос
     * @param options {object} - параметры запроса
     * @param options.method {string} - HTTP метод запроса (GET|POST|PUT|DELETE)
     * @param options.url {string} - Url для запрсоа
     * @param options.params {object} - Uri (GET) параметра запроса
     * @param options.onError {Function} - Функция-обработчик ошибок
     * @param options.onSuccess {Function} -  Функция-обработчик успешного запроса
     * @param options.data {object} - Данные для загрузки (payload)
     * @returns {XMLHttpRequest}
     */
    function uiDropDownAjax(options) {
        var xhr = new XMLHttpRequest();
        var url = options.url + _makeGetArgs(options.params);
        xhr.open(options.method.toUpperCase(), url);

        xhr.onerror = function () {
            console.error(xhr.status, xhr.statusText);
            if (options.onError) {
                options.onError(xhr);
            }
        };

        xhr.onload = function () {
            var response;
            if (isOkStatusCode(xhr.status)) {
                if (options.onSuccess) {
                    if (~xhr.getResponseHeader('Content-Type').indexOf('application/json')) {
                        try {
                            response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            console.error(e);
                            response = null;
                        }
                    } else {
                        response = xhr.responseText;
                    }
                    options.onSuccess(response);
                }
            } else{
                console.error('Unexpected response code: ', xhr.status);
            }
        };

        if (options.method.toUpperCase() != 'GET') {
            xhr.send(options.data);
        } else {
            xhr.send();
        }
        return xhr;
    }

    window.uiDropDownajax = uiDropDownAjax;
})(window);
/**
 * Утилиты для работы с html
 */
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

    /**
     * Производит экранирование html символов
     * @param str
     * @returns {*}
     */
    function uiDropDownHtmlEscaping(str) {
        if(typeof str != 'string'){
            return str;
        }
        return str.replace(regex, function (m) {
            return '&' + ESCAPE_CHARS[m] + ';';
        });
    }

    window.uiDropDownHtmlEscaping = uiDropDownHtmlEscaping;
})(window);
/**
 * Константы для работы с различными расладками.
 * Используются в uiDropDownKeyBoardUtil
 */
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
        '[': 'х',
        ']': 'ъ',
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
        ':': 'ж',
        "'": 'э',
        '"': 'э',
        'z': 'я',
        'x': 'ч',
        'c': 'с',
        'v': 'м',
        'b': 'и',
        'n': 'т',
        'm': 'ь',
        ',': 'б',
        '<': 'б',
        '>': 'ю',
        '.': 'ю'
    };

    var CYRILLIC_TO_LATIN_KEYBOARD = {};

    Object.keys(LATIN_TO_CYRILLIC_KEYBOARD).map(function (key) {
        var k = LATIN_TO_CYRILLIC_KEYBOARD[key];
        CYRILLIC_TO_LATIN_KEYBOARD[k] = key;
    });

    var LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP = {
        'shch': 'щ',
        'sch': 'щ',
        'yo': 'ё',
        'zh': 'ж',
        'kh': 'х',
        'ts': 'ц',
        'ch': 'ч',
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


    var MULTIPLE_LATIN_CHARS = {
        'y': ['ы', 'ё', 'ю', 'я'],
        'z': ['ж', 'з'],
        'k': ['х', 'к'],
        't': ['ц', 'т'],
        'c': ['ц', 'ч', 'щ'],
        's': ['ш', 'щ', 'с'],
        'e': ['е', 'э']
    };

    var LATIN_ALPHABET = 'abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ';
    var CYRILLIC_ALPHABET = 'абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ';

    window.uiDropDownKeyboardConstants = {
        LATIN_TO_CYRILLIC_KEYBOARD: LATIN_TO_CYRILLIC_KEYBOARD,
        CYRILLIC_TO_LATIN_KEYBOARD: CYRILLIC_TO_LATIN_KEYBOARD,
        LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP: LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP,
        CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP: CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP,
        MULTIPLE_LATIN_CHARS: MULTIPLE_LATIN_CHARS,
        LATIN_ALPHABET: LATIN_ALPHABET,
        CYRILLIC_ALPHABET: CYRILLIC_ALPHABET
    };

})(window);
/**
 * Модуль для работы с вариантами различных расладок.
 * Осуществляет поиск всех возможных преставлений строки.
 * Например кщпщя -> rogoz -> рогоз
 *
 */
(function (window) {
    'use strict';

    /**
     * Производит сортировку по длине строки.
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    function _sortKeysComparator(a, b) {
        if (a.length < b.length) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        return 0;
    }

    function _replaceAlaphabet(str, srcAlphabet, dstAlphabet) {
        for (var i = 0; i < srcAlphabet.length; i++) {
            str = str.split(srcAlphabet.charAt(i)).join(dstAlphabet.charAt(i));
        }
        return str;
    }

    /**
     * _latinToCyrillicVariants -> возвращает возможные варианты раскладки для латнских букв по строке
     * @param str {string}
     * @returns {Array}
     * @private
     */
    function _latinToCyrillicVariants(str) {

        var variants;
        var chars;
        var firstChars;

        // Сначала происходит замена "букв" из нескольких символов

        firstChars = Object.keys(uiDropDownKeyboardConstants.LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP);
        firstChars.sort(_sortKeysComparator);
        firstChars.forEach(function (char) {
            str = str.split(char).join(uiDropDownKeyboardConstants.LATIN_TO_CYRILLIC_FIRST_REPLACE_MAP[char]);
        });

        chars = str.split('');
        variants = _extendVariants(chars);

        variants = variants.map(function (variant) {
            return _replaceAlaphabet(
                variant.join(''), uiDropDownKeyboardConstants.LATIN_ALPHABET, uiDropDownKeyboardConstants.CYRILLIC_ALPHABET
            );
        });

        return variants;


        /**
         * Производит расширение вариантов для  символов соответствующих нескольким русским буквам
         * при условии что символ находится в конце строки (т.е. невозиожно определить к чему он приводится)
         * @param chars {string}
         * @returns {Array}
         * @private
         */
        function _extendVariants(chars) {
            var variants = [chars];
            var lastChart = chars[chars.length - 1];
            var chartVariants;

            if (uiDropDownKeyboardConstants.MULTIPLE_LATIN_CHARS[lastChart]) {
                variants = [];
                chartVariants = uiDropDownKeyboardConstants.MULTIPLE_LATIN_CHARS[lastChart];
                chartVariants.forEach(function (chartVar) {

                    var newVariant = chars.slice(0, chars.length - 1);
                    newVariant.push(chartVar);
                    variants.push(newVariant);
                });
            }
            return variants;
        }
    }


    function _cyrillicToLatinVariants(str) {

        var firstChars = Object.keys(uiDropDownKeyboardConstants.CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP);
        firstChars.sort(_sortKeysComparator);

        // Сначала происходит замена "букв" из нескольких символов
        firstChars.forEach(function (char) {
            str = str.split(char).join(uiDropDownKeyboardConstants.CYRILLIC_TO_LATIN_FIRST_REPLACE_MAP[char]);
        });

        var variant = _replaceAlaphabet(str, uiDropDownKeyboardConstants.CYRILLIC_ALPHABET, uiDropDownKeyboardConstants.LATIN_ALPHABET);

        return [variant];
    }


    /**
     * toCyrillicKeyboard -> Производит замену латинской раскладки на кириллицу
     * @param str {string}
     * @returns {string}
     */
    function toCyrillicKeyboard(str) {
        var result = '';
        var chars = str.split('');
        chars.forEach(function (chart) {
            result += uiDropDownKeyboardConstants.LATIN_TO_CYRILLIC_KEYBOARD[chart] || chart;
        });

        return result;
    }

    /**
     * toLatinKeyboard -> Производит замену кириллической раскладки на латинскую
     * @param str {string}
     * @returns {string}
     */
    function toLatinKeyboard(str) {
        var result = '';
        var chars = str.split('');
        chars.forEach(function (chart) {
            result += uiDropDownKeyboardConstants.CYRILLIC_TO_LATIN_KEYBOARD[chart] || chart;
        });
        return result;
    }


    /**
     * getPrefixVariables -> Возвращает все варианты представления по строке
     *
     * @param prefix {string}
     * @returns {Array}
     * @private
     */
    function getKeyboardsVariables(prefix) {
        var variables = [];
        var cyrillicKeyboard;
        var latinKeyboard;

        // Получение всех кирилических вариантов по латинице
        // За счет того, что латиница уже, то одну строку на ней
        // Можжно представить несколькими на кирилице
        // Например: z = ж | z = з

        variables = variables.concat(_latinToCyrillicVariants(prefix));

        // Приведение кириллицы к латинице
        // Например: юа => yoa
        variables.concat(_cyrillicToLatinVariants(prefix));

        // Приведение расладок

        cyrillicKeyboard = toCyrillicKeyboard(prefix);
        latinKeyboard = toLatinKeyboard(prefix);
        variables.push(cyrillicKeyboard);
        variables.push(latinKeyboard);

        // Транслитерация для раскладок
        // Например: кщпщя -> rogoz -> рогоз

        variables.push(_cyrillicToLatinVariants(cyrillicKeyboard));
        variables = variables.concat(_latinToCyrillicVariants(latinKeyboard));

        // Вывод уникальных валидаторов
        variables = variables.filter(function (item, idx, array) {
            return array.indexOf(item) === idx;
        });

        return variables;
    }


    /**
     * Набор утилит для работы с раскладкми.
     * toCyrillicKeyboard -> Производит замену латинской раскладки на кириллицу
     * toLatinKeyboard -> Производит замену кириллической раскладки на латиницу
     * getPrefixVariables -> Возвращает все варианты представления по строке
     * @type {{toCyrillicKeyboard: toCyrillicKeyboard, toLatinKeyboard: toLatinKeyboard, getPrefixVariables: getKeyboardsVariables}}
     */
    window.uiDropDownKeyBoardUtil = {
        toCyrillicKeyboard: toCyrillicKeyboard,
        toLatinKeyboard: toLatinKeyboard,
        getPrefixVariables: getKeyboardsVariables
    };

})(window);
/**
 * Модуль для работы с шаблонами
 */
;(function (window) {

    /**
     * Рендеринг шаблонов
     * @param template {string} - Шаблон для рендеринга
     *                            Подстановки производяться по швблону {name}
     *                            При этом при указании {name::html} для данного значения не будет производиться экранирование
     * @param data {object} - Даные для рендеринга. Поиск даныных для подставновок производится по ключам этого объекта
     * @returns {string}
     */
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
    function DropDownSuggestionItem(template, data, matchedBy) {
        return new _DropDownSuggestionItem(template, data, matchedBy);
    }

    function _DropDownSuggestionItem(template, data, matchedBy, defaultAvatarUrl) {
        var self = this;
        this.uiElement = UiElement.create('div');
        this.uiElement.addClass('ui-drop-down-item-container');

        this.template = template;
        this.data = data;
        this.matchedBy = matchedBy;

        this.name = uiDropDownHtmlEscaping(this.data.name);
        this.name = this.name.replace(this.matchedBy, '<span class="ui-drop-down-highlight">' + this.matchedBy + '</span>');
        this.uid = this.data.uid;
        this.avatarUrl = this.data.avatarUrl || this.data.avatar || defaultAvatarUrl || '';


        Object.keys(this.data).forEach(function (dataKey) {
            if(!self[dataKey]){
                self[dataKey] = self.data[dataKey];
            }
        });
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
        var self = this;
        this.uiElement = UiElement.create('div');
        var containerCls = multiple ? 'ui-drop-down-selected-suggestion': 'ui-drop-down-single-selected-suggestion';
        this.uiElement.addClass(containerCls);

        this.template = template || dropDownItemDefaultTemplate;
        this.data = data;
        this.name = this.data.name;
        this.uid = this.data.uid;

        Object.keys(this.data).forEach(function (dataKey) {
            if(!self[dataKey]){
                self[dataKey] = self.data[dataKey];
            }
        });
    }
    
    _DropDownSelectedSuggestionItem.prototype.render = function () {
        var html = uiRenderTemplate(this.template, this);
        this.uiElement.html(html);
        return this.uiElement;
    };

    window.DropDownSelectedSuggestionItem = DropDownSelectedSuggestionItem;
})(window);
(function (window) {
    /**
     * Производит сравнение по префиксу с учетом раскладок и транслитерации
     * @param prefix {String} - префикс по которому производится поиск
     * @param suggestion {Object} - предложение, котрое нужно проверить
     * @param selectedSuggestions {Array} - уже выбранные предложения
     * @param options {Object} - список опций
     * @param options.byProperty {String} - свойтво по которму производится сравненение
     * @param options.uidProperty {String} - свойтво уникальный идентификатор
     * @returns {Object} - результат поиска
     *    {
     *      matched: {Boolean} - флаг подходит или нет объект под префикс,
     *      matchedBy: {string} - подстрока по которой произошло совпадение
     *    }
     */


    function uiDropDownUsersMatcher(prefix, suggestion, selectedSuggestions, options) {
        // TODO: Скорость работы через регулярные выражения оказалась ниже
        // TODO: Придумать способ повысить эффективность поиска
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

        prefixes = uiDropDownKeyBoardUtil.getPrefixVariables(prefix);

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

        self._cache = {};
        self._lastVal = null;
        self._serverQuryIsRunning = false;

        self._suggestionTemplate = getSuggestionTemplate();
        self._selectedItemTemplate = getSelectedItemTemplate();

        self.inputElement = UiElement(selector);
        self.inputElement.addClass('ui-drop-down-input');
        if (!self.options.autocomplete) {
            self.inputElement.element.setAttribute('readonly', 'true');
        }

        self.suggestions = self.options.suggestions || [];
        self.matcher = self.options.matcher || uiDropDownUsersMatcher;

        self.matchedSuggestions = [];
        self._matchesSuggestionIds = Object.create(null);
        self.selectedItems = Object.create(null);

        self._dropDownInputWrapper = createDropDownInputWrapper();
        self._suggestionsWrapper = createSuggestionWrapper();
        self._selectedContainer = createSelectedSuggestionsContainer();
        self._dropDownIcon = createDropDownIcon();
        appendElementsToDom();


        self.inputElement.on('focus', onFocusInputHandler);
        self.inputElement.on('keyup', deBounce(onKeyUpInputHandler, 300));
        self.inputElement.on('blur', onBlurInputElement);

        self._dropDownInputWrapper.on('click', onClickWrapper);

        self._suggestionsWrapper.on('mouseenter', onHoverSuggestionsWrapper);
        self._suggestionsWrapper.on('mouseleave', onMouseLeaveSuggestionsWrapper);

        self._selectedContainer.on('click', onClickSelectedContainer);

        function appendElementsToDom() {
            self.inputElement.wrap(self._dropDownInputWrapper);
            document.body.appendChild(self._suggestionsWrapper.element);

            self._dropDownInputWrapper.element.insertBefore(self._dropDownIcon.element, self.inputElement.element);
            self._dropDownInputWrapper.element.insertBefore(self._selectedContainer.element, self.inputElement.element);

            var originInputElementW = self.inputElement.clientWidth();

            self.inputElement.css({
                width: originInputElementW - self._dropDownIcon.offsetWidth()- 15 + 'px'
            });
        }

        function createDropDownIcon(){
            var e = UiElement.create('div');
            e.addClass('ui-widget-drop-down-icon');
            return e;
        }


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

        function isSelected(item) {
            return Boolean(self.selectedItems[item[self.options.suggestionIdentifierProperty]]);
        }

        function addItemToSelected(item) {
            self.selectedItems[item[self.options.suggestionIdentifierProperty]] = item;
        }

        function isInMatchedSuggestions(item) {
            return Boolean(self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]]);
        }

        function addToMatchedSuggestions(item) {
            self.matchedSuggestions.push(item);
            self._matchesSuggestionIds[item[self.options.suggestionIdentifierProperty]] = true;
        }

        function onClickSelectedContainer(event) {
            var target = event.target;
            if (target.getAttribute('data-is-remove-button') == 'true') {
                removeSelectedSuggestion(target);
                if (!self.getSelected().length) {
                    hideSelectedContainer();
                    showInputElement();
                }
            } else {
                activateInputElement();
            }

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
            if (self._suggestionsWrapper.hovered) {
                return;
            }
            hideSuggestiosnList();
            if (self.options.multiple && self.getSelected().length) {
                hideInputElement();
            }
            if (!self.options.multiple && self.getSelected().length) {
                hideInputElement();
                showSelectedContainer();
            }
        }

        function onFocusInputHandler() {
            open();
        }

        function onKeyUpInputHandler() {
            search();
        }

        function onClickWrapper(event) {
            if (event.target === this) {
                activateInputElement();
            }
            if(event.target == self._dropDownIcon.element){
                activateInputElement();
            }
        }

        function onBlurInputElement() {
            close();
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
            hideSuggestiosnList();
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

        function createSuggestionWrapper() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-autocomplete-suggestions');
            return element;
        }

        function createDropDownInputWrapper() {
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

        function createSelectedSuggestionsContainer() {
            var element = UiElement.create('div');
            element.addClass('ui-drop-down-selected-container');

            return element;
        }

        function showSuggestionList() {
            self._suggestionsWrapper.addClass('show');
            positionSuggestionList();
        }

        function hideSuggestiosnList() {
            self._suggestionsWrapper.removeClass('show');
        }


        /**
         * Прозводит позиционирование блока предложений относительно эелемента
         * В зависимости от его позиционирования(static/relative)
         */
        function positionSuggestionList() {
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
            // TODO: Исправить проброс matchedBy
            var matchedBy = suggestion.mathedBy;
            delete suggestion.mathedBy;

            var dropDownItem = DropDownSuggestionItem(
                self._suggestionTemplate, suggestion, matchedBy, self.options.defaultAvatarUrl
            );
            dropDownItem.render();
            // TODO: пернести обработчик на suggestion-list. Испрользовать делегирование,
            // TODO: чтообы избавиться от лишних обработчиков
            // TODO: С ходу мешает необходимость ссылки на item(suggestion)
            dropDownItem.uiElement.on('click', function () {
                onSelectSuggestion(suggestion, this);
            });
            self._suggestionsWrapper.append(dropDownItem.uiElement);
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
                if (isSelected(item)) {
                    idx++;
                    continue;
                }

                addToMatchedSuggestions(item);
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
                    addToMatchedSuggestions(self.suggestions[idx]);
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
                if (!isSelected(suggestion) && !isInMatchedSuggestions(suggestion)) {
                    addToMatchedSuggestions(suggestion);
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
//# sourceMappingURL=ui-drop-down.js.map
