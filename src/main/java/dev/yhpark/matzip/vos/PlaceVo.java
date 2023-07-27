package dev.yhpark.matzip.vos;

import dev.yhpark.matzip.entities.PlaceEntity;

import java.util.ArrayList;
import java.util.List;

public class PlaceVo extends PlaceEntity {
    private int ratingCount;
    private double ratingAverage;
    private boolean isMine;
    private boolean isSaved;
    private int imageCount;

    public final List<Integer> headImageIndexes = new ArrayList<>();

    public int getRatingCount() {
        return ratingCount;
    }

    public PlaceVo setRatingCount(int ratingCount) {
        this.ratingCount = ratingCount;
        return this;
    }

    public double getRatingAverage() {
        return ratingAverage;
    }

    public PlaceVo setRatingAverage(double ratingAverage) {
        this.ratingAverage = ratingAverage;
        return this;
    }

    public boolean isMine() {
        return isMine;
    }

    public PlaceVo setMine(boolean mine) {
        isMine = mine;
        return this;
    }

    public boolean isSaved() {
        return isSaved;
    }

    public PlaceVo setSaved(boolean saved) {
        isSaved = saved;
        return this;
    }

    public int getImageCount() {
        return imageCount;
    }

    public PlaceVo setImageCount(int imageCount) {
        this.imageCount = imageCount;
        return this;
    }
}