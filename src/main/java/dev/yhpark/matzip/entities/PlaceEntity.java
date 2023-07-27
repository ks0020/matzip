package dev.yhpark.matzip.entities;

import java.util.Objects;

public class PlaceEntity {
    private int index;
    private int userIndex;
    private String name;
    private String contact;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private double lat;
    private double lng;
    private byte[] thumbnail;
    private String thumbnailContentType;
    private String time;
    private String description;

    public int getIndex() {
        return index;
    }

    public PlaceEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public int getUserIndex() {
        return userIndex;
    }

    public PlaceEntity setUserIndex(int userIndex) {
        this.userIndex = userIndex;
        return this;
    }

    public String getName() {
        return name;
    }

    public PlaceEntity setName(String name) {
        this.name = name;
        return this;
    }

    public String getContact() {
        return contact;
    }

    public PlaceEntity setContact(String contact) {
        this.contact = contact;
        return this;
    }

    public String getAddressPostal() {
        return addressPostal;
    }

    public PlaceEntity setAddressPostal(String addressPostal) {
        this.addressPostal = addressPostal;
        return this;
    }

    public String getAddressPrimary() {
        return addressPrimary;
    }

    public PlaceEntity setAddressPrimary(String addressPrimary) {
        this.addressPrimary = addressPrimary;
        return this;
    }

    public String getAddressSecondary() {
        return addressSecondary;
    }

    public PlaceEntity setAddressSecondary(String addressSecondary) {
        this.addressSecondary = addressSecondary;
        return this;
    }

    public double getLat() {
        return lat;
    }

    public PlaceEntity setLat(double lat) {
        this.lat = lat;
        return this;
    }

    public double getLng() {
        return lng;
    }

    public PlaceEntity setLng(double lng) {
        this.lng = lng;
        return this;
    }

    public byte[] getThumbnail() {
        return thumbnail;
    }

    public PlaceEntity setThumbnail(byte[] thumbnail) {
        this.thumbnail = thumbnail;
        return this;
    }

    public String getThumbnailContentType() {
        return thumbnailContentType;
    }

    public PlaceEntity setThumbnailContentType(String thumbnailContentType) {
        this.thumbnailContentType = thumbnailContentType;
        return this;
    }

    public String getTime() {
        return time;
    }

    public PlaceEntity setTime(String time) {
        this.time = time;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public PlaceEntity setDescription(String description) {
        this.description = description;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlaceEntity that = (PlaceEntity) o;
        return index == that.index;
    }

    @Override
    public int hashCode() {
        return Objects.hash(index);
    }
}