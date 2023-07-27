const save = document.getElementById('save');

save.show = function () {
    const saveListEl = save.querySelector('[data-mz-save-list]');
    if (!User.isSigned()) {
        saveListEl.setAttribute('data-mz-issue', 'notSigned');
        saveListEl.querySelector('[data-mz-issue="notSigned"] [data-mz-login]').onclick = loginForm.show;
    } else {
        Ajax.request({
            method: Ajax.Method.Get,
            url: '/place/saves',
            ondone: function () {
                const saveListEl = save.querySelector(':scope > [data-mz-save-list]');
                saveListEl.querySelectorAll(':scope > [data-mz-item]').forEach(function (itemEl) {
                    itemEl.remove();
                });
            },
            ondonebad: function () {
                saveListEl.setAttribute('data-mz-issue', 'error');
                saveListEl.querySelector('[data-mz-issue="error"] [data-mz-refresh]').onclick = save.show;
            },
            ondonegood: function (_, responseText) {
                const responseObject = JSON.parse(responseText);
                const savesArray = responseObject['saves'];
                if (savesArray.length === 0) {
                    saveListEl.setAttribute('data-mz-issue', 'empty');
                    return;
                }
                saveListEl.removeAttribute('data-mz-issue');
                for (const saveObject of savesArray) {
                    const saveEl = new DOMParser().parseFromString(`
                        <li class="__item" data-mz-item data-mz-index="${saveObject['index']}">
                            <div class="__spec-container">
                                <span class="__name" data-mz-field="name">${saveObject['name']}</span>
                                <span class="__operation-wrapper">
                                    <span class="__operating">영업 전</span>
                                    <span class="__extra">11:00에 영업 시작</span>
                                </span>
                                <span class="__address">${saveObject['addressPrimary']}</span>
                            </div>
                            <div class="__image-container">
                                <img alt="" class="__image" src="/place/thumbnail/${saveObject['index']}">
                                <span class="__count">${saveObject['imageCount']}</span>
                            </div>
                            <div class="__button-container">
                                <a class="__button" href="tel:${saveObject['contact']}">
                                    <img alt="" class="__icon" src="/resources/images/_call.png">
                                    <span class="__text">전화</span>
                                </a>
                                <a class="__button" href="#" ${saveObject['saved'] ? 'data-mz-saved' : ''} data-mz-button="save">
                                    <img alt="" class="__icon __save" src="/resources/images/_save.png">
                                    <img alt="" class="__icon __saved" src="/resources/images/_saved.png">
                                    <span class="__text">저장</span>
                                </a>
                                <a class="__button" href="#" data-mz-button="delete">
                                    <img alt="" class="__icon" src="/resources/images/_delete.png">
                                    <span class="__text">삭제</span>
                                </a>
                            </div>
                        </li>`, 'text/html').querySelector('[data-mz-item]');
                    const nameFieldEl = saveEl.querySelector('[data-mz-field="name"]');
                    const saveButtonEl = saveEl.querySelector('[data-mz-button="save"]');
                    const deleteButtonEl = saveEl.querySelector('[data-mz-button="delete"]');
                    nameFieldEl.onclick = function () {
                        detail.show(saveObject['index']);
                    }
                    saveButtonEl.onclick = function (e) {
                        place.save.handler(e, {
                            index: saveObject['index']
                        });
                    }
                    deleteButtonEl.onclick = function (e) {
                        place.delete.handler(e, {
                            index: saveObject['index']
                        });
                    }
                    saveListEl.append(saveEl);
                }
            }
        });
    }
    save.setAttribute('visible', '');
    return this;
}