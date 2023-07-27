package dev.yhpark.matzip;

import dev.yhpark.matzip.configs.CustomKakaoPropertyConfig;
import dev.yhpark.matzip.configs.CustomKmsPropertyConfig;
import dev.yhpark.matzip.configs.CustomNCloudPropertyConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        CustomNCloudPropertyConfig.class,
        CustomKakaoPropertyConfig.class,
        CustomKmsPropertyConfig.class})
public class MatzipApplication {
    public static void main(String[] args) {
        SpringApplication.run(MatzipApplication.class, args);
    }
}