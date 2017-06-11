/**
 * Простая обертка к XMLHttpRequest
 */
(function (window) {
    function _makeGetArgs(params) {
        var parts = [];
        Object.keys(params).forEach(function (key) {
            parts.push(key + '=' + params[key]);
        });
        return '?' + parts.join('&');
    }

    function isOkStatusCode(code){
        return code >= 200 && code < 300;
    }

    /**
     * Совершает ajax запрос
     * @param options {object} - параметры запроса
     * @param options.method {string} - HTTP метод запроса (GET|POST|PUT|DELETE)
     * @param options.url {string} - Url для запрсоа
     * @param options.params {object} - Uri (GET) параметра запроса
     * @param options.onError {Function} - Функция-обработчик ошибок
     * @param options.onSuccess {Function} -  Функция-обработчик успешного запроса
     * @param options.data {object} - Данные для загрузки (payload)
     * @returns {XMLHttpRequest}
     */
    function uiDropDownAjax(options) {
        var xhr = new XMLHttpRequest();
        var url = options.url + _makeGetArgs(options.params);
        xhr.open(options.method.toUpperCase(), url);

        xhr.onerror = function () {
            console.error(xhr.status, xhr.statusText);
            if (options.onError) {
                options.onError(xhr);
            }
        };

        xhr.onload = function () {
            var response;
            if (isOkStatusCode(xhr.status)) {
                if (options.onSuccess) {
                    if (~xhr.getResponseHeader('Content-Type').indexOf('application/json')) {
                        try {
                            response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            console.error(e);
                            response = null;
                        }
                    } else {
                        response = xhr.responseText;
                    }
                    options.onSuccess(response);
                }
            } else{
                console.error('Unexpected response code: ', xhr.status);
            }
        };

        if (options.method.toUpperCase() != 'GET') {
            xhr.send(options.data);
        } else {
            xhr.send();
        }
        return xhr;
    }

    window.uiDropDownajax = uiDropDownAjax;
})(window);