(function (window) {
    function uiDropDownajax(options) {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method.toUpperCase(), options.url, true);


        xhr.onerror = function () {
            console.error(xhr.status, xhr.statusText);
            if (options.onError) {
                options.onError(xhr);
            }
        };

        xhr.onload = function () {
            var response;
            if (options.onSuccess) {
                if (~xhr.getResponseHeader('Content-Type').indexOf('application/json')) {
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e){
                        console.error(e);
                    }
                } else {
                    response = xhr.responseText;
                }
                options.onSuccess(response);
            }
        };

        if (options.method.toUpperCase() != 'GET') {
            xhr.send(options.data);
        } else {
            xhr.send();
        }
        return xhr;
    }
    window.uiDropDownajax = uiDropDownajax;
})(window);