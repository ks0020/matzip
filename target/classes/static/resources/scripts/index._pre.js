HTMLElement.prototype.hideAllWarnings = function () {
    this.getAllWarnings().forEach(function (warning) {
        warning.innerText = '';
        warning.hide();
    });
}

HTMLElement.prototype.hideWarning = function (name) {
    const warning = this.getWarning(name);
    if (warning) {
        warning.hide();
    }
    return warning;
}

HTMLElement.prototype.getAllWarnings = function () {
    return Array.from(this.querySelectorAll(`._object-warning[data-mz-warning]`));
}

HTMLElement.prototype.getWarning = function (name) {
    return this.querySelector(`._object-warning[data-mz-warning="${name}"]`);
}

HTMLElement.prototype.registerClosers = function () {
    const t = this;
    t.querySelectorAll('[data-mz-close]').forEach(function (close) {
        close.addEventListener('click', function (e) {
            if (typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
            t.hide();
        })
    });
}

HTMLElement.prototype.showWarning = function (name, text) {
    const warning = this.getWarning(name);
    if (warning) {
        warning.show().innerText = text;
    }
    return warning;
}

// noinspection JSUnusedGlobalSymbols
class ContactCounter {
    constructor(element, params) {
        this.element = element;
        this.params = params;
        this.minuteElement = element.querySelector('[data-mz-counter-min]');
        this.secondElement = element.querySelector('[data-mz-counter-sec]');
        this.retryElement = element.querySelector('[data-mz-counter-retry]');
        this.counting = false;
        this.remaining = params?.remaining ?? 179;
        this.oncomplete = function () {
        }
    }

    _interval(_class) {
        if (_class.counting !== true) {
            return;
        }
        const min = Math.floor(_class.remaining / 60);
        const sec = _class.remaining % 60;
        _class.minuteElement.innerText = min;
        _class.secondElement.innerText = sec < 10 ? `0${sec}` : sec;
        _class.remaining--;
        if (_class.remaining < 1) {
            _class.counting = false;
            _class.remaining = 0;
            _class.minuteElement.innerText = '0';
            _class.secondElement.innerText = '00';
            if (typeof _class.oncomplete === 'function') {
                _class.oncomplete();
            }
        }
    }

    start() {
        if (!this.interval) {
            const _toCall = this._interval;
            const _class = this;
            this.interval = setInterval(function () {
                _toCall(_class);
            }, 1000);
        }
        this.counting = true;
    }

    pause() {
        this.counting = false;
    }

    reset() {
        this.counting = false;
        this.remaining = this.params?.remaining ?? 179;
    }
}

const Dialog = {
    Stack: [],
    Type: {
        Error: '_error',
        Default: '_default',
        Information: '_information',
        Warning: '_warning'
    },
    create: function (params) {
        params.type ??= Dialog.Type.Default;
        params.buttons ??= [];
        const dialogEl = document.createElement('div');
        const titleEl = document.createElement('div');
        const bodyEl = document.createElement('div');
        dialogEl.classList.add('_object-dialog', params.type);
        titleEl.innerText = params.title;
        titleEl.classList.add('_title');
        bodyEl.innerText = params.body;
        bodyEl.classList.add('_body');
        dialogEl.append(titleEl, bodyEl);
        dialogEl.show = function () {
            setTimeout(function () {
                dialogEl.setAttribute('visible', '');
            }, 100);
            return dialogEl;
        };
        if (params.buttons && params.buttons.length > 0) {
            const buttonContainerEl = document.createElement('div');
            buttonContainerEl.classList.add('_button-container');
            for (const buttonObject of params.buttons) {
                const buttonEl = document.createElement('div');
                buttonEl.classList.add('_button');
                buttonEl.innerText = buttonObject.text;
                if (typeof buttonObject.onclick === 'function') {
                    buttonEl.onclick = function (e) {
                        buttonObject.onclick(e, dialogEl);
                    };
                }
                buttonContainerEl.append(buttonEl);
            }
            dialogEl.append(buttonContainerEl);
        }
        Dialog.Stack.push(dialogEl);
        document.body.prepend(dialogEl);
        return dialogEl;
    },
    createButton: function (text, onclick) {
        return {
            text: text,
            onclick: onclick
        }
    }
};

Dialog.showCommonLogin = function (title, body) {
    cover.show();
    Dialog.create({
        title: title,
        body: body,
        buttons: [
            Dialog.createButton('로그인', function (_, dialog) {
                dialog.hide();
                loginForm.show();
            }),
            Dialog.createButton('취소', function (_, dialog) {
                dialog.hide();
                cover.hide();
            })
        ]
    }).show();
}

const Regex = {
    ContactCode: {
        Code: new RegExp('^(\\d{6})$')
    },
    EmailCode: {
        Code: new RegExp('^([\\da-zA-Z]{32})$')
    },
    Place: {
        AddressSecondary: new RegExp('^(?=.{0,100}$)(.{0}|[\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$'),
        Contact: new RegExp('^(\\d{10,12})$'),
        Name: new RegExp('^([\\da-zA-Z가-힣][\\da-zA-Z가-힣 ]{0,23}[\\da-zA-Z가-힣])$')
    },
    User: {
        AddressSecondary: new RegExp('^(?=.{0,100}$)(.{0}|[\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$'),
        Contact: new RegExp('^(010\\d{8})$'),
        Email: new RegExp('^(?=.{8,50}$)([\\da-zA-Z][\\da-zA-Z\\-_.]+[\\da-zA-Z])@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$'),
        Name: new RegExp('^([가-힣]{2,5})$'),
        Nickname: new RegExp('^([a-zA-Z가-힣]{2,10})$'),
        Password: new RegExp('^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]}\\\\|;:\'",<.>/?]{4,50})$')
    }
};

const cover = document.getElementById('_cover');

cover.show = function (toDoOnClick) {
    cover.onclick = typeof toDoOnClick === 'function' ? toDoOnClick : undefined;
    cover.setAttribute('visible', '');
    return this;
}

const loading = document.getElementById('_loading');

loading.show = function () {
    ['input', 'select', 'textarea'].forEach(function (t) {
        document.body.querySelectorAll(t).forEach(function (e) {
            if (!e.disabled) {
                e.dataset.loadingDisabled = 'on';
                e.setAttribute('disabled', '');
            }
        });
    });
    loading.setAttribute('visible', '');
    return this;
}

loading.hide = function () {
    ['input', 'select', 'textarea'].forEach(function (t) {
        document.body.querySelectorAll(t).forEach(function (e) {
            if (e.dataset.loadingDisabled) {
                delete e.dataset.loadingDisabled;
                e.removeAttribute('disabled');
            }
        });
    });
    loading.removeAttribute('visible');
    return this;
}

const User = {
    isSigned: function () {
        return document.head.querySelector(':scope > meta[name="var-signed"]')?.getAttribute('content') === 'true';
    }
};