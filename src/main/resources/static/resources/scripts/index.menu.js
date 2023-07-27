const menu = document.getElementById('menu');

{
    const mainMenuEl = menu.querySelector(':scope > [data-mz-menu="main"]');
    const mainItemEls = Array.from(mainMenuEl.querySelectorAll(':scope > [data-mz-item]'));
    const mainMatzipItemEl = mainMenuEl.querySelector(':scope > [data-mz-item="matzip"]');
    const mainSaveItemEl = mainMenuEl.querySelector(':scope > [data-mz-item="save"]');
    mainMatzipItemEl.onclick = function () {
        if (this.hasAttribute('selected')) {
            return;
        }
        mainItemEls.forEach(function (menu) {
            menu.removeAttribute('selected');
        });
        mainMatzipItemEl.setAttribute('selected', '');
        place.show();
        save.hide();
    }
    mainSaveItemEl.onclick = function () {
        if (this.hasAttribute('selected')) {
            return;
        }
        mainItemEls.forEach(function (menu) {
            menu.removeAttribute('selected');
        });
        mainSaveItemEl.setAttribute('selected', '');
        place.hide();
        save.show();
    }
}

{
    const subMenuEl = menu.querySelector(':scope > [data-mz-menu="sub"]');
    const subLoginMenu = subMenuEl.querySelector(':scope > [data-mz-item="login"]');
    const subAccountMenu = subMenuEl.querySelector(':scope > [data-mz-item="account"]');
    const subLogoutMenu = subMenuEl.querySelector(':scope > [data-mz-item="logout"]');
    const subHelpMenu = subMenuEl.querySelector(':scope > [data-mz-item="help"]');
    if (subLoginMenu) {
        subLoginMenu.onclick = function () {
            loginForm.show();
        }
    }
    if (subAccountMenu) {
        subAccountMenu.onclick = function () {
            accountForm.show();
        }
    }
    if (subLogoutMenu) {
        subLogoutMenu.onclick = function (e) {
            e.preventDefault();
            cover.show();
            Dialog.create({
                title: '로그아웃',
                body: '정말로 로그아웃할까요?',
                buttons: [
                    Dialog.createButton('확인', function () {
                        location.href = '/user/logout';
                    }),
                    Dialog.createButton('취소', function (_, dialog) {
                        dialog.hide();
                        cover.hide();
                    })
                ]
            }).show();
        }
    }
    subHelpMenu.onclick = function () {
        alert('그런거 없다.');
    }
}