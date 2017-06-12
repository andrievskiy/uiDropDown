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
        if(selectorOrElement instanceof _UiElement){
            return selectorOrElement;
        }
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
     *
     * @param {String} attrName
     * @param {String} attrVal
     */
    _UiElement.prototype.setAttribute = function (attrName, attrVal) {
        this.element.setAttribute(attrName, attrVal);
    };

    /**
     * Следующий элмент nextSibling
     * @returns {Node}
     */
    _UiElement.prototype.next = function () {
        return this.element.nextSibling;
    };

    /**
     * Предыидцщий элмент previousSibling
     * @returns {Node}
     */
    _UiElement.prototype.prev = function () {
        return this.element.previousSibling;
    };

    /**
     * Фиксирвоанный список потомков елемента. Фиксация на момент вызова.
     * @returns {[Node]}
     */
    _UiElement.prototype.children = function () {
      return Array.prototype.slice.apply(this.element.children);
    };

    _UiElement.prototype.parent = function () {
        return new _UiElement(this.element.parentNode);
    };

    _UiElement.prototype.parentNode = function () {
        return this.element.parentNode;
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