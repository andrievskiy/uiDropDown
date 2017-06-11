/**
 * Модуль для работы с шаблонами
 */
;(function (window) {

    /**
     * Рендеринг шаблонов
     * @param template {string} - Шаблон для рендеринга
     *                            Подстановки производяться по швблону {name}
     *                            При этом при указании {name::html} для данного значения не будет производиться экранирование
     * @param data {object} - Даные для рендеринга. Поиск даныных для подставновок производится по ключам этого объекта
     * @returns {string}
     */
    function renderTemplate(template, data) {
        return template.replace(/{([\w|:]+)}/g, function (match, key) {

            var isHtml = ~key.indexOf('::html');
            if(isHtml){
                key = key.split('::')[0];
                return data[key] || '';
            }
            return uiDropDownHtmlEscaping(data[key] || '');
        })
    }

    window.uiRenderTemplate = renderTemplate;
})(window);