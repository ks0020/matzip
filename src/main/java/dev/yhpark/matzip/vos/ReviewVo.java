package dev.yhpark.matzip.vos;

import dev.yhpark.matzip.entities.ReviewEntity;

import java.util.ArrayList;
import java.util.List;

public class ReviewVo extends ReviewEntity {
    private String userNickname;
    private int likeCount;
    private boolean isLiked;
    private boolean isMine;
    private int imageCount;

    public final List<Integer> imageIndexes = new ArrayList<>();

    public String getUserNickname() {
        return userNickname;
    }

    public ReviewVo setUserNickname(String userNickname) {
        this.userNickname = userNickname;
        return this;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public ReviewVo setLikeCount(int likeCount) {
        this.likeCount = likeCount;
        return this;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public ReviewVo setLiked(boolean liked) {
        isLiked = liked;
        return this;
    }

    public boolean isMine() {
        return isMine;
    }

    public ReviewVo setMine(boolean mine) {
        isMine = mine;
        return this;
    }

    public int getImageCount() {
        return imageCount;
    }

    public ReviewVo setImageCount(int imageCount) {
        this.imageCount = imageCount;
        return this;
    }
}