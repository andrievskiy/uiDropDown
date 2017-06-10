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