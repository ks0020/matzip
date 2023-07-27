const place = document.getElementById('place');

{
    const menuEl = place.querySelector(':scope > [data-mz-place-menu]');
    const addMenuEl = menuEl.querySelector(':scope > [data-mz-item="add"]');
    addMenuEl.onclick = function() {
        if (!User.isSigned()) {
            Dialog.showCommonLogin('맛집 추가', '맛집을 추가하기 위해서 로그인해 주시기 바랍니다.');
            return;
        }
        placeAddForm.show();
    }
}

place.delete = function (index, callback) {
    const formData = new FormData();
    formData.append('index', index);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Delete,
        url: '/place/place',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            if (typeof callback !== 'function') {
                return;
            }
            callback(false, undefined);
        },
        ondonegood: function (_, responseText) {
            if (typeof callback !== 'function') {
                return;
            }
            const responseObject = JSON.parse(responseText);
            callback(responseObject['result'] === 'success');
        }
    });
}

place.delete.handler = function (e, params) {
    if (typeof e?.preventDefault === 'function') {
        e.preventDefault();
    }
    cover.show();
    Dialog.create({
        title: '맛집 삭제',
        body: '정말로 맛집을 삭제할까요?\n관련된 리뷰 및 데이터가 모두 삭제되고 복구할 수 없습니다.',
        type: Dialog.Type.Warning,
        buttons: [
            Dialog.createButton('삭제', function (_, dialog) {
                dialog.hide();
                cover.hide();
                place.delete(params['index'], function (result) {
                    cover.show();
                    if (result !== true) {
                        Dialog.create({
                            title: '맛집 삭제',
                            body: '알 수 없는 이유로 맛집을 삭제하지 못하였습니다.\n잠시 후 다시 시도해 주세요.',
                            type: Dialog.Type.Error,
                            buttons: [
                                Dialog.createButton('확인', function (_, dialog) {
                                    dialog.hide();
                                    cover.hide();
                                })
                            ]
                        }).show();
                        return;
                    }
                    Dialog.create({
                        title: '맛집 삭제',
                        body: '맛집을 성공적으로 삭제하였습니다.',
                        type: Dialog.Type.Information,
                        buttons: [
                            Dialog.createButton('확인', function (_, dialog) {
                                dialog.hide();
                                cover.hide();
                                detail.hide();
                                map.onmove();
                            })
                        ]
                    }).show();
                });
            }),
            Dialog.createButton('취소', function (_, dialog) {
                dialog.hide();
                cover.hide();
            })
        ]
    }).show();
}

