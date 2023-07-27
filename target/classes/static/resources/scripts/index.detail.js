const detail = document.getElementById('detail');

detail.deleteReview = function (index, callback) {
    const formData = new FormData();
    formData.append('index', index);
    loading.show();
    Ajax.request({
        method: Ajax.Method.Delete,
        url: '/place/review',
        data: formData,
        ondone: function () {
            loading.hide();
        },
        ondonebad: function () {
            if (typeof callback !== 'function') {
                return;
            }
            callback(false);
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

detail.deleteReview.handler = function (e, params) {
    if (typeof e?.preventDefault === 'function') {
        e.preventDefault();
    }
    cover.show();
    Dialog.create({
        title: '리뷰 삭제',
        body: '정말로 리뷰를 삭제할까요?\n삭제된 리뷰는 복구할 수 없어요.',
        buttons: [
            Dialog.createButton('삭제', function (_, dialog) {
                cover.hide();
                dialog.hide();
                detail.deleteReview(params['index'], function (result) {
                    if (result !== true) {
                        cover.show();
                        Dialog.create({
                            title: '맛집 리뷰',
                            body: '알 수 없는 이유로 리뷰를 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.',
                            buttons: [
                                Dialog.createButton('확인', function (_, dialog) {
                                    dialog.hide();
                                    cover.hide();
                                })
                            ]
                        }).show();
                        return;
                    }
                    cover.show();
                    Dialog.create({
                        title: '맛집 리뷰',
                        body: '리뷰가 성공적으로 삭제되었습니다.',
                        buttons: [
                            Dialog.createButton('확인', function (_, dialog) {
                                dialog.hide();
                                cover.hide();
                                detail.loadReviews(reviewForm['placeIndex'].value);
                            })
                        ]
                    }).show();
                });
            }),
            Dialog.createButton('취소', function (_, dialog) {
                cover.hide();
                dialog.hide();
            })
        ]
    }).show();
}

detail.likeReview = function (index, callback) {
    const formData = new FormData();
    formData.append('index', index);
    Ajax.request({
        method: Ajax.Method.Patch,
        url: '/place/review-like',
        data: formData,
        ondonebad: function () {
            if (typeof callback !== 'function') {
                return;
            }
            callback(false);
        },
        ondonegood: function(_, responseText) {
            if (typeof callback !== 'function') {
                return;
            }
            const responseObject = JSON.parse(responseText);
            const result = responseObject['result'] === 'success';
            if (result !== true) {
                callback(false);
                return;
            }
            const liked = responseObject['liked'] === true;
            const likeCount = responseObject['likeCount'];
            callback(true, liked, likeCount);
        }
    });
}

detail.likeReview.handler = function (e, params) {
    e.preventDefault();
    if (!User.isSigned()) {
        cover.show();
        Dialog.showCommonLogin('리뷰 추천', '리뷰를 추천하기 위해서 로그인해 주시기 바랍니다.');
        return;
    }
    detail.likeReview(params['index'], function (result, liked, likeCount) {
        if (result !== true) {
            cover.show();
            Dialog.create({
                title: '리뷰 추천',
                body: '알 수 없는 이유로 리뷰를 추천하지 못하였습니다.\n잠시 후 다시 시도해 주세요.',
                type: Dialog.Type.Error,
                buttons: [
                    Dialog.createButton('확인', function (_, dialog) {
                        cover.hide();
                        dialog.hide();
                    })
                ]
            }).show();
        }
        if (liked) {
            params['likeButtonEl'].setAttribute('data-mz-liked', '');
        } else {
            params['likeButtonEl'].removeAttribute('data-mz-liked');
        }
        params['likeCountEl'].innerText = likeCount;
    });
}

detail.loadReviews = function (placeIndex) {
    const reviewListEl = detail.querySelector(':scope > [data-mz-review-list]');
    const reviewEls = reviewListEl.querySelectorAll(':scope > [data-mz-item]');
    reviewEls.forEach(function (reviewEl) {
        reviewEl.remove();
    });
    Ajax.request({
        method: Ajax.Method.Get,
        url: `/place/reviews?placeIndex=${placeIndex}`,
        ondonebad: function () {
            reviewListEl.setAttribute('data-mz-issue', 'error');
        },
        ondonegood: function (_, responseText) {
            const responseArray = JSON.parse(responseText);
            if (responseArray.length === 0) {
                reviewListEl.setAttribute('data-mz-issue', 'empty');
                return;
            }
            reviewListEl.removeAttribute('data-mz-issue');
            for (const reviewObject of responseArray) {
                const reviewEl = new DOMParser().parseFromString(`
                    <li class="review" data-mz-item data-mz-index="${reviewObject['index']}">
                        <div class="head">
                            <span class="nickname">
                                <b>${reviewObject['userNickname']}</b>
                                <span>님</span>
                            </span>
                            <span class="rating">
                                <img alt="" class="star" src="/resources/images/index.detail.review.rating.star.png">
                                <span class="value">${reviewObject['rating']}</span>
                                <span class="perfect">/5</span>
                            </span>
                            <span class="visit">
                                <span class="text">방문일</span>
                                <span class="value">${reviewObject['visit'].split('T')[0]}</span>
                            </span>
                        </div>
                        <div class="image-container" data-mz-image-container></div>
                        <div class="body">${reviewObject['content']}</div>
                        <div class="button-container">
                            <span class="button like" data-mz-button="like" ${reviewObject['liked'] === true ? 'data-mz-liked' : ''}>
                                <img alt="" class="icon" src="/resources/images/index.detail.review.like.png">
                                <span class="value" data-mz-like-count>${reviewObject['likeCount']}</span>
                            </span>
                            <span class="spring"></span>
                            ${reviewObject['mine'] === true ? '<a class="button" href="#" data-mz-button="delete">삭제</a>' : ''}
                            ${reviewObject['mine'] !== true ? '<a class="button" href="#" data-mz-button="report">신고</a>' : ''}
                        </div>
                    </li>`, 'text/html').querySelector('[data-mz-item]');
                const imageContainerEl = reviewEl.querySelector('[data-mz-image-container]');
                for (const imageIndex of reviewObject['imageIndexes']) {
                    const imgEl = document.createElement('img');
                    imgEl.classList.add('image');
                    if (imageContainerEl.childNodes.length === 0) {
                        imgEl.classList.add('big');
                    }
                    imgEl.setAttribute('alt', '');
                    imgEl.setAttribute('src', `/place/review-image/${imageIndex}`);
                    imgEl.onclick = function () {
                        window.open(imgEl.getAttribute('src'), '_blank');
                    }
                    imageContainerEl.append(imgEl);
                }
                const likeButtonEl = reviewEl.querySelector('[data-mz-button="like"]');
                const likeCountEl = reviewEl.querySelector('[data-mz-like-count]');
                const deleteButtonEl = reviewEl.querySelector('[data-mz-button="delete"]');
                likeButtonEl.onclick = function (e) {
                    detail.likeReview.handler(e, {
                        index: reviewObject['index'],
                        likeButtonEl: likeButtonEl,
                        likeCountEl: likeCountEl
                    });
                }
                if (deleteButtonEl) {
                    deleteButtonEl.onclick = function (e) {
                        detail.deleteReview.handler(e, {
                            index: reviewObject['index']
                        })
                    }
                }
                reviewListEl.append(reviewEl);
            }
        }
    });
}

detail.show = function (index) {
    Ajax.request({
        method: Ajax.Method.Get,
        url: `/place/place?index=${index}`,
        ondonebad: function () {
            cover.show();
            Dialog.create({
                title: '맛집',
                body: '맛집 상세 정보를 불러오지 못하였습니다.\n잠시 후 다시 시도해 주세요.',
                type: Dialog.Type.Error,
                buttons: [
                    Dialog.createButton('확인', function (_, dialog) {
                        dialog.hide();
                        cover.hide();
                        detail.hide();
                    })
                ]
            }).show();
        },
        ondonegood: function (_, responseText) {
            const responseObject = JSON.parse(responseText);
            const nameEls = detail.querySelectorAll('[data-mz-field="name"]');
            nameEls.forEach(function (nameEl) {
                nameEl.innerText = responseObject['name'];
            });
            const thumbnailEl = detail.querySelector('[data-mz-thumbnail]');
            const headImageEls = Array.from(detail.querySelectorAll('[data-mz-head-image]'));
            const headImageIdx = responseObject['headImageIndexes'];
            thumbnailEl.setAttribute('src', `/place/thumbnail/${index}`);
            thumbnailEl.onclick = function () {
                window.open(thumbnailEl.getAttribute('src'), '_blank');
            }
            for (let i = 0; i < headImageIdx.length; i++) {
                headImageEls[i].setAttribute('src', `/place/review-image/${headImageIdx[i]}`);
                headImageEls[i].show();
                headImageEls[i].onclick = function () {
                    window.open(headImageEls[i].getAttribute('src'), '_blank');
                }
            }
            for (let i = headImageIdx.length; i < headImageEls.length; i++) {
                headImageEls[i].hide();
            }
            const reportEl = detail.querySelector('[data-mz-button="report"]');
            const ratingAverageEl = detail.querySelector('[data-mz-rating-average]');
            const ratingCountEl = detail.querySelector('[data-mz-rating-count]');
            const descriptionEl = detail.querySelector('[data-mz-field="description"]');
            reportEl.onclick = function(e) {
                place.report.handler(e, {
                    index: responseObject['index']
                });
            }
            ratingAverageEl.innerText = responseObject['ratingAverage'];
            ratingCountEl.innerText = `리뷰 ${responseObject['ratingCount']}`;
            descriptionEl.innerText = responseObject['description'];

            const callButtonEl = detail.querySelector('[data-mz-button="call"]');
            const saveButtonEl = detail.querySelector('[data-mz-button="save"]');
            const deleteButtonEl = detail.querySelector('[data-mz-button="delete"]');
            const editButtonEl = detail.querySelector('[data-mz-button="edit"]');
            callButtonEl.setAttribute('href', `tel:${responseObject['contact']}`);
            if (responseObject['saved'] === true) {
                saveButtonEl.setAttribute('data-mz-saved', '');
            } else {
                saveButtonEl.removeAttribute('data-mz-saved');
            }
            saveButtonEl.onclick = function (e) {
                place.save.handler(e, {
                    index: index
                });
            }
            if (deleteButtonEl) {
                deleteButtonEl.onclick = function (e) {
                    place.delete.handler(e, {
                        index: index
                    });
                };
            }
            if (editButtonEl) {
                editButtonEl.onclick = function(e) {
                    e.preventDefault();
                    placeEditForm.show(responseObject);
                }
            }
            if (responseObject['mine'] === true) {
                deleteButtonEl.setAttribute('visible', '');
                editButtonEl.setAttribute('visible', '');
            } else {
                deleteButtonEl.removeAttribute('visible');
                editButtonEl.removeAttribute('visible');
            }

            const timeObject = JSON.parse(responseObject['time']);
            for (const day of Constants.DaysEn) {
                const dayEl = detail.querySelector(`[data-mz-time-day="${day}"]`);
                if (timeObject[day]['operates'] === true) {
                    dayEl.querySelector(`:scope > [data-mz-time-open]`).innerText = timeObject[day]['open'];
                    dayEl.querySelector(`:scope > [data-mz-time-close]`).innerText = timeObject[day]['close'];
                    dayEl.removeAttribute('data-mz-time-off');
                } else {
                    dayEl.setAttribute('data-mz-time-off', '');
                }
            }
            if (reviewForm) {
                reviewForm['placeIndex'].value = index;
            }
            detail.scrollTop = 0;
            detail.setAttribute('data-mz-index', index);
            detail.setAttribute('visible', '');
            detail.loadReviews(index);
        }
    });
}

detail.registerClosers();

const reviewForm = document.getElementById('reviewForm');

if (reviewForm) {
    {
        const imageAddButtonEl = reviewForm.querySelector('[data-mz-image-add-button]');
        imageAddButtonEl.onclick = function(e) {
            e.preventDefault();
            reviewForm['images'].click();
        }
    }

    reviewForm.onsubmit = function (e) {
        e.preventDefault();
        reviewForm.hideAllWarnings();
        if (reviewForm['visit'].value === '') {
            reviewForm.showWarning('common', '방문일을 선택해 주세요.');
            reviewForm['visit'].focus();
            return false;
        }
        if (reviewForm['content'].value === '') {
            reviewForm.showWarning('common', '내용을 작성해 주세요.');
            reviewForm['content'].focus();
            return false;
        }
        const formData = new FormData();
        formData.append('placeIndex', reviewForm['placeIndex'].value);
        formData.append('rating', reviewForm['rating'].value);
        formData.append('visitStr', reviewForm['visit'].value);
        formData.append('content', reviewForm['content'].value);
        if (reviewForm['images'].files && reviewForm['images'].files.length > 0) {
            for (const file of reviewForm['images'].files) {
                formData.append('imageMultiparts', file);
            }
        }
        loading.show();
        Ajax.request({
            method: Ajax.Method.Post,
            url: '/place/review',
            data: formData,
            ondone: function () {
                loading.hide();
            },
            ondonebad: function () {
                cover.show();
                Dialog.create({
                    title: '맛집 리뷰',
                    body: '서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.',
                    type: Dialog.Type.Error,
                    buttons: [
                        Dialog.createButton('확인', function (_, dialog) {
                            dialog.hide();
                            cover.hide();
                        })
                    ]
                }).show();
            },
            ondonegood: function (_, responseText) {
                const responseObject = JSON.parse(responseText);
                switch (responseObject['result']) {
                    case 'failure':
                        cover.show();
                        Dialog.create({
                            title: '맛집 리뷰',
                            body: '알 수 없는 이유로 리뷰를 작성하지 못하였습니다. 잠시 후 다시 시도해 주세요.',
                            type: Dialog.Type.Error,
                            buttons: [
                                Dialog.createButton('확인', function (_, dialog) {
                                    dialog.hide();
                                    cover.hide();
                                })
                            ]
                        }).show();
                        break;
                    case 'success':
                        reviewForm['rating'].value = '5';
                        reviewForm['visit'].value = '';
                        reviewForm['content'].value = '';
                        reviewForm['images'].value = '';
                        reviewForm['images'].onchange();
                        cover.show();
                        Dialog.create({
                            title: '맛집 리뷰',
                            body: '리뷰가 작성되었습니다. 소중한 리뷰를 작성해 주셔서 감사합니다.',
                            type: Dialog.Type.Information,
                            buttons: [
                                Dialog.createButton('확인', function (_, dialog) {
                                    dialog.hide();
                                    cover.hide();
                                    detail.loadReviews(reviewForm['placeIndex'].value);
                                })
                            ]
                        }).show();
                        break;
                    default:
                        cover.show();
                        Dialog.create({
                            title: '맛집 리뷰',
                            body: '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.',
                            type: Dialog.Type.Error,
                            buttons: [
                                Dialog.createButton('확인', function (_, dialog) {
                                    dialog.hide();
                                    cover.hide();
                                })
                            ]
                        }).show();
                        break;
                }
            }
        });
        return false;
    }

    reviewForm['images'].onchange = function () {
        const imageContainerEl = reviewForm.querySelector(':scope > [data-mz-image-container]');
        const imageEls = Array.from(imageContainerEl.querySelectorAll(':scope > [data-mz-image]'));
        const emptyEl = imageContainerEl.querySelector(':scope > [data-mz-empty]');
        imageEls.forEach(function (imageEl) {
            imageEl.remove();
        });
        if (!reviewForm['images'].files || reviewForm['images'].files.length === 0) {
            emptyEl.show();
            return;
        }
        emptyEl.hide();
        for (const file of reviewForm['images'].files) {
            const imgEl = document.createElement('img');
            imgEl.classList.add('image');
            imgEl.setAttribute('data-mz-image', '');
            imgEl.setAttribute('alt', '');
            imgEl.setAttribute('src', URL.createObjectURL(file));
            imageContainerEl.append(imgEl);
        }
    }
}