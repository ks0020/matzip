package dev.yhpark.matzip.controllers;

import dev.yhpark.matzip.entities.*;
import dev.yhpark.matzip.exceptions.TransactionalException;
import dev.yhpark.matzip.results.CommonResult;
import dev.yhpark.matzip.results.Result;
import dev.yhpark.matzip.services.PlaceService;
import dev.yhpark.matzip.vos.PlaceVo;
import dev.yhpark.matzip.vos.ReviewVo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

@Controller(value = "dev.yhpark.matzip.controllers.PlaceController")
@RequestMapping(value = "/place")
public class PlaceController {
    private final PlaceService placeService;

    @Autowired
    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @RequestMapping(value = "place",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deletePlace(@SessionAttribute(value = "user") UserEntity user,
                              @RequestParam(value = "index") int index) throws InterruptedException {
        Thread.sleep(1000);
        Enum<? extends Result> result = this.placeService.deletePlace(user, index);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "place",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public PlaceVo getPlace(@SessionAttribute(value = "user", required = false) UserEntity user,
                            @RequestParam(value = "index") int index) {
        PlaceVo place = this.placeService.getPlaceVo(index, user);
        place.setMine(user != null && place.getUserIndex() == user.getIndex());
        return place;
    }

    @RequestMapping(value = "place",
            method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchPlace(@SessionAttribute(value = "user") UserEntity user,
                             @RequestParam(value = "thumbnailMultipart", required = false) MultipartFile thumbnailMultipart,
                             PlaceEntity place) throws InterruptedException, IOException {
        Thread.sleep(500);
        if (thumbnailMultipart != null && !thumbnailMultipart.isEmpty()) {
            place.setThumbnail(thumbnailMultipart.getBytes())
                    .setThumbnailContentType(thumbnailMultipart.getContentType());
        }
        Enum<? extends Result> result = this.placeService.editPlace(user, place);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "place",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPlace(@SessionAttribute(value = "user") UserEntity user,
                            @RequestParam(value = "thumbnailMultipart") MultipartFile thumbnailMultipart,
                            PlaceEntity place) throws IOException, InterruptedException {
        Thread.sleep(500);
        place.setUserIndex(user.getIndex())
                .setThumbnail(thumbnailMultipart.getBytes())
                .setThumbnailContentType(thumbnailMultipart.getContentType());
        Enum<? extends Result> result = this.placeService.putPlace(place);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("index", place.getIndex());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "places",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getPlaces(@SessionAttribute(value = "user", required = false) UserEntity user,
                            @RequestParam(value = "minLat") double minLat,
                            @RequestParam(value = "maxLat") double maxLat,
                            @RequestParam(value = "minLng") double minLng,
                            @RequestParam(value = "maxLng") double maxLng) {
        List<PlaceVo> placeList = new ArrayList<>();
        Enum<? extends Result> result = this.placeService.getPlaces(user, placeList, minLat, maxLat, minLng, maxLng);
        JSONObject responseObject = new JSONObject();
        JSONArray placesArray = new JSONArray(placeList);
        responseObject.put("result", result.name().toLowerCase());
        responseObject.put("places", placesArray);
        return responseObject.toString();
    }

    @RequestMapping(value = "report",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postReport(@SessionAttribute(value = "user") UserEntity user,
                             @RequestParam(value = "index") int index) throws InterruptedException {
        Thread.sleep(1000);
        Enum<? extends Result> result = this.placeService.reportPlace(user, index);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "review",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteReview(@SessionAttribute(value = "user") UserEntity user,
                               @RequestParam(value = "index") int index) {
        Enum<? extends Result> result = this.placeService.deleteReview(user, index);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "review",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postReview(@SessionAttribute(value = "user") UserEntity user,
                             @RequestParam(value = "visitStr") String visitStr,
                             @RequestParam(value = "imageMultiparts", required = false) MultipartFile[] imageMultiparts,
                             ReviewEntity review)
            throws InterruptedException, IOException, ParseException {
        Thread.sleep(750);
        ReviewImageEntity[] reviewImages;
        if (imageMultiparts == null) {
            reviewImages = new ReviewImageEntity[0];
        } else {
            reviewImages = new ReviewImageEntity[imageMultiparts.length];
            for (int i = 0; i < imageMultiparts.length; i++) {
                reviewImages[i] = new ReviewImageEntity()
                        .setData(imageMultiparts[i].getBytes())
                        .setDataType(imageMultiparts[i].getContentType());
            }
        }
        review.setVisit(new SimpleDateFormat("yyyy-MM-dd").parse(visitStr))
                .setUserIndex(user.getIndex());
        Enum<? extends Result> result;
        try {
            result = this.placeService.putReviews(review, reviewImages);
        } catch (TransactionalException ignored) {
            result = CommonResult.FAILURE;
        }
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "reviews",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ReviewVo[] getReviews(@SessionAttribute(value = "user", required = false) UserEntity user,
                                 @RequestParam(value = "placeIndex") int placeIndex) {
        ReviewVo[] reviews = this.placeService.getReviews(placeIndex, user);
        if (user != null) {
            for (ReviewVo review : reviews) {
                review.setMine(review.getUserIndex() == user.getIndex());
            }
        }
        return reviews;
    }

    @RequestMapping(value = "review-image/{index}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<byte[]> getReviewImage(@PathVariable(value = "index") int index) {
        ReviewImageEntity reviewImage = this.placeService.getReviewImage(index);
        ResponseEntity<byte[]> response;
        if (reviewImage == null) {
            response = new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentLength(reviewImage.getData().length);
            headers.setContentType(MediaType.parseMediaType(reviewImage.getDataType()));
            response = new ResponseEntity<>(reviewImage.getData(), headers, HttpStatus.OK);
        }
        return response;
    }

    @RequestMapping(value = "review-like",
            method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchReviewLike(@SessionAttribute(value = "user") UserEntity user,
                                  ReviewVo review) {
        Enum<? extends Result> result = this.placeService.toggleReviewLike(user, review);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("liked", review.isLiked());
            responseObject.put("likeCount", review.getLikeCount());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "save",
            method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchSave(@SessionAttribute(value = "user") UserEntity user,
                            PlaceVo place) {
        Enum<? extends Result> result = this.placeService.toggleSave(user, place);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("saved", place.isSaved());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "saves",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getSaves(@SessionAttribute(value = "user") UserEntity user) {
        List<PlaceVo> placeList = new ArrayList<>();
        Enum<? extends Result> result = this.placeService.getSaves(user, placeList);
        JSONObject responseObject = new JSONObject();
        JSONArray placesArray = new JSONArray(placeList);
        responseObject.put("result", result.name().toLowerCase());
        responseObject.put("saves", placesArray);
        return responseObject.toString();
    }

    @RequestMapping(value = "thumbnail/{index}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<byte[]> getThumbnail(@PathVariable(value = "index") int index) {
        PlaceEntity place = this.placeService.getPlace(index);
        ResponseEntity<byte[]> response;
        if (place == null) {
            response = new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentLength(place.getThumbnail().length);
            headers.setContentType(MediaType.parseMediaType(place.getThumbnailContentType()));
            response = new ResponseEntity<>(place.getThumbnail(), headers, HttpStatus.OK);
        }
        return response;
    }

    @RequestMapping(value = "weather",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public WeatherEntity[] getWeather(@RequestParam(value = "lat") double latitude,
                                      @RequestParam(value = "lng") double longitude) {
        WeatherEntity[] weathers;
        try {
            weathers = this.placeService.getWeathers(latitude, longitude);
        } catch (TransactionalException ignored) {
            weathers = null;
        }
        return weathers;
    }
}