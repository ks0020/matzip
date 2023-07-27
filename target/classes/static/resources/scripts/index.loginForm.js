const loginForm = document.getElementById('loginForm');

loginForm.hide = function () {
    cover.hide();
    loginForm.removeAttribute('visible');
    return this;
}

loginForm.show = function () {
    cover.show(function () {
        loginForm.hide();
    });
    loginForm['email'].value = '';
    loginForm['password'].value = '';
    loginForm['email'].focus();
    loginForm.setAttribute('visible', '');
    return this;
}

loginForm.onsubmit = function (e) {
    e.preventDefault();
    loginForm.hideAllWarnings();
    if (loginForm['email'].value === '') {
        loginForm.showWarning('email', '이메일을 입력해 주세요.');
        loginForm['email'].focus();
        return false;
    }
    if (!Regex.User.Email.test(loginForm['email'].value)) {
        loginForm.showWarning('email', '올바른 이메일을 입력해 주세요.');
        loginForm['email'].focusAndSelect();
        return false;
    }
    if (loginForm['password'].value === '') {
        loginForm.showWarning('password', '비밀번호를 입력해 주세요.');
        loginForm['password'].focus();
        return false;
    }
    if (!Regex.User.Password.test(loginForm['password'].value)) {
        loginForm.showWarning('password', '올바른 비밀번호를 입력해 주세요.');
        loginForm['password'].focusAndSelect();
        return false;
    }
    const formData = new FormData();
    formData.append('email', loginForm['email'].value);
    formData.append('password', loginForm['password'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Post,
        url: '/user/login',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            loginForm.showWarning('common', '서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    loginForm.showWarning('common', '이메일 혹은 비밀번호가 올바르지 않습니다.');
                    loginForm['email'].focusAndSelect();
                    break;
                case 'failure_not_verified':
                    loginForm.showWarning('common', '이메일 인증이 완료되지 않았습니다.');
                    break;
                case 'failure_suspended':
                    loginForm.showWarning('common', '해당 계정은 현재 사용이 중지된 계정입니다. 관리자에게 문의해 주세요.');
                    break;
                case 'success':
                    location.reload();
                    break;
                default:
                    loginForm.showWarning('common', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
    return false;
}

loginForm['recover'].onclick = function (e) {
    e.preventDefault();
    loginForm.removeAttribute('visible');
    recoverForm.show();
}

loginForm['register'].onclick = function (e) {
    e.preventDefault();
    loginForm.removeAttribute('visible');
    registerForm.show();
}

loginForm.registerClosers();