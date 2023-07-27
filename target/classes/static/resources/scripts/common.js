// noinspection JSUnusedGlobalSymbols

HTMLElement.prototype.disable = function () {
    this.setAttribute('disabled', '');
    return this;
}

HTMLElement.prototype.enable = function () {
    this.removeAttribute('disabled');
    return this;
}

HTMLElement.prototype.hide = function () {
    this.removeAttribute('visible');
    return this;
}

HTMLElement.prototype.isDisabled = function () {
    return this.hasAttribute('disabled');
}

HTMLElement.prototype.isEnabled = function () {
    return !this.hasAttribute('disabled');
}

HTMLElement.prototype.isVisible = function () {
    return this.hasAttribute('visible');
}

HTMLElement.prototype.show = function () {
    this.setAttribute('visible', '');
    return this;
}

HTMLInputElement.prototype.focusAndSelect = function () {
    this.focus();
    this.select();
    return this;
}

const Ajax = {
    Method: {
        Delete: 'DELETE',
        Get: 'GET',
        Patch: 'PATCH',
        Post: 'POST',
        Put: 'PUT'
    },
    request: function (params) {
        const xhr = new XMLHttpRequest();
        if (typeof params.onabort === 'function') {
            xhr.addEventListener('abort', params.onabort);
        }
        if (typeof params.onerror === 'function') {
            xhr.addEventListener('error', params.onerror);
        }
        if (typeof params.onload === 'function') {
            xhr.addEventListener('load', params.onload);
        }
        if (typeof params.onloadend === 'function') {
            xhr.addEventListener('loadend', params.onloadend);
        }
        if (typeof params.onloadstart === 'function') {
            xhr.addEventListener('loadstart', params.onloadstart);
        }
        if (typeof params.onprogress === 'function') {
            xhr.addEventListener('progress', params.onprogress);
        }
        if (typeof params.onreadystatechange === 'function') {
            xhr.addEventListener('readystatechange', params.onreadystatechange);
        }
        if (typeof params.ontimeout === 'function') {
            xhr.addEventListener('timeout', params.ontimeout);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (typeof params.ondone === 'function') {
                params.ondone(xhr.status, xhr.responseText);
            }
            if (xhr.status >= 200 && xhr.status < 300 && typeof params.ondonegood === 'function') {
                params.ondonegood(xhr.status, xhr.responseText);
            }
            if ((xhr.status < 200 || xhr.status >= 300) && typeof params.ondonebad === 'function') {
                params.ondonebad(xhr.status);
            }
        }
        xhr.open(params.method, params.url);
        xhr.send(params.data);
    }
};

const Constants = {
    DaysEn: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    DaysKo: ['일', '월', '화', '수', '목', '금', '토']
};