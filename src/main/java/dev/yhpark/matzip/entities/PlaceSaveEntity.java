package dev.yhpark.matzip.entities;

import java.util.Date;
import java.util.Objects;

public class PlaceSaveEntity {
    private int userIndex;
    private int placeIndex;
    private Date createdAt;

    public int getUserIndex() {
        return userIndex;
    }

    public PlaceSaveEntity setUserIndex(int userIndex) {
        this.userIndex = userIndex;
        return this;
    }

    public int getPlaceIndex() {
        return placeIndex;
    }

    public PlaceSaveEntity setPlaceIndex(int placeIndex) {
        this.placeIndex = placeIndex;
        return this;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public PlaceSaveEntity setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlaceSaveEntity that = (PlaceSaveEntity) o;
        return userIndex == that.userIndex && placeIndex == that.placeIndex;
    }

    @Override
    public int hashCode() {
        return Objects.hash(userIndex, placeIndex);
    }
}