package dev.yhpark.matzip.entities;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;
import java.util.Objects;

public class ReviewEntity {
    private int index;
    private int userIndex;
    private int placeIndex;
    private int rating;
    private Date visit;
    private String content;
    private Date writtenAt;
    private boolean isDeleted;

    public int getIndex() {
        return index;
    }

    public ReviewEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public int getUserIndex() {
        return userIndex;
    }

    public ReviewEntity setUserIndex(int userIndex) {
        this.userIndex = userIndex;
        return this;
    }

    public int getPlaceIndex() {
        return placeIndex;
    }

    public ReviewEntity setPlaceIndex(int placeIndex) {
        this.placeIndex = placeIndex;
        return this;
    }

    public int getRating() {
        return rating;
    }

    public ReviewEntity setRating(int rating) {
        this.rating = rating;
        return this;
    }

    public Date getVisit() {
        return visit;
    }

    public ReviewEntity setVisit(Date visit) {
        this.visit = visit;
        return this;
    }

    public String getContent() {
        return content;
    }

    public ReviewEntity setContent(String content) {
        this.content = content;
        return this;
    }

    public Date getWrittenAt() {
        return writtenAt;
    }

    public ReviewEntity setWrittenAt(Date writtenAt) {
        this.writtenAt = writtenAt;
        return this;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public ReviewEntity setDeleted(boolean deleted) {
        isDeleted = deleted;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReviewEntity that = (ReviewEntity) o;
        return index == that.index;
    }

    @Override
    public int hashCode() {
        return Objects.hash(index);
    }
}