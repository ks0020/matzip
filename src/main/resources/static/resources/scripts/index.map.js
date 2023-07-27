const map = document.getElementById('map');

map.markers = [];

map.initialize = function () {
    let lat = parseFloat(localStorage.getItem('map.last_lat'));
    let lng = parseFloat(localStorage.getItem('map.last_lng'));
    if (!lat || isNaN(lat) || lat < 33.06 || lat > 38.16) lat = undefined;
    if (!lng || isNaN(lng) || lng < 124.11 || lng > 131.52) lng = undefined;
    if (!lat || !lng) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                map.instantiate(position.coords.latitude, position.coords.longitude);
            });
        } else {
            lat = 35.8655753;
            lng = 128.59339;
        }
    }
    map.instantiate(lat, lng);
}

map.instantiate = function (lat, lng) {
    let level = parseInt(localStorage.getItem('map.last_lvl'));
    if (!level || isNaN(level) || level < 1 || level > 5) level = undefined;
    if (!level) level = 3;
    map.object = new kakao.maps.Map(map, {
        center: new kakao.maps.LatLng(lat, lng),
        level: level
    });
    map.geocoder = new kakao.maps.services.Geocoder();
    map.onmove();
    kakao.maps.event.addListener(map.object, 'dragend', map.onmove);
    kakao.maps.event.addListener(map.object, 'zoom_changed', map.onmove);
}

map.onmove = function () {
    const mapCenter = map.object.getCenter();
    localStorage.setItem('map.last_lat', mapCenter.getLat());
    localStorage.setItem('map.last_lng', mapCenter.getLng());
    localStorage.setItem('map.last_lvl', map.object.getLevel());

    map.geocoder.coord2Address(mapCenter.getLng(), mapCenter.getLat(), function (result, status) {
        if (status !== kakao.maps.services.Status.OK || result.length < 1) {
            return;
        }
        place.querySelector('[data-mz-address="s"]').innerText = result[0]['address']['region_1depth_name'];
        place.querySelector('[data-mz-address="g"]').innerText = result[0]['address']['region_2depth_name'];
        place.querySelector('[data-mz-address="d"]').innerText = result[0]['address']['region_3depth_name'];
        save.querySelector('[data-mz-address="s"]').innerText = result[0]['address']['region_1depth_name'];
        save.querySelector('[data-mz-address="g"]').innerText = result[0]['address']['region_2depth_name'];
        save.querySelector('[data-mz-address="d"]').innerText = result[0]['address']['region_3depth_name'];

        if (result[0]['road_address']) {
            placeAddForm['addressPostal'].value = result[0]['road_address']['zone_no'];
            placeAddForm['addressPrimary'].value = result[0]['road_address']['address_name'];
            placeEditForm['addressPostal'].value = result[0]['road_address']['zone_no'];
            placeEditForm['addressPrimary'].value = result[0]['road_address']['address_name'];
        }
    });

    placeAddForm['lat'].value = mapCenter.getLat();
    placeAddForm['lng'].value = mapCenter.getLng();
    placeEditForm['lat'].value = mapCenter.getLat();
    placeEditForm['lng'].value = mapCenter.getLng();

    place.load();

    Weather.update();
}