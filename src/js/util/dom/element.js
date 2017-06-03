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

    _UiElement.prototype.clientLeft = function () {
        return this.element.clientLeft;
    };

    _UiElement.prototype.clientRight = function () {
        return this.offsetWidth() - this.clientLeft() - this.clientWidth();
    };

    _UiElement.prototype.clientTop = function () {
        return this.element.clientTop;
    };

    _UiElement.prototype.offsetWidth = function () {
        return this.element.offsetWidth;
    };

    _UiElement.prototype.clientWidth = function () {
        return this.element.clientWidth;
    };

    _UiElement.prototype.addClass = function (cls) {
        this.element.classList.add(cls);
    };

    _UiElement.prototype.removeClass = function (cls) {
      this.element.classList.remove(cls);
    };

    _UiElement.prototype.wrap = function (wrapper) {
        var parent = this.element.parentNode;
        if(this.element.nextSibling){
            parent.insertBefore(wrapper.element, this.element.nextSibling);
        } else {
            parent.appendChild(wrapper.element);
        }
        wrapper.element.appendChild(this.element);
    };

    window.UiElement = UiElement;

})(window);