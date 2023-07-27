const registerForm = document.getElementById('registerForm');

registerForm.show = function () {
    cover.show(function () {
        registerForm.hide();
    });
    registerForm.hideAllWarnings();

    registerForm['termPolicy'].scrollTop = 0;
    registerForm['termPolicyAgree'].checked = false;
    registerForm['termPrivacy'].scrollTop = 0;
    registerForm['termPrivacyAgree'].checked = false;

    registerForm['infoEmail'].value = '';
    registerForm['infoPassword'].value = '';
    registerForm['infoPasswordCheck'].value = '';
    registerForm['infoNickname'].value = '';
    registerForm['infoName'].value = '';
    registerForm['infoContact'].value = '';
    registerForm['infoContact'].enable();
    registerForm['infoContactSend'].enable();
    registerForm['infoContactCode'].value = '';
    registerForm['infoContactCode'].disable();
    registerForm['infoContactVerify'].disable();
    registerForm['infoContactSalt'].value = '';
    registerForm['infoAddressPostal'].value = '';
    registerForm['infoAddressPrimary'].value = '';
    registerForm['infoAddressSecondary'].value = '';

    registerForm.scrollTop = 0;
    registerForm.setAttribute('data-mz-step', 'term');
    registerForm.setAttribute('visible', '');
    return this;
}

registerForm.hide = function () {
    if (registerForm.getAttribute('data-mz-step') === 'address') {
        registerForm.setAttribute('data-mz-step', 'info');
        return this;
    }
    cover.hide();
    registerForm.removeAttribute('visible');
    return this;
}