place.load = function () {
    const bounds = map.object.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    Ajax.request({
        method: Ajax.Method.Get,
        url: `/place/places?minLat=${sw.getLat()}&maxLat=${ne.getLat()}&minLng=${sw.getLng()}&maxLng=${ne.getLng()}`,
        ondonegood: function (_, responseText) {
            const placeListEl = place.querySelector(':scope > [data-mz-place-list]');
            const placeEls = Array.from(placeListEl.querySelectorAll(':scope > [data-mz-item]'));
            for (const marker of map.markers) {
                marker.setMap(null);
            }
            map.markers = [];
            placeEls.forEach(function (placeEl) {
                placeEl.remove();
            });
            const responseObject = JSON.parse(responseText);
            switch (responseObject['result']) {
                case 'no_result':
                    placeListEl.setAttribute('data-mz-issue', 'empty');
                    break;
                case 'too_much_range':
                    placeListEl.setAttribute('data-mz-issue', 'tooMuch');
                    break;
                case 'success':
                    placeListEl.removeAttribute('data-mz-issue');
                    for (const placeObject of responseObject['places']) {
                        const placeEl = new DOMParser().parseFromString(`
                            <li class="__item" data-mz-item data-mz-index="${placeObject['index']}">
                                <div class="__spec-container">
                                    <span class="__name" data-mz-field="name">${placeObject['name']}</span>
                                    <span class="__operation-wrapper">
                                        <span class="__operating">영업 전</span>
                                        <span class="__extra">11:00에 영업 시작</span>
                                    </span>
                                    <span class="__address">${placeObject['addressPrimary']}</span>
                                </div>
                                <div class="__image-container">
                                    <img alt="" class="__image" src="/place/thumbnail/${placeObject['index']}">
                                    <span class="__count">${placeObject['imageCount']}</span>
                                </div>
                                <div class="__button-container">
                                    <a class="__button" href="tel:${placeObject['contact']}">
                                        <img alt="" class="__icon" src="/resources/images/_call.png">
                                        <span class="__text">전화</span>
                                    </a>
                                    <a class="__button" href="#" ${placeObject['saved'] ? 'data-mz-saved' : ''} data-mz-button="save">
                                        <img alt="" class="__icon __save" src="/resources/images/_save.png">
                                        <img alt="" class="__icon __saved" src="/resources/images/_saved.png">
                                        <span class="__text">저장</span>
                                    </a>
                                    ${placeObject['mine'] === true ? `
                                    <a class="__button" href="#" data-mz-button="delete">
                                        <img alt="" class="__icon" src="/resources/images/_delete.png">
                                        <span class="__text">삭제</span>
                                    </a>` : ''}
                                    ${placeObject['mine'] !== true ? `
                                    <a class="__button" href="#">
                                        <img alt="" class="__icon" src="/resources/images/_report.png">
                                        <span class="__text">신고</span>
                                    </a>` : ''}
                                </div>
                            </li>`, 'text/html').querySelector('[data-mz-item]');
                        const nameFieldEl = placeEl.querySelector('[data-mz-field="name"]');
                        const saveButtonEl = placeEl.querySelector('[data-mz-button="save"]');
                        const deleteButtonEl = placeEl.querySelector('[data-mz-button="delete"]');
                        nameFieldEl.onclick = function () {
                            detail.show(placeEl.dataset.mzIndex);
                        }
                        saveButtonEl.onclick = function (e) {
                            place.save.handler(e, {
                                index: placeObject['index']
                            });
                        }
                        if (deleteButtonEl) {
                            deleteButtonEl.onclick = function (e) {
                                place.delete.handler(e, {
                                    index: placeObject['index']
                                });
                            };
                        }
                        placeListEl.append(placeEl);
                        const marker = new kakao.maps.Marker({
                            position: new kakao.maps.LatLng(placeObject['lat'], placeObject['lng'])
                        });
                        marker.setMap(map.object);
                        kakao.maps.event.addListener(marker, 'click', function () {
                            detail.show(placeObject['index']);
                        });
                        map.markers.push(marker);
                    }
                    break;
            }
        }
    });
}

place.report = function (index, callback) {
    const formData = new FormData();
    formData.append('index', index);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Post,
        url: '/place/report',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            if (typeof callback !== 'function') {
                return;
            }
            callback(false, undefined);
        },
        ondonegood: function (_, responseText) {
            if (typeof callback !== 'function') {
                return;
            }
            const responseObject = JSON.parse(responseText);
            callback(responseObject['result'] === 'success');
        }
    });
}

