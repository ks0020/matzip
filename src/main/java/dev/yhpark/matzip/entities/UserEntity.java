package dev.yhpark.matzip.entities;

import java.util.Date;
import java.util.Objects;

public class UserEntity {
    private int index;
    private String email;
    private String password;
    private String nickname;
    private String name;
    private String contact;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private Date registeredAt;
    private boolean isVerified;
    private boolean isSuspended;
    private boolean isDeleted;
    private boolean isAdmin;

    public int getIndex() {
        return index;
    }

    public UserEntity setIndex(int index) {
        this.index = index;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public UserEntity setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public UserEntity setPassword(String password) {
        this.password = password;
        return this;
    }

    public String getNickname() {
        return nickname;
    }

    public UserEntity setNickname(String nickname) {
        this.nickname = nickname;
        return this;
    }

    public String getName() {
        return name;
    }

    public UserEntity setName(String name) {
        this.name = name;
        return this;
    }

    public String getContact() {
        return contact;
    }

    public UserEntity setContact(String contact) {
        this.contact = contact;
        return this;
    }

    public String getAddressPostal() {
        return addressPostal;
    }

    public UserEntity setAddressPostal(String addressPostal) {
        this.addressPostal = addressPostal;
        return this;
    }

    public String getAddressPrimary() {
        return addressPrimary;
    }

    public UserEntity setAddressPrimary(String addressPrimary) {
        this.addressPrimary = addressPrimary;
        return this;
    }

    public String getAddressSecondary() {
        return addressSecondary;
    }

    public UserEntity setAddressSecondary(String addressSecondary) {
        this.addressSecondary = addressSecondary;
        return this;
    }

    public Date getRegisteredAt() {
        return registeredAt;
    }

    public UserEntity setRegisteredAt(Date registeredAt) {
        this.registeredAt = registeredAt;
        return this;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public UserEntity setVerified(boolean verified) {
        isVerified = verified;
        return this;
    }

    public boolean isSuspended() {
        return isSuspended;
    }

    public UserEntity setSuspended(boolean suspended) {
        isSuspended = suspended;
        return this;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public UserEntity setDeleted(boolean deleted) {
        isDeleted = deleted;
        return this;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public UserEntity setAdmin(boolean admin) {
        isAdmin = admin;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserEntity that = (UserEntity) o;
        return index == that.index;
    }

    @Override
    public int hashCode() {
        return Objects.hash(index);
    }
}