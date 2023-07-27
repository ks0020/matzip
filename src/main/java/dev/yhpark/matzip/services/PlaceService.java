package dev.yhpark.matzip.services;

import dev.yhpark.matzip.apis.kms.WeatherForecastApi;
import dev.yhpark.matzip.entities.*;
import dev.yhpark.matzip.exceptions.TransactionalException;
import dev.yhpark.matzip.mappers.PlaceMapper;
import dev.yhpark.matzip.regexes.PlaceRegex;
import dev.yhpark.matzip.results.CommonResult;
import dev.yhpark.matzip.results.Result;
import dev.yhpark.matzip.results.place.GetPlacesResult;
import dev.yhpark.matzip.results.place.PutReviewsResult;
import dev.yhpark.matzip.utils.MapUtil;
import dev.yhpark.matzip.vos.PlaceVo;
import dev.yhpark.matzip.vos.ReviewVo;
import org.apache.commons.lang3.time.DateUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service(value = "dev.yhpark.matzip.services.PlaceService")
public class PlaceService {
    private final PlaceMapper placeMapper;

    @Value("${custom.kms.service-key}")
    private String kmsServiceKey;

    @Autowired
    public PlaceService(PlaceMapper placeMapper) {
        this.placeMapper = placeMapper;
    }

    public Enum<? extends Result> deletePlace(UserEntity user, int index) {
        PlaceEntity place = this.placeMapper.selectPlaceByIndex(index);
        if (place == null) {
            return CommonResult.FAILURE;
        }
        if (place.getUserIndex() != user.getIndex() && !user.isAdmin()) {
            return CommonResult.FAILURE;
        }
        return this.placeMapper.deletePlace(index) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Enum<? extends Result> deleteReview(UserEntity user, int index) {
        ReviewEntity review = this.placeMapper.selectReviewByIndex(index);
        if (review == null) {
            return CommonResult.FAILURE;
        }
        if (user.getIndex() != review.getUserIndex() && !user.isAdmin()) {
            return CommonResult.FAILURE;
        }
        review.setDeleted(true);
        return this.placeMapper.updateReview(review) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Enum<? extends Result> editPlace(UserEntity user, PlaceEntity place) {
        PlaceEntity existingPlace = this.placeMapper.selectPlaceByIndex(place.getIndex());
        if (existingPlace == null) {
            return CommonResult.FAILURE;
        }
        if (existingPlace.getUserIndex() != user.getIndex()) {
            return CommonResult.FAILURE;
        }
        place.setUserIndex(existingPlace.getUserIndex());
        if (place.getThumbnail() == null || place.getThumbnailContentType() == null) {
            place.setThumbnail(existingPlace.getThumbnail())
                    .setThumbnailContentType(existingPlace.getThumbnailContentType());
        }
        return this.placeMapper.updatePlace(place) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public PlaceEntity getPlace(int index) {
        return this.placeMapper.selectPlaceByIndex(index);
    }

    public PlaceVo getPlaceVo(int index, UserEntity user) {
        PlaceVo place = this.placeMapper.selectPlaceVoNoThumbnail(index, user == null ? -1 : user.getIndex());
        ReviewImageEntity[] reviewImages = this.placeMapper.selectReviewImagesByPlaceIndexNoData(index, 4);
        for (ReviewImageEntity reviewImage : reviewImages) {
            place.headImageIndexes.add(reviewImage.getIndex());
        }
        return place;
    }

    public Enum<? extends Result> getPlaces(UserEntity user, List<PlaceVo> placeList, double minLat, double maxLat, double minLng, double maxLng) {
        if (maxLat - minLat > 0.25D || maxLng - minLng > 0.5D) {
            placeList.clear();
            return GetPlacesResult.TOO_MUCH_RANGE;
        }
        PlaceVo[] places = this.placeMapper.selectPlaceVosInCoordsNoThumbnail(
                minLat,
                maxLat,
                minLng,
                maxLng,
                user == null ? -1 : user.getIndex());
        Collections.addAll(placeList, places);
        return placeList.size() > 0
                ? CommonResult.SUCCESS
                : GetPlacesResult.NO_RESULT;
    }

    public ReviewImageEntity getReviewImage(int index) {
        return this.placeMapper.selectReviewImageByIndex(index);
    }

    public ReviewVo[] getReviews(int placeIndex, UserEntity user) {
        int userIndex = user == null ? -1 : user.getIndex();
        ReviewVo[] reviews = this.placeMapper.selectReviewVosByPlaceIndex(placeIndex, userIndex);
        for (ReviewVo review : reviews) {
            ReviewImageEntity[] reviewImages = this.placeMapper.selectReviewImagesByReviewIndexNoData(review.getIndex(), 5);
            for (ReviewImageEntity reviewImage : reviewImages) {
                review.imageIndexes.add(reviewImage.getIndex());
            }
        }
        return reviews;
    }

    public Enum<? extends Result> getSaves(UserEntity user, List<PlaceVo> placeList) {
        PlaceVo[] placeVos = this.placeMapper.selectSavedPlacesByUserIndex(user.getIndex());
        Collections.addAll(placeList, placeVos);
        return CommonResult.SUCCESS;
    }

    @Transactional
    public WeatherEntity[] getWeathers(double latitude, double longitude) {
        Pair<Integer, Integer> grid = MapUtil.coordsToGrid(latitude, longitude);
        Date date = DateUtils.truncate(DateUtils.addHours(new Date(), -1), Calendar.HOUR);
        WeatherEntity[] weathers = this.placeMapper.selectWeathersByDateXY(
                date,
                grid.getLeft(),
                grid.getRight(),
                5);
        if (weathers != null && weathers.length == 5) {
            return weathers;
        }
        weathers = new WeatherForecastApi()
                .setServiceKey(this.kmsServiceKey)
                .setBaseDate(date)
                .setX(grid.getLeft())
                .setY(grid.getRight())
                .request();
        for (WeatherEntity weather : weathers) {
            if (this.placeMapper.insertWeatherKeyUpdate(weather) < 1) {
                throw new TransactionalException();
            }
        }
        return weathers;
    }

    @Transactional
    public Enum<? extends Result> putPlace(PlaceEntity place) {
        if (!PlaceRegex.NAME.matches(place.getName()) ||
                !PlaceRegex.CONTACT.matches(place.getContact()) ||
                !PlaceRegex.ADDRESS_POSTAL.matches(place.getAddressPostal()) ||
                !PlaceRegex.ADDRESS_PRIMARY.matches(place.getAddressPrimary()) ||
                !PlaceRegex.ADDRESS_SECONDARY.matches(place.getAddressSecondary())) {
            return CommonResult.FAILURE;
        }
        return this.placeMapper.insertPlace(place) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    @Transactional
    public Enum<? extends Result> putReviews(ReviewEntity review, ReviewImageEntity[] reviewImages) {
        if (new Date().compareTo(review.getVisit()) < 0) {
            return PutReviewsResult.FAILURE_VISIT_AHEAD;
        }
        review.setWrittenAt(new Date())
                .setDeleted(false);
        if (this.placeMapper.insertReview(review) < 1) {
            return CommonResult.FAILURE;
        }
        for (ReviewImageEntity reviewImage : reviewImages) {
            reviewImage.setReviewIndex(review.getIndex());
            if (this.placeMapper.insertReviewImage(reviewImage) < 1) {
                throw new TransactionalException();
            }
        }
        return CommonResult.SUCCESS;
    }

    public Enum<? extends Result> reportPlace(UserEntity user, int index) {
        PlaceEntity place = this.placeMapper.selectPlaceByIndex(index);
        if (place == null) {
            return CommonResult.FAILURE;
        }
        ReportEntity report = new ReportEntity()
                .setUserIndex(user.getIndex())
                .setTargetType(ReportEntity.TargetType.PLACE.name())
                .setTargetReference(index)
                .setStatus(ReportEntity.Status.SUBMIT.name())
                .setCreatedAt(new Date());
        return this.placeMapper.insertReport(report) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    @Transactional
    public Enum<? extends Result> toggleReviewLike(UserEntity user, ReviewVo review) {
        ReviewLikeEntity reviewLike = this.placeMapper.selectReviewLikeByUserIndexReviewIndex(
                user.getIndex(),
                review.getIndex());
        if (reviewLike == null) {
            reviewLike = new ReviewLikeEntity()
                    .setUserIndex(user.getIndex())
                    .setReviewIndex(review.getIndex())
                    .setLikedAt(new Date());
            if (this.placeMapper.insertReviewLike(reviewLike) < 1) {
                return CommonResult.FAILURE;
            }
        } else {
            if (this.placeMapper.deleteReviewLikeByUserIndexReviewIndex(
                    user.getIndex(),
                    review.getIndex()) < 1) {
                return CommonResult.FAILURE;
            }
        }
        ReviewVo existingReview = this.placeMapper.selectReviewVoByIndex(
                review.getIndex(),
                user.getIndex());
        review.setLiked(existingReview.isLiked())
                .setLikeCount(existingReview.getLikeCount());
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Enum<? extends Result> toggleSave(UserEntity user, PlaceVo place) {
        if (this.placeMapper.selectPlaceVoNoThumbnail(place.getIndex(), user.getIndex()) == null) {
            return CommonResult.FAILURE;
        }
        PlaceSaveEntity placeSave = this.placeMapper.selectPlaceSave(user.getIndex(), place.getIndex());
        if (placeSave == null) {
            placeSave = new PlaceSaveEntity()
                    .setUserIndex(user.getIndex())
                    .setPlaceIndex(place.getIndex())
                    .setCreatedAt(new Date());
            if (this.placeMapper.insertPlaceSave(placeSave) < 1) {
                return CommonResult.FAILURE;
            }
            place.setSaved(true);
        } else {
            if (this.placeMapper.deletePlaceSave(user.getIndex(), place.getIndex()) < 1) {
                return CommonResult.FAILURE;
            }
            place.setSaved(false);
        }
        return CommonResult.SUCCESS;
    }
}