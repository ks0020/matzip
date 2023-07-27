package dev.yhpark.matzip.results.user;

import dev.yhpark.matzip.results.Result;

public enum RegisterResult implements Result {
    FAILURE_DUPLICATE_EMAIL,
    FAILURE_DUPLICATE_NICKNAME,
    FAILURE_DUPLICATE_CONTACT
}