package dev.yhpark.matzip.entities;

import java.util.Date;
import java.util.Objects;

public class ReviewLikeEntity {
    private int userIndex;
    private int reviewIndex;
    private Date likedAt;

    public int getUserIndex() {
        return userIndex;
    }

    public ReviewLikeEntity setUserIndex(int userIndex) {
        this.userIndex = userIndex;
        return this;
    }

    public int getReviewIndex() {
        return reviewIndex;
    }

    public ReviewLikeEntity setReviewIndex(int reviewIndex) {
        this.reviewIndex = reviewIndex;
        return this;
    }

    public Date getLikedAt() {
        return likedAt;
    }

    public ReviewLikeEntity setLikedAt(Date likedAt) {
        this.likedAt = likedAt;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReviewLikeEntity that = (ReviewLikeEntity) o;
        return userIndex == that.userIndex && reviewIndex == that.reviewIndex;
    }

    @Override
    public int hashCode() {
        return Objects.hash(userIndex, reviewIndex);
    }
}