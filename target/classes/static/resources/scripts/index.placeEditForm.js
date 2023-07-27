const placeEditForm = document.getElementById('placeEditForm');

{
    const thumbnailContainerEl = placeEditForm.querySelector('[data-mz-thumbnail-container]');
    thumbnailContainerEl.onclick = function () {
        placeEditForm['thumbnail'].click();
    }
}

placeEditForm.show = function (placeObject) {
    map.object.setCenter(new kakao.maps.LatLng(placeObject['lat'], placeObject['lng']));
    map.setAttribute('data-mz-mode', 'editing');
    menu.setAttribute('collapsed', '');
    place.setAttribute('collapsed', '');
    detail.hide();

    const timeObject = JSON.parse(placeObject['time']);
    const thumbnailContainerEl = placeEditForm.querySelector('[data-mz-thumbnail-container]');
    placeEditForm.hideAllWarnings();
    placeEditForm['index'].value = placeObject['index'];
    placeEditForm['contact'].value = placeObject['contact'];
    placeEditForm['name'].value = placeObject['name'];
    placeEditForm['name'].focus();
    placeEditForm['addressPostal'].value = placeObject['addressPostal'];
    placeEditForm['addressPrimary'].value = placeObject['addressPrimary'];
    placeEditForm['addressSecondary'].value = placeObject['addressSecondary'];
    placeEditForm['lat'].value = placeObject['lat'];
    placeEditForm['lng'].value = placeObject['lng'];
    placeEditForm['description'].value = placeObject['description'];
    for (const day of Constants.DaysEn) {
        placeEditForm[`${day}Operating`].checked = timeObject[day]['operates'];
        placeEditForm[`${day}Open`].value = timeObject[day]['open'];
        placeEditForm[`${day}Close`].value = timeObject[day]['close'];
    }
    thumbnailContainerEl.style.backgroundImage = `url("/place/thumbnail/${placeObject['index']}")`;
    placeEditForm.scrollTop = 0;
    placeEditForm.setAttribute('data-mz-step', 'edit');
    placeEditForm.setAttribute('visible', '');
}

placeEditForm.hide = function () {
    if (placeEditForm.getAttribute('data-mz-step') === 'address') {
        placeEditForm.setAttribute('data-mz-step', 'edit');
        return this;
    }
    map.removeAttribute('data-mz-mode');
    menu.removeAttribute('collapsed');
    place.removeAttribute('collapsed');
    placeEditForm.removeAttribute('visible');
    return this;
}

