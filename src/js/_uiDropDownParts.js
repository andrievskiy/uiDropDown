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
        this.uiElement = UiElement.create('div');
        this.uiElement.addClass('ui-drop-down-item-container');

        this.template = template || dropDownItemDefaultTemplate;
        this.data = data;
        this.matchedBy = matchedBy;
        this.name = this.data.name.replace(this.matchedBy, '<span class="highlight">' + this.matchedBy + '</span>');
    }
    
    _DropDownItem.prototype.render = function () {
        var html = uiRenderTemplate(this.template, this);
        this.uiElement.html(html);
        return this.uiElement;
    };

    window.DropDownItem = DropDownItem;
})(window);