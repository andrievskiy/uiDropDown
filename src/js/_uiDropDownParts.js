;(function (window) {
    var dropDownItemDefaultTemplate = '';

    function DropDownItem(template, data, matchedBy) {
        return new _DropDownItem(template, data, matchedBy);
    }

    function _DropDownItem(template, data, matchedBy) {
        this.uiElement = UiElement.create('div');
        this.uiElement.addClass('ui-drop-down-item-container');

        this.template = template || dropDownItemDefaultTemplate;
        this.data = data;
        this.matchedBy = matchedBy;
        this.name = uiDropDownHtmlEscaping(this.data.name);
        this.name = this.name.replace(this.matchedBy, '<span class="ui-drop-down-highlight">' + this.matchedBy + '</span>');
        console.log('_DropDownItem', this.matchedBy);
    }
    
    _DropDownItem.prototype.render = function () {
        var html = uiRenderTemplate(this.template, this);
        this.uiElement.html(html);
        return this.uiElement;
    };

    window.DropDownItem = DropDownItem;
})(window);