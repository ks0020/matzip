const recoverForm = document.getElementById('recoverForm');

recoverForm.show = function () {
    cover.show(function () {
        recoverForm.hide();
    });
    registerForm.scrollTop = 0;
    recoverForm['choice'].value = 'email';
    recoverForm['emailRetry'].click();
    recoverForm.setAttribute('data-mz-choice', 'email');
    recoverForm.setAttribute('visible', '');
    return this;
}

recoverForm.hide = function () {
    cover.hide();
    recoverForm.removeAttribute('visible');
    return this;
}

recoverForm.onsubmit = function (e) {
    e.preventDefault();
    if (recoverForm.getAttribute('data-mz-choice') === 'email') {
        if (recoverForm['emailName'].value === '') {
            recoverForm.showWarning('emailName', '이름(실명)을 입력해 주세요.');
            recoverForm['emailName'].focus();
            return false;
        }
        if (!Regex.User.Name.test(recoverForm['emailName'].value)) {
            recoverForm.showWarning('emailName', '올바른 이름(실명)을 입력해 주세요.');
            recoverForm['emailName'].focusAndSelect();
            return false;
        }
        if (recoverForm['emailContactSalt'].value === '' ||
            !recoverForm['emailContact'].disabled ||
            !recoverForm['emailContactSend'].disabled ||
            !recoverForm['emailContactCode'].disabled ||
            !recoverForm['emailContactVerify'].disabled) {
            recoverForm.showWarning('emailContact', '연락처 인증을 완료해 주세요.');
            return false;
        }
        const formData = new FormData();
        formData.append('name', recoverForm['emailName'].value);
        formData.append('contact', recoverForm['emailContact'].value);
        formData.append('code', recoverForm['emailContactCode'].value);
        formData.append('salt', recoverForm['emailContactSalt'].value);
        loading.show();
        Ajax.request({
            method: Ajax.Method.Post,
            url: '/user/recover-email',
            data: formData,
            ondone: function () {
                loading.hide();
            },
            ondonebad: function() {
                recoverForm.showWarning('emailCommon', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            },
            ondonegood: function(_, responseText) {
                recoverForm['emailRetry'].show();
                recoverForm['emailSubmit'].hide();
                const responseObject = JSON.parse(responseText);
                switch (responseObject['result']) {
                    case 'failure':
                        recoverForm.showWarning('emailCommon', '입력하신 이름과 연락처와 일치하는 회원을 찾을 수 없습니다. 입력하신 정보를 다시 확인해 주세요.');
                        break;
                    case 'success':
                        recoverForm.showWarning('emailCommon', `찾으시는 이메일은 '${responseObject.email}'입니다. 마스킹(*)이 없는 이메일은 입력하신 연락처로 전송되었습니다.`);
                        break;
                    default:
                        recoverForm.showWarning('emailCommon', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
        });
    }
    if (recoverForm.getAttribute('data-mz-choice') === 'password') {
        if (recoverForm['passwordPassword'].value === '') {
            recoverForm.showWarning('passwordPassword', '새로운 비밀번호를 입력해 주세요.');
            recoverForm['passwordPassword'].focus();
            return false;
        }
        if (!Regex.User.Password.test(recoverForm['passwordPassword'].value)) {
            recoverForm.showWarning('passwordPassword', '올바른 비밀번호를 입력해 주세요.');
            recoverForm['passwordPassword'].focusAndSelect();
            return false;
        }
        if (recoverForm['passwordPasswordCheck'].value === '') {
            recoverForm.showWarning('passwordPasswordCheck', '새로운 비밀번호를 한 번 더 입력해 주세요.');
            recoverForm['passwordPasswordCheck'].focus();
            return false;
        }
        if (recoverForm['passwordPassword'].value !== recoverForm['passwordPasswordCheck'].value) {
            recoverForm.showWarning('passwordPasswordCheck', '비밀번호가 서로 일치하지 않습니다. 다시 확인해 주세요.');
            recoverForm['passwordPasswordCheck'].focusAndSelect();
            return false;
        }
        const formData = new FormData();
        formData.append('name', recoverForm['passwordName'].value);
        formData.append('email', recoverForm['passwordEmail'].value);
        formData.append('code', recoverForm['passwordEmailCode'].value);
        formData.append('salt', recoverForm['passwordEmailSalt'].value);
        formData.append('password', recoverForm['passwordPassword'].value);
        loading.show();
        Ajax.request({
            method: Ajax.Method.Put,
            url: '/user/reset-password',
            data: formData,
            ondone: function () {
                loading.hide();
            },
            ondonebad: function () {
                recoverForm.showWarning('passwordCommon', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            },
            ondonegood: function (_, responseText) {
                const responseObject = JSON.parse(responseText);
                switch (responseObject['result']) {
                    case 'failure':
                        recoverForm.showWarning('passwordCommon', '알 수 없는 이유로 비밀번호를 재설정하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'success':
                        recoverForm['passwordPassword'].disable();
                        recoverForm['passwordPasswordCheck'].disable();
                        recoverForm['passwordSubmit'].hide();
                        recoverForm.showWarning('passwordCommon', '비밀번호를 성공적으로 재설정하였습니다.');
                        break;
                    default:
                        recoverForm.showWarning('passwordCommon', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
        });
    }
    return false;
}

recoverForm['choice'].forEach(function (choice) {
    choice.onchange = function () {
        if (this.checked) {
            recoverForm.setAttribute('data-mz-choice', this.value);
        }
        switch (recoverForm.getAttribute('data-mz-choice')) {
            case 'email':
                recoverForm['emailRetry'].click();
                break;
            case 'password':
                recoverForm['passwordRetry'].click();
                break;
        }
    }
});

recoverForm['emailContactSend'].onclick = function () {
    recoverForm.hideWarning('emailContact');
    if (recoverForm['emailContact'].value === '') {
        recoverForm.showWarning('emailContact', '연락처를 입력해 주세요.');
        recoverForm['emailContact'].focus();
        return;
    }
    if (!Regex.User.Contact.test(recoverForm['emailContact'].value)) {
        recoverForm.showWarning('emailContact', '올바른 연락처를 입력해 주세요.');
        recoverForm['emailContact'].focusAndSelect();
        return;
    }
    const formData = new FormData();
    formData.append('contact', recoverForm['emailContact'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Post,
        url: '/user/contact-code',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            recoverForm.showWarning('emailContact', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    recoverForm.showWarning('emailContact', '알 수 없는 이유로 인증번호를 전송하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                    break;
                case 'success':
                    recoverForm['emailContact'].disable();
                    recoverForm['emailContactSend'].disable();
                    recoverForm['emailContactCode'].enable();
                    recoverForm['emailContactCode'].focus();
                    recoverForm['emailContactVerify'].enable();
                    recoverForm['emailContactSalt'].value = responseObject.salt;
                    recoverForm.showWarning('emailContact', '입력하신 연락처로 인증번호를 전송하였습니다. 해당 인증번호는 3분간만 유효하니 유의해 주시기 바랍니다.');

                    recoverForm.emailContactCounter = new ContactCounter(recoverForm.querySelector('[data-mz-counter="emailContactCounter"]'));
                    recoverForm.emailContactCounter.oncomplete = function () {
                        recoverForm['emailContactCode'].disable();
                        recoverForm['emailContactVerify'].disable();
                        recoverForm['emailContactSalt'].value = '';
                        recoverForm.emailContactCounter.pause();
                        recoverForm.showWarning('emailContact', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                    }
                    recoverForm.emailContactCounter.retryElement.onclick = function (e) {
                        e.preventDefault();
                        if (recoverForm.emailContactCounter.remaining > 60) {
                            recoverForm.showWarning('emailContact', '아직 인증번호를 재전송할 수 없습니다. 잠시 후 다시 시도해 주세요.');
                            return;
                        }
                        recoverForm['emailContact'].enable();
                        recoverForm['emailContact'].focusAndSelect();
                        recoverForm['emailContactSend'].enable();
                        recoverForm['emailContactCode'].disable();
                        recoverForm['emailContactCode'].value = '';
                        recoverForm['emailContactVerify'].disable();
                        recoverForm['emailContactSalt'].value = '';
                        recoverForm.hideWarning('emailContact');
                        recoverForm.emailContactCounter.element.hide();
                        recoverForm.emailContactCounter.reset();
                    }
                    recoverForm.emailContactCounter.element.show();
                    recoverForm.emailContactCounter.start();
                    break;
                default:
                    recoverForm.showWarning('emailContact', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
}

recoverForm['emailContactVerify'].onclick = function () {
    recoverForm.hideWarning('emailContact');
    if (recoverForm['emailContactCode'].value === '') {
        recoverForm.showWarning('emailContact', '인증번호를 입력해 주세요.');
        recoverForm['emailContactCode'].focus();
        return;
    }
    if (!Regex.ContactCode.Code.test(recoverForm['emailContactCode'].value)) {
        recoverForm.showWarning('emailContact', '올바른 인증번호를 입력해 주세요.');
        recoverForm['emailContactCode'].focusAndSelect();
        return;
    }
    const formData = new FormData();
    formData.append('contact', recoverForm['emailContact'].value);
    formData.append('code', recoverForm['emailContactCode'].value);
    formData.append('salt', recoverForm['emailContactSalt'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Patch,
        url: '/user/contact-code',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function() {
            recoverForm.showWarning('emailContact', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    recoverForm['emailContactCode'].focusAndSelect();
                    recoverForm.showWarning('emailContact', '인증번호가 올바르지 않습니다.');
                    break;
                case 'failure_expired':
                    recoverForm.emailContactCounter.oncomplete();
                    recoverForm.showWarning('emailContact', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                    break;
                case 'success':
                    recoverForm['emailContactCode'].disable();
                    recoverForm['emailContactVerify'].disable();
                    recoverForm.emailContactCounter.reset();
                    recoverForm.emailContactCounter.element.hide();
                    recoverForm.showWarning('emailContact', '연락처가 인증되었습니다.');
                    break;
                default:
                    recoverForm.showWarning('emailContact', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
}

recoverForm['emailRetry'].onclick = function () {
    recoverForm.hideWarning('emailName');
    recoverForm.hideWarning('emailContact');
    recoverForm.hideWarning('emailCommon');
    recoverForm['emailName'].value = '';
    recoverForm['emailName'].focus();
    recoverForm['emailContact'].value = '';
    recoverForm['emailContact'].enable();
    recoverForm['emailContactSend'].enable();
    recoverForm['emailContactCode'].value = '';
    recoverForm['emailContactCode'].disable();
    recoverForm['emailContactVerify'].disable();
    recoverForm['emailContactSalt'].value = '';
    if (recoverForm.emailContactCounter) {
        recoverForm.emailContactCounter.element.hide();
        recoverForm.emailContactCounter.reset();
    }
    recoverForm['emailRetry'].hide();
    recoverForm['emailSubmit'].show();
}

recoverForm['passwordEmailSend'].onclick = function () {
    if (recoverForm['passwordEmail'].value === '') {
        recoverForm.showWarning('passwordEmail', '이메일을 입력해 주세요.');
        recoverForm['passwordEmail'].focus();
        return;
    }
    if (!Regex.User.Email.test(recoverForm['passwordEmail'].value)) {
        recoverForm.showWarning('passwordEmail', '올바른 이메일을 입력해 주세요.');
        recoverForm['passwordEmail'].focusAndSelect();
        return;
    }
    const formData = new FormData();
    formData.append('name', recoverForm['passwordName'].value);
    formData.append('email', recoverForm['passwordEmail'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Post,
        url: '/user/reset-password',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            recoverForm.showWarning('passwordEmail', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    recoverForm['passwordEmail'].focusAndSelect();
                    recoverForm.showWarning('passwordEmail', '해당 이메일과 일치하는 회원 정보를 찾을 수 없습니다. 입력하신 정보를 다시 한 번 더 확인해 주세요.');
                    break;
                case 'success':
                    recoverForm['passwordName'].disable();
                    recoverForm['passwordEmail'].disable();
                    recoverForm['passwordEmailSend'].disable();
                    recoverForm['passwordEmailCode'].enable();
                    recoverForm['passwordEmailCode'].focus();
                    recoverForm['passwordEmailVerify'].enable();
                    recoverForm['passwordEmailSalt'].value = responseObject.salt;
                    recoverForm.showWarning('passwordEmail', '입력하신 이메일로 인증번호를 전송하였습니다. 해당 인증번호는 10분간만 유효하니 유의해 주시기 바랍니다.');

                    recoverForm.passwordEmailCounter = new ContactCounter(recoverForm.querySelector('[data-mz-counter="passwordEmailCounter"]'), {
                        remaining: 600
                    });
                    recoverForm.passwordEmailCounter.oncomplete = function () {
                        recoverForm['passwordEmailCode'].disable();
                        recoverForm['passwordEmailVerify'].disable();
                        recoverForm['passwordEmailSalt'].value = '';
                        recoverForm.passwordEmailCounter.pause();
                        recoverForm.showWarning('passwordEmail', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                    }
                    recoverForm.passwordEmailCounter.retryElement.onclick = function (e) {
                        e.preventDefault();
                        if (recoverForm.passwordEmailCounter.remaining > 60) {
                            recoverForm.showWarning('passwordEmail', '아직 인증번호를 재전송할 수 없습니다. 잠시 후 다시 시도해 주세요.');
                            return;
                        }
                        recoverForm['passwordEmail'].enable();
                        recoverForm['passwordEmail'].focusAndSelect();
                        recoverForm['passwordEmailSend'].enable();
                        recoverForm['passwordEmailCode'].disable();
                        recoverForm['passwordEmailCode'].value = '';
                        recoverForm['passwordEmailVerify'].disable();
                        recoverForm['passwordEmailSalt'].value = '';
                        recoverForm.hideWarning('passwordEmail');
                        recoverForm.passwordEmailCounter.element.hide();
                        recoverForm.passwordEmailCounter.reset();
                    }
                    recoverForm.passwordEmailCounter.element.show();
                    recoverForm.passwordEmailCounter.start();
                    break;
                default:
                    recoverForm.showWarning('passwordEmail', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
}

recoverForm['passwordEmailVerify'].onclick = function () {
    if (recoverForm['passwordEmailCode'].value === '') {
        recoverForm.showWarning('passwordEmail', '인증번호를 입력해 주세요.');
        recoverForm['passwordEmailCode'].focus();
        return;
    }
    if (!Regex.EmailCode.Code.test(recoverForm['passwordEmailCode'].value)) {
        recoverForm.showWarning('passwordEmail', '올바른 인증번호를 입력해 주세요.');
        recoverForm['passwordEmailCode'].focusAndSelect();
        return;
    }
    const formData = new FormData();
    formData.append('name', recoverForm['passwordName'].value);
    formData.append('email', recoverForm['passwordEmail'].value);
    formData.append('code', recoverForm['passwordEmailCode'].value);
    formData.append('salt', recoverForm['passwordEmailSalt'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Patch,
        url: '/user/reset-password',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            recoverForm.showWarning('passwordEmail', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    recoverForm['passwordEmailCode'].focusAndSelect();
                    recoverForm.showWarning('passwordEmail', '인증번호가 올바르지 않습니다.');
                    break;
                case 'failure_expired':
                    recoverForm.showWarning('passwordEmail', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                    break;
                case 'success':
                    recoverForm['passwordEmailCode'].disable();
                    recoverForm['passwordEmailVerify'].disable();
                    recoverForm['passwordPassword'].enable();
                    recoverForm['passwordPassword'].focus();
                    recoverForm['passwordPasswordCheck'].enable();
                    recoverForm['passwordRetry'].show();
                    recoverForm['passwordSubmit'].show();
                    recoverForm.passwordEmailCounter.reset();
                    recoverForm.passwordEmailCounter.element.hide();
                    recoverForm.showWarning('passwordEmail', '연락처가 인증되었습니다.');
                    break;
                default:
                    recoverForm.showWarning('passwordEmail', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
}

recoverForm['passwordRetry'].onclick = function () {
    recoverForm.hideWarning('passwordName');
    recoverForm.hideWarning('passwordEmail');
    recoverForm.hideWarning('passwordPassword');
    recoverForm.hideWarning('passwordPasswordCheck');
    recoverForm.hideWarning('passwordCommon');
    recoverForm['passwordName'].value = '';
    recoverForm['passwordName'].enable();
    recoverForm['passwordName'].focus();
    recoverForm['passwordEmail'].value = '';
    recoverForm['passwordEmail'].enable();
    recoverForm['passwordEmailSend'].enable();
    recoverForm['passwordEmailCode'].value = '';
    recoverForm['passwordEmailCode'].disable();
    recoverForm['passwordEmailVerify'].disable();
    recoverForm['passwordEmailSalt'].value = '';
    recoverForm['passwordPassword'].value = '';
    recoverForm['passwordPasswordCheck'].value = '';
    if (recoverForm.passwordEmailCounter) {
        recoverForm.passwordEmailCounter.element.hide();
        recoverForm.passwordEmailCounter.reset();
    }
    recoverForm['passwordRetry'].hide();
    recoverForm['passwordSubmit'].show();
}

recoverForm.registerClosers();