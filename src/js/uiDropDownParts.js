/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    var dropDownItemDefaultTemplate = '';

    function DropDownItem(template, data) {
        return new _DropDownItem(template, data);
    }

    function _DropDownItem(template, data) {
        this.element = UiElement.create('div');
        this.element.addClass('ui-drop-down-item-container');

        this.template = template || dropDownItemDefaultTemplate;
        this.data = data;
    }
    
    _DropDownItem.prototype.render = function () {
        var html = uiRenderTemplate(this.template, this.data);
        this.element.html(html);
        return this.element;
    };

    window.DropDownItem = DropDownItem;
})(window);