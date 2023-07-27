package dev.yhpark.matzip.entities;

import java.util.Date;
import java.util.Objects;

public class ContactCodeEntity {
    private int index;
    private String contact;
    private String code;
    private String salt;
    private Date createdAt;
    private Date expiresAt;
    private boolean isExpired;
    private String clientIp;
    private String clientUa;

    public int getIndex() {
        return index;
    }

    public ContactCodeEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public String getContact() {
        return contact;
    }

    public ContactCodeEntity setContact(String contact) {
        this.contact = contact;
        return this;
    }

    public String getCode() {
        return code;
    }

    public ContactCodeEntity setCode(String code) {
        this.code = code;
        return this;
    }

    public String getSalt() {
        return salt;
    }

    public ContactCodeEntity setSalt(String salt) {
        this.salt = salt;
        return this;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public ContactCodeEntity setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }

    public ContactCodeEntity setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
        return this;
    }

    public boolean isExpired() {
        return isExpired;
    }

    public ContactCodeEntity setExpired(boolean expired) {
        isExpired = expired;
        return this;
    }

    public String getClientIp() {
        return clientIp;
    }

    public ContactCodeEntity setClientIp(String clientIp) {
        this.clientIp = clientIp;
        return this;
    }

    public String getClientUa() {
        return clientUa;
    }

    public ContactCodeEntity setClientUa(String clientUa) {
        this.clientUa = clientUa;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ContactCodeEntity that = (ContactCodeEntity) o;
        return index == that.index;
    }

    @Override
    public int hashCode() {
        return Objects.hash(index);
    }
}