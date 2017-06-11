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

        this.uid = this.data.uid;
        this.avatarUrl = this.data.avatarUrl || this.data.avatar || defaultAvatarUrl || '';


        Object.keys(this.data).forEach(function (dataKey) {
            if(!self[dataKey]){
                self[dataKey] = self.data[dataKey];
            }
        });
    }
    
    _DropDownSuggestionItem.prototype.render = function () {
        this.highlight();
        var html = uiRenderTemplate(this.template, this);
        this.uiElement.html(html);
        return this.uiElement;
    };

    _DropDownSuggestionItem.prototype.highlight = function () {
        this.name = uiDropDownHtmlEscaping(this.data.name);
        this.name = this.name.replace(this.matchedBy, '<span class="ui-drop-down-highlight">' + this.matchedBy + '</span>');
    };
    window.DropDownSuggestionItem = DropDownSuggestionItem;
})(window);