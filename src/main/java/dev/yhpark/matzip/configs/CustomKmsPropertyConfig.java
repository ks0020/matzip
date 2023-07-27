package dev.yhpark.matzip.configs;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "custom.kms")
public class CustomKmsPropertyConfig {
    private String serviceKey;

    public String getServiceKey() {
        return this.serviceKey;
    }

    public void setServiceKey(String serviceKey) {
        this.serviceKey = serviceKey;
    }
}