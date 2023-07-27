package dev.yhpark.matzip.entities;

import java.util.Date;
import java.util.Objects;

public class ReportEntity {
    public enum TargetType {
        PLACE,
        REVIEW
    }

    public enum Status {
        DONE_ADOPT,
        DONE_DENY,
        SUBMIT
    }

    private int index;
    private int userIndex;
    private String targetType;
    private int targetReference;
    private String status;
    private Date createdAt;

    public int getIndex() {
        return index;
    }

    public ReportEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public int getUserIndex() {
        return userIndex;
    }

    public ReportEntity setUserIndex(int userIndex) {
        this.userIndex = userIndex;
        return this;
    }

    public String getTargetType() {
        return targetType;
    }

    public ReportEntity setTargetType(String targetType) {
        this.targetType = targetType;
        return this;
    }

    public int getTargetReference() {
        return targetReference;
    }

    public ReportEntity setTargetReference(int targetReference) {
        this.targetReference = targetReference;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public ReportEntity setStatus(String status) {
        this.status = status;
        return this;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public ReportEntity setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReportEntity that = (ReportEntity) o;
        return index == that.index;
    }

    @Override
    public int hashCode() {
        return Objects.hash(index);
    }
}