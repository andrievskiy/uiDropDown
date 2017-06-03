/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    function UiDropDown(selector, options) {
        options = options || {};
        this.element = UiElement(selector);
        this.suggestions = options.suggestions || [];
        
        this._suggestionsWrapper = createSuggestionWrapper();
        this._dropDownInputWrapper = createDropDownInputWrapper();
        this.element.wrap(this._dropDownInputWrapper);

        
        function createSuggestionWrapper() {
            var element = UiElement(document.createElement('div'));
            element.addClass('ui-drop-down-autocomplete-suggestions');
            return element;
        }
        
        function createDropDownInputWrapper() {
            var element = UiElement(document.createElement('div'));
            element.addClass('ui-drop-down-input-wrapper');
            return element;
        }

    }
    window.UiDropDown = UiDropDown;
})(window);