package dev.yhpark.matzip.entities;

import java.util.Date;
import java.util.Objects;

public class WeatherEntity {
    private int index;
    private Date datetime;
    private int x;
    private int y;
    private int temperature;
    private double precipitation;
    private int humidity;
    private String precipitationType;
    private String skyType;

    public int getIndex() {
        return index;
    }

    public WeatherEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public Date getDatetime() {
        return this.datetime;
    }

    public WeatherEntity setDatetime(Date datetime) {
        this.datetime = datetime;
        return this;
    }

    public int getX() {
        return x;
    }

    public WeatherEntity setX(int x) {
        this.x = x;
        return this;
    }

    public int getY() {
        return y;
    }

    public WeatherEntity setY(int y) {
        this.y = y;
        return this;
    }

    public int getTemperature() {
        return temperature;
    }

    public WeatherEntity setTemperature(int temperature) {
        this.temperature = temperature;
        return this;
    }

    public double getPrecipitation() {
        return precipitation;
    }

    public WeatherEntity setPrecipitation(double precipitation) {
        this.precipitation = precipitation;
        return this;
    }

    public int getHumidity() {
        return humidity;
    }

    public WeatherEntity setHumidity(int humidity) {
        this.humidity = humidity;
        return this;
    }

    public String getPrecipitationType() {
        return precipitationType;
    }

    public WeatherEntity setPrecipitationType(String precipitationType) {
        this.precipitationType = precipitationType;
        return this;
    }

    public String getSkyType() {
        return skyType;
    }

    public WeatherEntity setSkyType(String skyType) {
        this.skyType = skyType;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WeatherEntity that = (WeatherEntity) o;
        return index == that.index;
    }

    @Override
    public int hashCode() {
        return Objects.hash(index);
    }
}