const placeAddForm = document.getElementById('placeAddForm');

{
    const thumbnailContainerEl = placeAddForm.querySelector(':scope > .__body > [data-mz-thumbnail-container]');
    thumbnailContainerEl.onclick = function () {
        placeAddForm['thumbnail'].click();
    }
}

placeAddForm.show = function () {
    map.setAttribute('data-mz-mode', 'adding');
    menu.setAttribute('collapsed', '');
    place.setAttribute('collapsed', '');
    detail.hide();

    const thumbnailContainerEl = placeAddForm.querySelector(':scope > .__body > [data-mz-thumbnail-container]');
    thumbnailContainerEl.setAttribute('data-mz-thumbnail-container', 'empty');
    thumbnailContainerEl.style.backgroundImage = '';
    for (const day of Constants.DaysEn) {
        placeAddForm[`${day}Operating`].checked = false;
        placeAddForm[`${day}Open`].value = '';
        placeAddForm[`${day}Close`].value = '';
    }
    placeAddForm.hideAllWarnings();
    placeAddForm['name'].value = '';
    placeAddForm['name'].focus();
    placeAddForm['contact'].value = '';
    placeAddForm['addressPostal'].value = '';
    placeAddForm['addressPrimary'].value = '';
    placeAddForm['addressSecondary'].value = '';
    placeAddForm['description'].value = '';
    placeAddForm.scrollTop = 0;
    placeAddForm.setAttribute('data-mz-step', 'add');
    placeAddForm.setAttribute('visible', '');
    return this;
}

placeAddForm.hide = function () {
    if (placeAddForm.getAttribute('data-mz-step') === 'address') {
        placeAddForm.setAttribute('data-mz-step', 'add');
        return this;
    }
    map.removeAttribute('data-mz-mode');
    menu.removeAttribute('collapsed');
    place.removeAttribute('collapsed');
    placeAddForm.removeAttribute('visible');
    return this;
}

