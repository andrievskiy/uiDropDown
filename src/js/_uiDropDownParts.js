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