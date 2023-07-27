const Weather = {
    LastLat: undefined,
    LastLng: undefined,
    update: function () {
        const mapCenter = map.object.getCenter();
        if (Weather.LastLat && Weather.LastLng) {
            if (Math.abs(mapCenter.getLat() - Weather.LastLat) < 0.05 &&
                Math.abs(mapCenter.getLng() - Weather.LastLng) < 0.05) {
                return;
            }
        }
        const weatherEls = document.body.querySelectorAll('[data-mz-weather]');
        weatherEls.forEach(function (weatherEl) {
            weatherEl.setAttribute('data-mz-weather', 'loading');
        });
        Ajax.request({
            method: Ajax.Method.Get,
            url: `/place/weather?lat=${mapCenter.getLat()}&lng=${mapCenter.getLng()}`,
            ondone: function () {
                weatherEls.forEach(function (weatherEl) {
                    weatherEl.setAttribute('data-mz-weather', '');
                });
            },
            ondonebad: function () {

            },
            ondonegood: function (_, responseText) {
                const responseArray = JSON.parse(responseText).sort(function (a, b) {
                    return new Date(a['datetime']) - new Date(b['datetime']);
                });
                Weather.LastLat = mapCenter.getLat();
                Weather.LastLng = mapCenter.getLng();
                weatherEls.forEach(function (weatherEl) {
                    const itemEls = weatherEl.querySelectorAll(':scope > [data-mz-item]');
                    itemEls.forEach(function (itemEl) {
                        itemEl.remove();
                    });
                    let added = 0;
                    for (const weatherObject of responseArray) {
                        const weatherDiv = document.createElement('div');
                        const iconImg = document.createElement('img');
                        const hourSpan = document.createElement('span');
                        const temperatureSpan = document.createElement('span');
                        const humiditySpan = document.createElement('span');
                        const precipitationSpan = document.createElement('span');
                        let iconSrc = '/resources/images/';
                        switch (weatherObject['precipitationType']) {
                            case 'RAIN':
                            case 'RAIN_SNOW':
                                iconSrc += 'index.weather.rain.png';
                                break;
                            case 'RAIN_WEAK':
                            case 'RAIN_SNOW_WEAK':
                                iconSrc += 'index.weather.rain-weak.png';
                                break;
                            case 'SNOW':
                                iconSrc += 'index.weather.snow.png';
                                break;
                            case 'SNOW_WEAK':
                                iconSrc += 'index.weather.snow-weak.png';
                                break;
                            case 'NONE':
                            default:
                                switch (weatherObject['skyType']) {
                                    case 'CLOUDY':
                                        iconSrc += 'index.weather.cloudy.png';
                                        break;
                                    case 'MOSTLY_CLOUDY':
                                        iconSrc += 'index.weather.mostly-cloudy.png';
                                        break;
                                    case 'CLEAR':
                                    default:
                                        iconSrc += 'index.weather.clear.png';
                                }
                        }
                        iconImg.classList.add('icon');
                        iconImg.setAttribute('alt', '');
                        iconImg.setAttribute('src', iconSrc);
                        hourSpan.classList.add('hour');
                        hourSpan.innerText = weatherObject['datetime'].split('T')[1].substring(0, 5);
                        temperatureSpan.classList.add('temperature');
                        temperatureSpan.innerText = `${weatherObject['temperature']}℃`;
                        if (weatherObject['temperature'] > 27) {
                            weatherDiv.classList.add('hot');
                        } else if (weatherObject['temperature'] < 0) {
                            weatherDiv.classList.add('cold');
                        }
                        humiditySpan.classList.add('humidity');
                        humiditySpan.innerText = `${weatherObject['humidity']}%`;
                        humiditySpan.style.opacity = `${(Math.log(weatherObject['humidity']) - 1) * 100}%`;
                        precipitationSpan.classList.add('precipitation');
                        precipitationSpan.innerText = weatherObject['precipitation'] === 0 ? '-' : `${weatherObject['precipitation']}mm`;
                        weatherDiv.classList.add('weather');
                        weatherDiv.dataset.mzItem = '';
                        weatherDiv.append(iconImg, hourSpan, temperatureSpan, humiditySpan, precipitationSpan);
                        weatherEl.append(weatherDiv);
                        if (++added >= 5) {
                            return;
                        }
                    }
                    weatherEl.setAttribute('data-mz-weather', '');
                });
            }
        });
    }
};

map.initialize();