placeAddForm.onsubmit = function (e) {
    e.preventDefault();
    placeAddForm.hideAllWarnings();
    if (placeAddForm['name'].value === '') {
        placeAddForm.showWarning('name', '이름을 입력해 주세요.');
        placeAddForm['name'].focus();
        return false;
    }
    if (!Regex.Place.Name.test(placeAddForm['name'].value)) {
        placeAddForm.showWarning('name', '올바른 이름을 입력해 주세요.');
        placeAddForm['name'].focusAndSelect();
        return false;
    }
    if (placeAddForm['contact'].value === '') {
        placeAddForm.showWarning('contact', '연락처를 입력해 주세요.');
        placeAddForm['contact'].focus();
        return false;
    }
    if (!Regex.Place.Contact.test(placeAddForm['contact'].value)) {
        placeAddForm.showWarning('contact', '올바른 연락처를 입력해 주세요.');
        placeAddForm['contact'].focusAndSelect();
        return false;
    }
    if (placeAddForm['addressPostal'].value === '' || placeAddForm['addressPrimary'].value === '') {
        placeAddForm.showWarning('address', '\'우편번호 찾기\' 버튼을 클릭하여 주소를 선택하거나 지도를 움직여 주소를 완성해 주세요.');
        placeAddForm['addressPostal'].focus();
        return false;
    }
    if (!Regex.Place.AddressSecondary.test(placeAddForm['addressSecondary'].value)) {
        placeAddForm.showWarning('address', '올바른 상세 주소를 입력해 주세요.');
        placeAddForm['addressSecondary'].focusAndSelect();
        return false;
    }
    if (!placeAddForm['thumbnail'].files || placeAddForm['thumbnail'].files.length < 1) {
        placeAddForm.showWarning('thumbnail', '대표 이미지를 선택해 주세요.');
        return false;
    }
    if (Constants.DaysEn.every(day => !placeAddForm[`${day}Operating`].checked)) {
        placeAddForm.showWarning('time', '일주일 중 하루 이상 영업하여야 합니다.');
        return false;
    }
    if (Constants.DaysEn.some(day => placeAddForm[`${day}Operating`].checked && (placeAddForm[`${day}Open`].value === '' || placeAddForm[`${day}Close`].value === ''))) {
        placeAddForm.showWarning('time', '영업 표시된 날짜의 오픈, 마감 시간이 명시되어야 합니다.');
        return false;
    }
    if (placeAddForm['description'].value === '') {
        placeAddForm.showWarning('description', '설명을 입력해 주세요.');
        placeAddForm['description'].focus();
        return false;
    }
    let timeObject = {};
    for (const day of Constants.DaysEn) {
        timeObject[day] = {
            operates: placeAddForm[`${day}Operating`].checked,
            open: placeAddForm[`${day}Open`].value,
            close: placeAddForm[`${day}Close`].value
        };
    }
    const formData = new FormData();
    formData.append('name', placeAddForm['name'].value);
    formData.append('contact', placeAddForm['contact'].value);
    formData.append('addressPostal', placeAddForm['addressPostal'].value);
    formData.append('addressPrimary', placeAddForm['addressPrimary'].value);
    formData.append('addressSecondary', placeAddForm['addressSecondary'].value);
    formData.append('lat', placeAddForm['lat'].value);
    formData.append('lng', placeAddForm['lng'].value);
    formData.append('time', JSON.stringify(timeObject));
    formData.append('thumbnailMultipart', placeAddForm['thumbnail'].files[0]);
    formData.append('description', placeAddForm['description'].value);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Post,
        url: '/place/place',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            placeAddForm.showWarning('common', '서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'failure':
                    placeAddForm.showWarning('common', '알 수 없는 이유로 맛집을 추가하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                    break;
                case 'success':
                    placeAddForm.hide();
                    cover.show();
                    Dialog.create({
                        title: '맛집',
                        body: `새로운 맛집 '${placeAddForm['name'].value}'이(가) 성공적으로 추가되었습니다.\n아래 확인 버튼을 클릭하면 자세한 정보를 확인할 수 있습니다.`,
                        buttons: [
                            Dialog.createButton('확인', function(_, dialog) {
                                dialog.hide();
                                cover.hide();
                                map.onmove();
                                detail.show(responseObject['index']);
                            })
                        ]
                    }).show();
                    break;
                default:
                    placeAddForm.showWarning('common', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    });
    return false;
}

placeAddForm['addressFind'].onclick = function () {
    const addressStepEl = placeAddForm.querySelector('[data-mz-step="address"]');
    new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: function (data) {
            placeAddForm.setAttribute('data-mz-step', 'add');
            placeAddForm['addressPostal'].value = data['zonecode'];
            placeAddForm['addressPrimary'].value = data['address'];
            placeAddForm['addressSecondary'].focusAndSelect();
            map.geocoder.addressSearch(data['address'], function (result, status) {
                if (status !== kakao.maps.services.Status.OK || result.length < 1) {
                    return;
                }
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                map.object.setCenter(coords);
            });
        }
    }).embed(addressStepEl);
    placeAddForm.setAttribute('data-mz-step', 'address');
}

placeAddForm['thumbnail'].onchange = function () {
    const thumbnailContainerEl = placeAddForm.querySelector(':scope > .__body > [data-mz-thumbnail-container]');
    let attribute = 'empty';
    let backgroundImage = '';
    if (placeAddForm['thumbnail'].files && placeAddForm['thumbnail'].files.length > 0) {
        attribute = '';
        backgroundImage = `url('${URL.createObjectURL(placeAddForm['thumbnail'].files[0])}')`;
    }
    thumbnailContainerEl.setAttribute('data-mz-thumbnail-container', attribute);
    thumbnailContainerEl.style.backgroundImage = backgroundImage;
}

placeAddForm.registerClosers();