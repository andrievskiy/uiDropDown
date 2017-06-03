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
        var clientRight =  this.offsetWidth() - this.clientLeft() - this.scrollWidth();
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