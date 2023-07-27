TODO 아래 절차에 따라 스키마, 테이블 생성 후 설정 완료할 것

1. 아래 쿼리 실행해서 스키마, 테이블 생성할 것.
CREATE SCHEMA `matzip_new`;

CREATE TABLE `matzip_new`.`users`
(
    `index`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email`             VARCHAR(50)  NOT NULL,
    `password`          VARCHAR(128) NOT NULL,
    `nickname`          VARCHAR(10)  NOT NULL,
    `name`              VARCHAR(5)   NOT NULL,
    `contact`           VARCHAR(12)  NOT NULL,
    `address_postal`    VARCHAR(5)   NOT NULL,
    `address_primary`   VARCHAR(100) NOT NULL,
    `address_secondary` VARCHAR(100) NOT NULL,
    `registered_at`     DATETIME     NOT NULL DEFAULT NOW(),
    `verified_flag`     BOOLEAN      NOT NULL DEFAULT FALSE,
    `suspended_flag`    BOOLEAN      NOT NULL DEFAULT FALSE,
    `deleted_flag`      BOOLEAN      NOT NULL DEFAULT FALSE,
    `admin_flag`        BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT UNIQUE (`email`),
    CONSTRAINT UNIQUE (`nickname`),
    CONSTRAINT CHECK (`email` REGEXP '^(?=.{8,50}$)([\\da-zA-Z][\\da-zA-Z\\-_.]+[\\da-zA-Z])@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$'),
    CONSTRAINT CHECK (`password` REGEXP '^([\\da-f]{128})$'),
    CONSTRAINT CHECK (`nickname` REGEXP '^([a-zA-Z가-힣]{2,10})$'),
    CONSTRAINT CHECK (`name` REGEXP '^([가-힣]{2,5})$'),
    CONSTRAINT CHECK (`contact` REGEXP '^(010[\\d]{8})$'),
    CONSTRAINT CHECK (`address_postal` REGEXP '^([\\d]{5})$'),
    CONSTRAINT CHECK (`address_primary` REGEXP '^(?=.{8,100}$)([\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$'),
    CONSTRAINT CHECK (`address_secondary` REGEXP '^(?=.{0,100}$)(.{0}|[\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$')
);

CREATE TABLE `matzip_new`.`contact_codes`
(
    `index`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `contact`      VARCHAR(12)  NOT NULL,
    `code`         VARCHAR(6)   NOT NULL,
    `salt`         VARCHAR(128) NOT NULL,
    `created_at`   DATETIME     NOT NULL DEFAULT NOW(),
    `expires_at`   DATETIME     NOT NULL,
    `expired_flag` BOOLEAN      NOT NULL DEFAULT FALSE,
    `client_ip`    VARCHAR(50)  NOT NULL,
    `client_ua`    VARCHAR(500) NOT NULL,
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT CHECK (`contact` REGEXP '^(010[\\d]{8})$'),
    CONSTRAINT CHECK (`code` REGEXP '^([\\d]{6})$'),
    CONSTRAINT CHECK (`salt` REGEXP '^([\\da-f]{128})$'),
    CONSTRAINT CHECK (`created_at` < `expires_at`)
);

CREATE TABLE `matzip_new`.`email_codes`
(
    `index`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email`        VARCHAR(50)  NOT NULL,
    `code`         VARCHAR(32)  NOT NULL,
    `salt`         VARCHAR(128) NOT NULL,
    `created_at`   DATETIME     NOT NULL DEFAULT NOW(),
    `expires_at`   DATETIME     NOT NULL,
    `expired_flag` BOOLEAN      NOT NULL DEFAULT FALSE,
    `client_ip`    VARCHAR(50)  NOT NULL,
    `client_ua`    VARCHAR(500) NOT NULL,
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT FOREIGN KEY (`email`) REFERENCES `matzip_new`.`users` (`email`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CHECK (`code` REGEXP '^([\\da-zA-Z]{32})$'),
    CONSTRAINT CHECK (`salt` REGEXP '^([\\da-f]{128})$'),
    CONSTRAINT CHECK (`created_at` < `expires_at`)
);

CREATE TABLE `matzip_new`.`weathers`
(
    `index`              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `datetime`           DATETIME         NOT NULL,
    `x`                  TINYINT UNSIGNED NOT NULL,
    `y`                  TINYINT UNSIGNED NOT NULL,
    `temperature`        TINYINT UNSIGNED NOT NULL COMMENT 'IN CELSIUS',
    `precipitation`      TINYINT UNSIGNED NOT NULL,
    `humidity`           TINYINT UNSIGNED NOT NULL,
    `precipitation_type` VARCHAR(10)      NOT NULL,
    `sky_type`           VARCHAR(10)      NOT NULL,
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT UNIQUE (`datetime`, `x`, `y`),
    CONSTRAINT CHECK (`temperature` BETWEEN -100 AND 100),
    CONSTRAINT CHECK (`precipitation` BETWEEN 0 AND 500),
    CONSTRAINT CHECK (`humidity` BETWEEN 0 AND 100),
    CONSTRAINT CHECK (`precipitation_type` IN ('NONE', 'RAIN', 'RAIN_SNOW', 'RAIN_SNOW_WEAK', 'RAIN_WEAK', 'SNOW', 'SNOW_WEAK')),
    CONSTRAINT CHECK (`sky_type` IN ('CLEAR', 'CLOUDY', 'MOSTLY_CLOUDY'))
);

CREATE TABLE `matzip_new`.`places`
(
    `index`                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `user_index`             INT UNSIGNED    NOT NULL,
    `name`                   VARCHAR(25)     NOT NULL,
    `contact`                VARCHAR(12)     NOT NULL,
    `address_postal`         VARCHAR(5)      NOT NULL,
    `address_primary`        VARCHAR(100)    NOT NULL,
    `address_secondary`      VARCHAR(100)    NOT NULL,
    `lat`                    DOUBLE UNSIGNED NOT NULL,
    `lng`                    DOUBLE UNSIGNED NOT NULL,
    `thumbnail`              LONGBLOB        NOT NULL,
    `thumbnail_content_type` VARCHAR(50)     NOT NULL,
    `time`                   JSON            NOT NULL,
    `description`            VARCHAR(1000)   NOT NULL,
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT FOREIGN KEY (`user_index`) REFERENCES `matzip_new`.`users` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CHECK (`name` REGEXP '^([\\da-zA-Z가-힣][\\da-zA-Z가-힣 ]{0,23}[\\da-zA-Z가-힣])$'),
    CONSTRAINT CHECK (`contact` REGEXP '^(\\d{10,12})$'),
    CONSTRAINT CHECK (`address_postal` REGEXP '^([\\d]{5})$'),
    CONSTRAINT CHECK (`address_primary` REGEXP '^(?=.{8,100}$)([\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$'),
    CONSTRAINT CHECK (`address_secondary` REGEXP '^(?=.{0,100}$)(.{0}|[\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$')
);

CREATE TABLE `matzip_new`.`reviews`
(
    `index`        INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_index`   INT UNSIGNED     NOT NULL,
    `place_index`  INT UNSIGNED     NOT NULL,
    `rating`       TINYINT UNSIGNED NOT NULL,
    `visit`        DATE             NOT NULL,
    `content`      VARCHAR(1000)    NOT NULL,
    `written_at`   DATETIME         NOT NULL DEFAULT NOW(),
    `deleted_flag` BOOLEAN          NOT NULL DEFAULT FALSE,
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT FOREIGN KEY (`user_index`) REFERENCES `matzip_new`.`users` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (`place_index`) REFERENCES `matzip_new`.`places` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CHECK (`rating` BETWEEN 1 AND 5)
);

CREATE TABLE `matzip_new`.`review_images`
(
    `index`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `review_index` INT UNSIGNED NOT NULL,
    `data`         LONGBLOB     NOT NULL,
    `data_type`    VARCHAR(50)  NOT NULL,
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT FOREIGN KEY (`review_index`) REFERENCES `matzip_new`.`reviews` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE `matzip_new`.`review_likes`
(
    `user_index`   INT UNSIGNED NOT NULL,
    `review_index` INT UNSIGNED NOT NULL,
    `liked_at`     DATETIME     NOT NULL DEFAULT NOW(),
    CONSTRAINT PRIMARY KEY (`user_index`, `review_index`),
    CONSTRAINT FOREIGN KEY (`user_index`) REFERENCES `matzip_new`.`users` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (`review_index`) REFERENCES `matzip_new`.`reviews` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE `matzip_new`.`place_saves`
(
    `user_index`  INT UNSIGNED NOT NULL,
    `place_index` INT UNSIGNED NOT NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT NOW(),
    CONSTRAINT PRIMARY KEY (`user_index`, `place_index`),
    CONSTRAINT FOREIGN KEY (`user_index`) REFERENCES `matzip_new`.`users` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FOREIGN KEY (`place_index`) REFERENCES `matzip_new`.`places` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE `matzip_new`.`reports`
(
    `index`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_index`       INT UNSIGNED NOT NULL,
    `target_type`      VARCHAR(10)  NOT NULL,
    `target_reference` INT UNSIGNED NOT NULL,
    `status`           VARCHAR(10)  NOT NULL,
    `created_at`       DATETIME     NOT NULL DEFAULT NOW(),
    CONSTRAINT PRIMARY KEY (`index`),
    CONSTRAINT FOREIGN KEY (`user_index`) REFERENCES `matzip_new`.`users` (`index`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CHECK (`target_type` IN ('PLACE', 'REVIEW')),
    CONSTRAINT CHECK (`status` IN ('SUBMIT', 'DONE_ADOPT', 'DONE_DENY'))
);

2. 'application.properties' 열어서 설정 변경할 것.