registerForm.onsubmit = function (e) {
    e.preventDefault();
    const step = registerForm.getAttribute('data-mz-step');
    if (step === 'term') {
        registerForm.hideWarning('termPolicy');
        registerForm.hideWarning('termPrivacy');
        if (!registerForm['termPolicyAgree'].checked) {
            registerForm.showWarning('termPolicy', '서비스 이용 약관을 읽고 동의해 주세요.');
            return false;
        }
        if (!registerForm['termPrivacyAgree'].checked) {
            registerForm.showWarning('termPrivacy', '개인 정보 처리 방침을 읽고 동의해 주세요.');
            return false;
        }
        registerForm.scrollTop = 0;
        registerForm.setAttribute('data-mz-step', 'info');
        registerForm['infoEmail'].focusAndSelect();
    } else if (step === 'info') {
        registerForm.hideWarning('infoPassword');
        registerForm.hideWarning('infoPasswordCheck');
        registerForm.hideWarning('infoName');
        registerForm.hideWarning('infoContact');
        registerForm.hideWarning('infoAddress');
        if (registerForm['infoEmail'].value === '') {
            registerForm.showWarning('infoEmail', '이메일을 입력해 주세요.');
            registerForm['infoEmail'].focus();
            return false;
        }
        if (!Regex.User.Email.test(registerForm['infoEmail'].value)) {
            registerForm.showWarning('infoEmail', '올바른 이메일을 입력해 주세요.');
            registerForm['infoEmail'].focusAndSelect();
            return false;
        }
        if (registerForm['infoPassword'].value === '') {
            registerForm.showWarning('infoPassword', '비밀번호를 입력해 주세요.');
            registerForm['infoPassword'].focus();
            return false;
        }
        if (!Regex.User.Password.test(registerForm['infoPassword'].value)) {
            registerForm.showWarning('infoPassword', '올바른 비밀번호를 입력해 주세요.');
            registerForm['infoPassword'].focusAndSelect();
            return false;
        }
        if (registerForm['infoPasswordCheck'].value === '') {
            registerForm.showWarning('infoPasswordCheck', '비밀번호를 한 번 더 입력해 주세요.');
            registerForm['infoPasswordCheck'].focus();
            return false;
        }
        if (registerForm['infoPassword'].value !== registerForm['infoPasswordCheck'].value) {
            registerForm.showWarning('infoPasswordCheck', '비밀번호가 서로 일치하지 않습니다. 다시 확인해 주세요.');
            registerForm['infoPasswordCheck'].focusAndSelect();
            return false;
        }
        if (registerForm['infoNickname'].value === '') {
            registerForm.showWarning('infoNickname', '닉네임을 입력해 주세요.');
            registerForm['infoNickname'].focus();
            return false;
        }
        if (!Regex.User.Nickname.test(registerForm['infoNickname'].value)) {
            registerForm.showWarning('infoNickname', '올바른 닉네임을 입력해 주세요.');
            registerForm['infoNickname'].focusAndSelect();
            return false;
        }
        if (registerForm['infoName'].value === '') {
            registerForm.showWarning('infoName', '이름(실명)을 입력해 주세요.');
            registerForm['infoName'].focus();
            return false;
        }
        if (!Regex.User.Name.test(registerForm['infoName'].value)) {
            registerForm.showWarning('infoName', '올바른 이름(실명)을 입력해 주세요.');
            registerForm['infoName'].focusAndSelect();
            return false;
        }
        if (registerForm['infoContactSalt'].value === '' ||
            registerForm['infoContact'].isEnabled() ||
            registerForm['infoContactSend'].isEnabled() ||
            registerForm['infoContactCode'].isEnabled() ||
            registerForm['infoContactVerify'].isEnabled()) {
            registerForm.showWarning('infoContact', '연락처 인증을 완료해 주세요.');
            return false;
        }
        if (registerForm['infoAddressPostal'].value === '' || registerForm['infoAddressPrimary'].value === '') {
            registerForm.showWarning('infoAddress', '[우편번호 찾기] 버튼을 클릭하여 주소를 입력해 주세요.');
            return false;
        }
        if (!Regex.User.AddressSecondary.test(registerForm['infoAddressSecondary'].value)) {
            registerForm.showWarning('infoAddress', '올바른 상세 주소를 입력해 주세요.');
            registerForm['infoAddressSecondary'].focusAndSelect();
            return false;
        }
        const formData = new FormData();
        formData.append('email', registerForm['infoEmail'].value);
        formData.append('password', registerForm['infoPassword'].value);
        formData.append('nickname', registerForm['infoNickname'].value);
        formData.append('name', registerForm['infoName'].value);
        formData.append('contact', registerForm['infoContact'].value);
        formData.append('code', registerForm['infoContactCode'].value);
        formData.append('salt', registerForm['infoContactSalt'].value);
        formData.append('addressPostal', registerForm['infoAddressPostal'].value);
        formData.append('addressPrimary', registerForm['infoAddressPrimary'].value);
        formData.append('addressSecondary', registerForm['infoAddressSecondary'].value);
        loading.show();
        Ajax.request({
            method: Ajax.Method.Post,
            url: '/user/register',
            data: formData,
            ondone: function () {
                loading.hide();
            },
            ondonebad: function () {
                registerForm.showWarning('infoCommon', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            },
            ondonegood: function (_, responseText) {
                const responseObject = JSON.parse(responseText);
                switch (responseObject['result']) {
                    case 'failure':
                        registerForm.showWarning('infoCommon', '알 수 없는 이유로 회원가입에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'failure_duplicate_email':
                        registerForm.showWarning('infoEmail', '해당 이메일은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.');
                        registerForm['infoEmail'].focusAndSelect();
                        break;
                    case 'failure_duplicate_nickname':
                        registerForm.showWarning('infoNickname', '해당 닉네임은 이미 사용 중입니다. 다른 닉네임을 사용해 주세요.');
                        registerForm['infoNickname'].focusAndSelect();
                        break;
                    case 'failure_duplicate_contact':
                        registerForm.showWarning('infoContact', '해당 연락처는 이미 사용 중입니다. 다른 연락처를 사용해 주세요.');
                        break;
                    case 'success':
                        registerForm
                            .querySelector('[data-mz-email-link]')
                            .setAttribute('href', `https://${registerForm['infoEmail'].value.split('@')[1]}`);
                        registerForm.setAttribute('data-mz-step', 'done');
                        break;
                    default:
                        registerForm.showWarning('infoCommon', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
        });
    } else if (step === 'done') {
        registerForm.hide();
    }
    return false;
}

registerForm['infoEmail'].onblur = function () {
    registerForm.hideWarning('infoEmail');
    if (registerForm['infoEmail'].value === '') {
        registerForm.showWarning('infoEmail', '이메일을 입력해 주세요.');
        return;
    }
    if (!Regex.User.Email.test(registerForm['infoEmail'].value)) {
        registerForm.showWarning('infoEmail', '올바른 이메일을 입력해 주세요.');
        return;
    }
    Ajax.request({
        method: Ajax.Method.Get,
        url: `/user/email-count?email=${registerForm['infoEmail'].value}`,
        ondonebad: function () {
            registerForm.showWarning('infoEmail', '이메일이 사용 가능한지 여부를 확인하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            const count = responseObject.count;
            if (count === 0) {
                registerForm.showWarning('infoEmail', '해당 이메일은 사용 가능한 이메일입니다.');
            } else {
                registerForm.showWarning('infoEmail', '해당 이메일은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.');
            }
        }
    });
}

registerForm['infoNickname'].onblur = function () {
    registerForm.hideWarning('infoNickname');
    if (registerForm['infoNickname'].value === '') {
        registerForm.showWarning('infoNickname', '닉네임을 입력해 주세요.');
        return;
    }
    if (!Regex.User.Nickname.test(registerForm['infoNickname'].value)) {
        registerForm.showWarning('infoNickname', '올바른 닉네임을 입력해 주세요.');
        return;
    }
    Ajax.request({
        method: Ajax.Method.Get,
        url: `/user/nickname-count?nickname=${registerForm['infoNickname'].value}`,
        ondonebad: function () {
            registerForm.showWarning('infoNickname', '닉네임이 사용 가능한지 여부를 확인하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            const count = responseObject.count;
            if (count === 0) {
                registerForm.showWarning('infoNickname', '해당 닉네임은 사용 가능한 닉네임입니다.');
            } else {
                registerForm.showWarning('infoNickname', '해당 닉네임은 이미 사용 중입니다. 다른 닉네임을 사용해 주세요.');
            }
        }
    });
}

registerForm['infoContactSend'].onclick = function () {
    registerForm.hideWarning('infoContact');
    if (registerForm['infoContact'].value === '') {
        registerForm.showWarning('infoContact', '연락처를 입력해 주세요.');
        registerForm.focus();
        return;
    }
    if (!Regex.User.Contact.test(registerForm['infoContact'].value)) {
        registerForm.showWarning('infoContact', '올바른 연락처를 입력해 주세요.');
        registerForm.focusAndSelect();
        return;
    }
    const formData = new FormData();
    formData.append('contact', registerForm['infoContact'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Post,
        url: '/user/contact-code',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            registerForm.showWarning('infoContact', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    registerForm.showWarning('infoContact', '알 수 없는 이유로 인증번호를 전송하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                    break;
                case 'success':
                    registerForm['infoContact'].disable();
                    registerForm['infoContactSend'].disable();
                    registerForm['infoContactCode'].enable();
                    registerForm['infoContactVerify'].enable();
                    registerForm['infoContactSalt'].value = responseObject['salt'];
                    registerForm['infoContactCode'].focus();
                    registerForm.showWarning('infoContact', '입력하신 연락처로 인증번호를 전송하였습니다. 해당 인증번호는 3분간만 유효하니 유의해 주시기 바랍니다.');

                    registerForm.infoContactCounter = new ContactCounter(registerForm.querySelector('[data-mz-counter]'));
                    registerForm.infoContactCounter.oncomplete = function () {
                        registerForm['infoContactCode'].disable();
                        registerForm['infoContactVerify'].disable();
                        registerForm['infoContactSalt'].value = '';
                        registerForm.infoContactCounter.pause();
                        registerForm.showWarning('infoContact', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                    }
                    registerForm.infoContactCounter.retryElement.onclick = function (e) {
                        e.preventDefault();
                        if (registerForm.infoContactCounter.remaining > 60) {
                            registerForm.showWarning('infoContact', '아직 인증번호를 재전송할 수 없습니다. 잠시 후 다시 시도해 주세요.');
                            return;
                        }
                        registerForm['infoContact'].enable();
                        registerForm['infoContact'].focusAndSelect();
                        registerForm['infoContactSend'].enable();
                        registerForm['infoContactCode'].disable();
                        registerForm['infoContactCode'].value = '';
                        registerForm['infoContactVerify'].disable();
                        registerForm['infoContactSalt'].value = '';
                        registerForm.hideWarning('infoContact');
                        registerForm.infoContactCounter.element.hide();
                        registerForm.infoContactCounter.reset();
                    }
                    registerForm.infoContactCounter.element.show();
                    registerForm.infoContactCounter.start();
                    break;
                default:
                    registerForm.showWarning('infoContact', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
}

registerForm['infoContactVerify'].onclick = function () {
    registerForm.hideWarning('infoContact');
    if (registerForm['infoContactCode'].value === '') {
        registerForm.showWarning('infoContact', '인증번호를 입력해 주세요.');
        registerForm['infoContactCode'].focus();
        return;
    }
    if (!Regex.ContactCode.Code.test(registerForm['infoContactCode'].value)) {
        registerForm.showWarning('infoContact', '올바른 인증번호를 입력해 주세요.');
        registerForm['infoContactCode'].focusAndSelect();
        return;
    }
    const formData = new FormData();
    formData.append('contact', registerForm['infoContact'].value);
    formData.append('code', registerForm['infoContactCode'].value);
    formData.append('salt', registerForm['infoContactSalt'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Patch,
        url: '/user/contact-code',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            registerForm.showWarning('infoContact', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    registerForm['infoContactCode'].focusAndSelect();
                    registerForm.showWarning('infoContact', '인증번호가 올바르지 않습니다.');
                    break;
                case 'failure_expired':
                    registerForm.infoContactCounter.oncomplete();
                    registerForm.showWarning('infoContact', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                    break;
                case 'success':
                    registerForm['infoContactCode'].disable();
                    registerForm['infoContactVerify'].disable();
                    registerForm.infoContactCounter.reset();
                    registerForm.infoContactCounter.element.hide();
                    registerForm.showWarning('infoContact', '연락처가 인증되었습니다.');
                    break;
                default:
                    registerForm.showWarning('infoContact', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
}

registerForm['infoAddressFind'].onclick = function () {
    const addressStepEl = registerForm.querySelector('[data-mz-step="address"]');
    new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: function (data) {
            registerForm.setAttribute('data-mz-step', 'info');
            registerForm['infoAddressPostal'].value = data['zonecode'];
            registerForm['infoAddressPrimary'].value = data['address'];
            registerForm['infoAddressSecondary'].focusAndSelect();
        }
    }).embed(addressStepEl);
    registerForm.setAttribute('data-mz-step', 'address');
}

registerForm['infoPrev'].onclick = function () {
    registerForm.setAttribute('data-mz-step', 'term');
    registerForm.scrollTop = 0;
}

registerForm['doneLogin'].onclick = function () {
    registerForm.hide();
    loginForm.show();
}

registerForm.registerClosers();