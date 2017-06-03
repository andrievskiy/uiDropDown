/**
 * Created by andrievskiy on 03.06.17.
 */
;(function (window) {
    function renderTemplate(template, data) {
          return template.replace(/{(\w+)}/g, function (match, key) {
            return data[key] || '';
        })
    }

    window.uiRenderTemplate = renderTemplate;
})(window);