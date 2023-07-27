package dev.yhpark.matzip.results.user;

import dev.yhpark.matzip.results.Result;

public enum LoginResult implements Result {
    FAILURE_NOT_VERIFIED,
    FAILURE_SUSPENDED
}