place.report.handler = function (e, params) {
    if (typeof e?.preventDefault === 'function') {
        e.preventDefault();
    }
    if (!User.isSigned()) {
        Dialog.showCommonLogin('맛집 신고', '맛집을 신고하기 위해서 로그인해 주시기 바랍니다.');
        return;
    }
    cover.show();
    Dialog.create({
        title: '맛집 신고',
        body: '정말로 맛집을 신고할까요?\n허위 신고가 반복될 경우 일부 기능 이용에 제한이 생길 수 있습니다.',
        type: Dialog.Type.Warning,
        buttons: [
            Dialog.createButton('신고', function (_, dialog) {
                dialog.hide();
                cover.hide();
                place.report(params['index'], function (result) {
                    cover.show();
                    if (result !== true) {
                        Dialog.create({
                            title: '맛집 신고',
                            body: '알 수 없는 이유로 맛집을 신고하지 못하였습니다.\n잠시 후 다시 시도해 주세요.',
                            type: Dialog.Type.Error,
                            buttons: [
                                Dialog.createButton('확인', function (_, dialog) {
                                    dialog.hide();
                                    cover.hide();
                                })
                            ]
                        }).show();
                        return;
                    }
                    Dialog.create({
                        title: '맛집 신고',
                        body: '맛집을 성공적으로 신고하였습니다.\n신고 결과는 별도로 안내드리지 않으며 이용약관을 위반한 것으로 확인되면 제재 조치됩니다.',
                        type: Dialog.Type.Information,
                        buttons: [
                            Dialog.createButton('확인', function (_, dialog) {
                                dialog.hide();
                                cover.hide();
                            })
                        ]
                    }).show();
                });
            }),
            Dialog.createButton('취소', function (_, dialog) {
                dialog.hide();
                cover.hide();
            })
        ]
    }).show();
}

place.save = function (index, callback) {
    const formData = new FormData();
    formData.append('index', index);
    Ajax.request({
        method: Ajax.Method.Patch,
        url: '/place/save',
        data: formData,
        ondonebad: function () {
            if (typeof callback !== 'function') {
                return;
            }
            callback(false, undefined);
        },
        ondonegood: function (_, responseText) {
            if (typeof callback !== 'function') {
                return;
            }
            const responseObject = JSON.parse(responseText);
            const result = responseObject['result'] === 'success';
            const saved = result === true ? responseObject['saved'] : undefined;
            callback(result, saved);
        }
    });
}

place.save.handler = function (e, params) {
    if (typeof e?.preventDefault === 'function') {
        e.preventDefault();
    }
    if (!User.isSigned()) {
        Dialog.showCommonLogin('맛집 저장', '맛집을 저장하기 위해서 로그인해 주시기 바랍니다.');
        return;
    }
    place.save(params['index'], function (result, saved) {
        if (result !== true) {
            cover.show();
            Dialog.create({
                title: '맛집 저장',
                body: '알 수 없는 이유로 맛집을 저장하지 못하였습니다.\n잠시 후 다시 시도해 주세요.',
                type: Dialog.Type.Error,
                buttons: [
                    Dialog.createButton('확인', function (_, dialog) {
                        cover.hide();
                        dialog.hide();
                    })
                ]
            }).show();
            return;
        }
        const placeListItemEl = place.querySelector(`[data-mz-index="${params['index']}"]`);
        if (placeListItemEl) {
            if (saved) {
                placeListItemEl.querySelector('[data-mz-button="save"]').setAttribute('data-mz-saved', '');
            } else {
                placeListItemEl.querySelector('[data-mz-button="save"]').removeAttribute('data-mz-saved');
            }
        }
        if (detail.isVisible() && parseInt(detail.dataset.mzIndex) === parseInt(params['index'])) {
            if (saved) {
                detail.querySelector('[data-mz-button="save"]').setAttribute('data-mz-saved', '');
            } else {
                detail.querySelector('[data-mz-button="save"]').removeAttribute('data-mz-saved');
            }
        }

        save.querySelector(`:scope > [data-mz-save-list] > [data-mz-item][data-mz-index="${params['index']}"]`)?.remove();
    });
}

place.onscroll = function () {
    if (place.scrollTop > 0) {
        place.setAttribute('compact', '');
    } else {
        place.removeAttribute('compact');
    }
    place.querySelector(':scope > .menu').style.top = `${place.querySelector(':scope > .head').getBoundingClientRect().height}px`;
}

const placeSearchForm = document.getElementById('placeSearchForm');

placeSearchForm.onsubmit = function (e) {
    e.preventDefault();
    if (placeSearchForm['keyword'].value === '') {
        return false;
    }
    return false;
}