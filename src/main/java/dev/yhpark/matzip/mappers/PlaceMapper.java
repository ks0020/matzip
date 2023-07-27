package dev.yhpark.matzip.mappers;

import dev.yhpark.matzip.entities.*;
import dev.yhpark.matzip.vos.PlaceVo;
import dev.yhpark.matzip.vos.ReviewVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;

@Mapper
public interface PlaceMapper {
    int deletePlace(@Param(value = "index") int index);

    int deletePlaceSave(@Param(value = "userIndex") int userIndex,
                        @Param(value = "placeIndex") int placeIndex);

    int deleteReviewLikeByUserIndexReviewIndex(@Param(value = "userIndex") int userIndex,
                                               @Param(value = "reviewIndex") int reviewIndex);

    int insertPlace(PlaceEntity place);

    int insertPlaceSave(PlaceSaveEntity placeSave);

    int insertReport(ReportEntity report);

    int insertReview(ReviewEntity review);

    int insertReviewImage(ReviewImageEntity reviewImage);

    int insertReviewLike(ReviewLikeEntity reviewLike);

    int insertWeatherKeyUpdate(WeatherEntity weather);

    PlaceEntity selectPlaceByIndex(@Param(value = "index") int index);

    PlaceVo selectPlaceVoNoThumbnail(@Param(value = "index") int index,
                                     @Param(value = "userIndex") int userIndex);

    PlaceVo[] selectPlaceVosInCoordsNoThumbnail(@Param(value = "minLat") double minLat,
                                                @Param(value = "maxLat") double maxLat,
                                                @Param(value = "minLng") double minLng,
                                                @Param(value = "maxLng") double maxLng,
                                                @Param(value = "userIndex") int userIndex);

    PlaceSaveEntity selectPlaceSave(@Param(value = "userIndex") int userIndex,
                                    @Param(value = "placeIndex") int placeIndex);

    PlaceVo[] selectSavedPlacesByUserIndex(@Param(value = "userIndex") int userIndex);

    ReviewEntity selectReviewByIndex(@Param(value = "index") int index);

    ReviewVo selectReviewVoByIndex(@Param(value = "index") int index,
                                   @Param(value = "userIndex") int userIndex);

    ReviewVo[] selectReviewVosByPlaceIndex(@Param(value = "placeIndex") int placeIndex,
                                           @Param(value = "userIndex") int userIndex);

    ReviewImageEntity selectReviewImageByIndex(@Param(value = "index") int index);

    ReviewImageEntity[] selectReviewImagesByPlaceIndexNoData(@Param(value = "placeIndex") int reviewIndex,
                                                             @Param(value = "limit") int limit);

    ReviewImageEntity[] selectReviewImagesByReviewIndexNoData(@Param(value = "reviewIndex") int reviewIndex,
                                                              @Param(value = "limit") int limit);

    ReviewLikeEntity selectReviewLikeByUserIndexReviewIndex(@Param(value = "userIndex") int userIndex,
                                                            @Param(value = "reviewIndex") int reviewIndex);

    WeatherEntity[] selectWeathersByDateXY(@Param(value = "fromDate") Date fromDate,
                                           @Param(value = "x") int x,
                                           @Param(value = "y") int y,
                                           @Param(value = "limit") int limit);

    int updatePlace(PlaceEntity place);

    int updateReview(ReviewEntity review);
}