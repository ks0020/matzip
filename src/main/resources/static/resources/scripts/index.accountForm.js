const accountForm = document.getElementById('accountForm');

if (accountForm) {
    accountForm.show = function () {
        cover.show(function () {
            accountForm.hide();
        });
        accountForm.hideAllWarnings();

        accountForm['infoCurrentPassword'].focus();
        accountForm.scrollTop = 0;
        accountForm.setAttribute('data-mz-step', 'info');
        accountForm.setAttribute('visible', '');
        return this;
    }

    accountForm.hide = function () {
        if (accountForm.getAttribute('data-mz-step') === 'address') {
            accountForm.setAttribute('data-mz-step', 'info');
            return this;
        }
        Dialog.create({
            title: '개인 정보 수정 취소',
            body: '정말로 개인 정보 수정을 취소할까요?\n저장되지 않은 모든 내용은 유실됩니다.',
            buttons: [
                Dialog.createButton('네', function () {
                    location.reload();
                }),
                Dialog.createButton('아니오', function (_, dialog) {
                    dialog.hide();
                })
            ]
        }).show();
        return this;
    }

    accountForm.onsubmit = function (e) {
        e.preventDefault();
        accountForm.hideAllWarnings();
        if (accountForm['infoCurrentPassword'].value === '') {
            accountForm.showWarning('infoCurrentPassword', '현재 비밀번호를 입력해 주세요.');
            accountForm['infoCurrentPassword'].focus();
            return false;
        }
        if (!Regex.User.Password.test(accountForm['infoCurrentPassword'].value)) {
            accountForm.showWarning('infoCurrentPassword', '올바른 현재 비밀번호를 입력해 주세요.');
            accountForm['infoCurrentPassword'].focusAndSelect();
            return false;
        }
        if (accountForm['infoChangePassword'].checked) {
            if (accountForm['infoPassword'].value === '') {
                accountForm.showWarning('infoPassword', '새로운 비밀번호를 입력해 주세요.');
                accountForm['infoPassword'].focus();
                return false;
            }
            if (!Regex.User.Password.test(accountForm['infoPassword'].value)) {
                accountForm.showWarning('infoPassword', '올바른 새로운 비밀번호를 입력해 주세요.');
                accountForm['infoPassword'].focusAndSelect();
                return false;
            }
            if (accountForm['infoPasswordCheck'].value === '') {
                accountForm.showWarning('infoPasswordCheck', '새로운 비밀번호를 한 번 더 입력해 주세요.');
                accountForm['infoPasswordCheck'].focus();
                return false;
            }
            if (accountForm['infoPassword'].value !== accountForm['infoPasswordCheck'].value) {
                accountForm.showWarning('infoPasswordCheck', '새로운 비밀번호가 서로 일치하지 않습니다. 다시 확인해 주세요.');
                accountForm['infoPasswordCheck'].focusAndSelect();
                return false;
            }
        }
        if (accountForm['infoName'].value === '') {
            accountForm.showWarning(accountForm.warnings.InfoName, '이름(실명)을 입력해 주세요.');
            accountForm['infoName'].focus();
            return false;
        }
        if (!Regex.User.Name.test(accountForm['infoName'].value)) {
            accountForm.showWarning(accountForm.warnings.InfoName, '올바른 이름(실명)을 입력해 주세요.');
            accountForm['infoName'].focusAndSelect();
            return false;
        }
        if (accountForm['infoChangeContact'].checked) {
            if (accountForm['infoContactSalt'].value === '' ||
                accountForm['infoContact'].isEnabled() ||
                accountForm['infoContactSend'].isEnabled() ||
                accountForm['infoContactCode'].isEnabled() ||
                accountForm['infoContactVerify'].isEnabled()) {
                accountForm.showWarning('infoContact', '연락처 인증을 완료해 주세요.');
                return false;
            }
        }
        if (accountForm['infoAddressPostal'].value === '' || accountForm['infoAddressPrimary'].value === '') {
            accountForm.showWarning(accountForm.warnings.InfoAddress, '[우편번호 찾기] 버튼을 클릭하여 주소를 입력해 주세요.');
            return false;
        }
        if (!Regex.User.AddressSecondary.test(accountForm['infoAddressSecondary'].value)) {
            accountForm.showWarning(accountForm.warnings.InfoAddress, '올바른 상세 주소를 입력해 주세요.');
            accountForm['infoAddressSecondary'].focusAndSelect();
            return false;
        }
        const formData = new FormData();
        formData.append('currentPassword', accountForm['infoCurrentPassword'].value);
        formData.append('name', accountForm['infoName'].value);
        formData.append('addressPostal', accountForm['infoAddressPostal'].value);
        formData.append('addressPrimary', accountForm['infoAddressPrimary'].value);
        formData.append('addressSecondary', accountForm['infoAddressSecondary'].value);
        if (accountForm['infoChangePassword'].checked) {
            formData.append('password', accountForm['infoPassword'].value);
        }
        if (accountForm['infoChangeContact'].checked) {
            formData.append('contact', accountForm['infoContact'].value);
            formData.append('code', accountForm['infoContactCode'].value);
            formData.append('salt', accountForm['infoContactSalt'].value);
        }
        loading.show();
        Ajax.request({
            method: Ajax.Method.Patch,
            url: '/user/account',
            data: formData,
            ondone: function () {
                loading.hide();
            },
            ondonebad: function () {
                accountForm.showWarning('infoCommon', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            },
            ondonegood: function (_, responseText) {
                const responseObject = JSON.parse(responseText);
                switch (responseObject['result']) {
                    case 'failure':
                        accountForm.showWarning('infoCommon', '알 수 없는 이유로 개인 정보 수정에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'failure_duplicate_contact':
                        accountForm.showWarning('infoContact', '해당 연락처는 이미 사용 중입니다. 다른 연락처를 사용해 주세요.');
                        break;
                    case 'failure_invalid_password':
                        accountForm.showWarning('infoCurrentPassword', '비밀번호가 올바르지 않습니다. 다시 한 번 확인해 주세요.');
                        accountForm['infoCurrentPassword'].focusAndSelect();
                        break;
                    case 'success':
                        accountForm.removeAttribute('visible');
                        Dialog.create({
                            title: '개인 정보 수정',
                            body: '개인 정보가 성공적으로 수정되었습니다.\n개인 정보 보호를 위해 로그아웃 되었으니 다시 로그인해 주세요.',
                            buttons: [
                                Dialog.createButton('확인', function () {
                                    location.reload();
                                })
                            ]
                        }).show();
                        break;
                    default:
                        accountForm.showWarning('infoCommon', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
        });
        return false;
    }

    accountForm['infoContactSend'].onclick = function () {
        accountForm.hideWarning('infoContact');
        if (accountForm['infoContact'].value === '') {
            accountForm.showWarning('infoContact', '연락처를 입력해 주세요.');
            accountForm['infoContact'].focus();
            return;
        }
        if (!Regex.User.Contact.test(accountForm['infoContact'].value)) {
            accountForm.showWarning('infoContact', '올바른 연락처를 입력해 주세요.');
            accountForm['infoContact'].focusAndSelect();
            return;
        }
        if (accountForm['infoCurrentContact'].value === accountForm['infoContact'].value) {
            accountForm.showWarning('infoContact', '새로운 연락처가 기존 연락처와 같습니다.');
            accountForm['infoContact'].focusAndSelect();
            return;
        }
        const formData = new FormData();
        formData.append('contact', accountForm['infoContact'].value);
        loading.show();
        Ajax.request({
            method: Ajax.Method.Post,
            url: '/user/contact-code',
            data: formData,
            ondone: function () {
                loading.hide();
            },
            ondonebad: function () {
                accountForm.showWarning('infoContact', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            },
            ondonegood: function (_, responseText) {
                const responseObject = JSON.parse(responseText);
                switch (responseObject['result']) {
                    case 'failure':
                        accountForm.showWarning('infoContact', '알 수 없는 이유로 인증번호를 전송하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                        break;
                    case 'success':
                        accountForm['infoContact'].disable();
                        accountForm['infoContactSend'].disable();
                        accountForm['infoContactCode'].enable();
                        accountForm['infoContactVerify'].enable();
                        accountForm['infoContactSalt'].value = responseObject.salt;
                        accountForm['infoContactCode'].focus();
                        accountForm.showWarning('infoContact', '입력하신 연락처로 인증번호를 전송하였습니다. 해당 인증번호는 3분간만 유효하니 유의해 주시기 바랍니다.');

                        accountForm.infoContactCounter = new ContactCounter(accountForm.querySelector('[data-mz-counter]'));
                        accountForm.infoContactCounter.oncomplete = function () {
                            accountForm['infoContactCode'].disable();
                            accountForm['infoContactVerify'].disable();
                            accountForm['infoContactSalt'].value = '';
                            accountForm.infoContactCounter.pause();
                            accountForm.showWarning('infoContact', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                        }
                        accountForm.infoContactCounter.retryElement.onclick = function (e) {
                            e.preventDefault();
                            if (accountForm.infoContactCounter.remaining > 60) {
                                accountForm.showWarning('infoContact', '아직 인증번호를 재전송할 수 없습니다. 잠시 후 다시 시도해 주세요.');
                                return;
                            }
                            accountForm['infoContact'].enable();
                            accountForm['infoContact'].focusAndSelect();
                            accountForm['infoContactSend'].enable();
                            accountForm['infoContactCode'].disable();
                            accountForm['infoContactCode'].value = '';
                            accountForm['infoContactVerify'].disable();
                            accountForm['infoContactSalt'].value = '';
                            accountForm.hideWarning('infoContact');
                            accountForm.infoContactCounter.element.hide();
                            accountForm.infoContactCounter.reset();
                        }
                        accountForm.infoContactCounter.element.show();
                        accountForm.infoContactCounter.start();
                        break;
                    default:
                        accountForm.showWarning('infoContact', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
        });
    }

    accountForm['infoContactVerify'].onclick = function () {
        accountForm.hideWarning('infoContact');
        if (accountForm['infoContactCode'].value === '') {
            accountForm.showWarning('infoContact', '인증번호를 입력해 주세요.');
            accountForm['infoContactCode'].focus();
            return;
        }
        if (!Regex.ContactCode.Code.test(accountForm['infoContactCode'].value)) {
            accountForm.showWarning('infoContact', '올바른 인증번호를 입력해 주세요.');
            accountForm['infoContactCode'].focusAndSelect();
            return;
        }
        const formData = new FormData();
        formData.append('contact', accountForm['infoContact'].value);
        formData.append('code', accountForm['infoContactCode'].value);
        formData.append('salt', accountForm['infoContactSalt'].value);
        loading.show();
        Ajax.request({
            method: Ajax.Method.Patch,
            url: '/user/contact-code',
            data: formData,
            ondone: function () {
                loading.hide();
            },
            ondonebad: function () {
                accountForm.showWarning('infoContact', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
            },
            ondonegood: function (_, responseText) {
                const responseObject = JSON.parse(responseText);
                switch (responseObject['result']) {
                    case 'failure':
                        accountForm['infoContactCode'].focusAndSelect();
                        accountForm.showWarning('infoContact', '인증번호가 올바르지 않습니다.');
                        break;
                    case 'failure_expired':
                        accountForm.infoContactCounter.oncomplete();
                        accountForm.showWarning('infoContact', '발송된 인증번호가 만료되었습니다. 다시 시도해 주세요.');
                        break;
                    case 'success':
                        accountForm['infoContactCode'].disable();
                        accountForm['infoContactVerify'].disable();
                        accountForm.infoContactCounter.reset();
                        accountForm.infoContactCounter.element.hide();
                        accountForm.showWarning('infoContact', '연락처가 인증되었습니다.');
                        break;
                    default:
                        accountForm.showWarning('infoContact', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                }
            }
        });
    }

    accountForm['infoAddressFind'].onclick = function () {
        new daum.Postcode({
            width: '100%',
            height: '100%',
            oncomplete: function (data) {
                accountForm.setAttribute('data-mz-step', 'info');
                accountForm['infoAddressPostal'].value = data['zonecode'];
                accountForm['infoAddressPrimary'].value = data['address'];
                accountForm['infoAddressSecondary'].focusAndSelect();
            }
        }).embed(accountForm.querySelector('[data-mz-step="address"]'));
        accountForm.setAttribute('data-mz-step', 'address');
    }

    accountForm['terminate'].onclick = function() {
        accountForm.hideAllWarnings();
        if (accountForm['infoCurrentPassword'].value === '') {
            accountForm.showWarning('infoCurrentPassword', '현재 비밀번호를 입력해 주세요.');
            accountForm['infoCurrentPassword'].focus();
            return false;
        }
        if (!Regex.User.Password.test(accountForm['infoCurrentPassword'].value)) {
            accountForm.showWarning('infoCurrentPassword', '올바른 현재 비밀번호를 입력해 주세요.');
            accountForm['infoCurrentPassword'].focusAndSelect();
            return false;
        }
        Dialog.create({
            title: '회원 탈퇴',
            body: '정말로 탈퇴할까요?\n삭제된 정보는 복구할 수 없으며 작성하셨던 맛집, 리뷰 정보는 일정 기간 후 모두 삭제됩니다.',
            type: Dialog.Type.Warning,
            buttons: [
                Dialog.createButton('탈퇴', function(_, dialog) {
                    const formData = new FormData();
                    formData.append('currentPassword', accountForm['infoCurrentPassword'].value);
                    dialog.hide();
                    loading.show();
                    Ajax.request({
                        method: Ajax.Method.Delete,
                        url: '/user/account',
                        data: formData,
                        ondone: function () {
                            loading.hide();
                        },
                        ondonebad: function() {
                            accountForm.showWarning('infoCommon', '서버와 통신하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                        },
                        ondonegood: function(_, responseText) {
                            const responseObject = JSON.parse(responseText);
                            switch (responseObject['result']) {
                                case 'failure':
                                    accountForm.showWarning('infoCommon', '알 수 없는 이유로 회원 탈퇴에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
                                    break;
                                case 'failure_invalid_password':
                                    accountForm.showWarning('infoCurrentPassword', '비밀번호가 올바르지 않습니다. 다시 한 번 확인해 주세요.');
                                    accountForm['infoCurrentPassword'].focusAndSelect();
                                    break;
                                case'success':
                                    Dialog.create({
                                        title: '회원 탈퇴',
                                        body: '회원 탈퇴가 성공적으로 완료되었습니다.\n알았으면 빨리 꺼져.',
                                        buttons: [
                                            Dialog.createButton('확인', function() {
                                                location.reload();
                                            })
                                        ]
                                    }).show();
                                    break;
                                default:
                                    accountForm.showWarning('infoCommon', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
                            }
                        }
                    })
                }),
                Dialog.createButton('취소', function(_, dialog) {
                    dialog.hide();
                })
            ]
        }).show();
    }

    accountForm.registerClosers();
}