placeEditForm.onsubmit = function (e) {
    e.preventDefault();
    placeEditForm.hideAllWarnings();
    if (placeEditForm['name'].value === '') {
        placeEditForm.showWarning('name', '이름을 입력해 주세요.');
        placeEditForm['name'].focus();
        return false;
    }
    if (!Regex.Place.Name.test(placeEditForm['name'].value)) {
        placeEditForm.showWarning('name', '올바른 이름을 입력해 주세요.');
        placeEditForm['name'].focusAndSelect();
        return false;
    }
    if (placeEditForm['contact'].value === '') {
        placeEditForm.showWarning('contact', '연락처를 입력해 주세요.');
        placeEditForm['contact'].focus();
        return false;
    }
    if (!Regex.Place.Contact.test(placeEditForm['contact'].value)) {
        placeEditForm.showWarning('contact', '올바른 연락처를 입력해 주세요.');
        placeEditForm['contact'].focusAndSelect();
        return false;
    }
    if (placeEditForm['addressPostal'].value === '' || placeEditForm['addressPrimary'].value === '') {
        placeEditForm.showWarning('address', '\'우편번호 찾기\' 버튼을 클릭하여 주소를 선택하거나 지도를 움직여 주소를 완성해 주세요.');
        placeEditForm['addressPostal'].focus();
        return false;
    }
    if (!Regex.Place.AddressSecondary.test(placeEditForm['addressSecondary'].value)) {
        placeEditForm.showWarning('address', '올바른 상세 주소를 입력해 주세요.');
        placeEditForm['addressSecondary'].focusAndSelect();
        return false;
    }
    if (Constants.DaysEn.every(day => !placeEditForm[`${day}Operating`].checked)) {
        placeEditForm.showWarning('time', '일주일 중 하루 이상 영업하여야 합니다.');
        return false;
    }
    if (Constants.DaysEn.some(day => placeEditForm[`${day}Operating`].checked && (placeEditForm[`${day}Open`].value === '' || placeEditForm[`${day}Close`].value === ''))) {
        placeEditForm.showWarning('time', '영업 표시된 날짜의 오픈, 마감 시간이 명시되어야 합니다.');
        return false;
    }
    if (placeEditForm['description'].value === '') {
        placeEditForm.showWarning('description', '설명을 입력해 주세요.');
        placeEditForm['description'].focus();
        return false;
    }
    let timeObject = {};
    for (const day of Constants.DaysEn) {
        timeObject[day] = {
            operates: placeEditForm[`${day}Operating`].checked,
            open: placeEditForm[`${day}Open`].value,
            close: placeEditForm[`${day}Close`].value
        };
    }
    const formData = new FormData();
    formData.append('index', placeEditForm['index'].value);
    formData.append('name', placeEditForm['name'].value);
    formData.append('contact', placeEditForm['contact'].value);
    formData.append('addressPostal', placeEditForm['addressPostal'].value);
    formData.append('addressPrimary', placeEditForm['addressPrimary'].value);
    formData.append('addressSecondary', placeEditForm['addressSecondary'].value);
    formData.append('lat', placeEditForm['lat'].value);
    formData.append('lng', placeEditForm['lng'].value);
    formData.append('time', JSON.stringify(timeObject));
    if (placeEditForm['thumbnail'].files && placeEditForm['thumbnail'].files.length > 0) {
        formData.append('thumbnailMultipart', placeEditForm['thumbnail'].files[0]);
    }
    formData.append('description', placeEditForm['description'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Patch,
        url: '/place/place',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            placeEditForm.showWarning('common', '서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    placeEditForm.showWarning('common', '알 수 없는 이유로 맛집을 수정하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                    break;
                case 'success':
                    cover.show();
                    placeEditForm.hide();
                    Dialog.create({
                        title: '맛집',
                        body: `맛집 '${placeEditForm['name'].value}'을(를) 성공적으로 수정하였습니다.\n아래 확인 버튼을 클릭하면 자세한 정보를 확인할 수 있습니다.`,
                        buttons: [
                            Dialog.createButton('확인', function (_, dialog) {
                                dialog.hide();
                                cover.hide();
                                map.onmove();
                                detail.show(responseObject['index']);
                            })
                        ]
                    }).show();
                    break;
                default:
                    placeEditForm.showWarning('common', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
    return false;
}

placeEditForm['addressFind'].onclick = function () {
    const addressStepEl = placeEditForm.querySelector('[data-mz-step="address"]');
    new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: function (data) {
            placeEditForm.setAttribute('data-mz-step', 'edit');
            placeEditForm['addressPostal'].value = data['zonecode'];
            placeEditForm['addressPrimary'].value = data['address'];
            placeEditForm['addressSecondary'].focusAndSelect();
            map.geocoder.addressSearch(data['address'], function (result, status) {
                if (status !== kakao.maps.services.Status.OK || result.length < 1) {
                    return;
                }
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                map.object.setCenter(coords);
            });
        }
    }).embed(addressStepEl);
    placeEditForm.setAttribute('data-mz-step', 'address');
}

placeEditForm['thumbnail'].onchange = function () {
    const thumbnailContainerEl = placeEditForm.querySelector('[data-mz-thumbnail-container]');
    if (!placeEditForm['thumbnail'].files || placeEditForm['thumbnail'].files.length < 1) {
        thumbnailContainerEl.style.backgroundImage = `url("/place/thumbnail/${placeEditForm['index'].value}")`;
        return;
    }
    thumbnailContainerEl.style.backgroundImage = `url('${URL.createObjectURL(placeEditForm['thumbnail'].files[0])}')`;
}

placeEditForm.registerClosers();