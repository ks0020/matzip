package dev.yhpark.matzip.apis.kms;

import dev.yhpark.matzip.entities.WeatherEntity;
import org.apache.commons.lang3.NotImplementedException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class WeatherForecastApi {
    private static final SimpleDateFormat BASE_DATE_FORMAT = new SimpleDateFormat("yyyyMMdd");
    private static final SimpleDateFormat BASE_TIME_FORMAT = new SimpleDateFormat("HHmm");

    public enum DataType {
        JSON("JSON"),
        XML("XML");

        public final String value;

        DataType(String value) {
            this.value = value;
        }
    }

    private String serviceKey;
    private int pageNo = 1;
    private int numOfRows = 100;
    private DataType dataType = DataType.JSON;
    private Date baseDate;
    private int x;
    private int y;

    public String getServiceKey() {
        return this.serviceKey;
    }

    public WeatherForecastApi setServiceKey(String serviceKey) {
        this.serviceKey = serviceKey;
        return this;
    }

    public int getPageNo() {
        return this.pageNo;
    }

    public WeatherForecastApi setPageNo(int pageNo) {
        this.pageNo = pageNo;
        return this;
    }

    public int getNumOfRows() {
        return this.numOfRows;
    }

    public WeatherForecastApi setNumOfRows(int numOfRows) {
        this.numOfRows = numOfRows;
        return this;
    }

    public DataType getDataType() {
        return this.dataType;
    }

    public WeatherForecastApi setDataType(DataType dataType) {
        this.dataType = dataType;
        return this;
    }

    public Date getBaseDate() {
        return this.baseDate;
    }

    public WeatherForecastApi setBaseDate(Date baseDate) {
        this.baseDate = baseDate;
        return this;
    }

    public int getX() {
        return this.x;
    }

    public WeatherForecastApi setX(int x) {
        this.x = x;
        return this;
    }

    public int getY() {
        return this.y;
    }

    public WeatherForecastApi setY(int y) {
        this.y = y;
        return this;
    }

    public WeatherEntity[] request() {
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst")
                .append("?ServiceKey=").append(this.getServiceKey())
                .append("&pageNo=").append(this.getPageNo())
                .append("&numOfRows=").append(this.getNumOfRows())
                .append("&dataType=").append(this.getDataType().value)
                .append("&base_date=").append(BASE_DATE_FORMAT.format(this.getBaseDate()))
                .append("&base_time=").append(BASE_TIME_FORMAT.format(this.getBaseDate()))
                .append("&nx=").append(this.getX())
                .append("&ny=").append(this.getY());
        try {
            URL url = new URL(urlBuilder.toString());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(RequestMethod.GET.name());
            connection.setDoOutput(true);
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                String responseString = reader.readLine();
                if (!responseString.startsWith("{")) {
                    return null;
                }
                JSONObject responseObject = new JSONObject(responseString).getJSONObject("response");
                JSONObject headerObject = responseObject.getJSONObject("header");
                if (headerObject == null ||
                        !headerObject.getString("resultCode").equals("00") ||
                        !headerObject.getString("resultMsg").equals("NORMAL_SERVICE")) {
                    return null;
                }
                HashMap<String, WeatherEntity> weatherMap = new HashMap<>();
                JSONArray itemArray = responseObject
                        .getJSONObject("body")
                        .getJSONObject("items")
                        .getJSONArray("item");
                for (int i = 0; i < itemArray.length(); i++) {
                    JSONObject itemObject = itemArray.getJSONObject(i);
                    String key = String.format("%d.%d.%s%s",
                            itemObject.getInt("nx"),
                            itemObject.getInt("ny"),
                            itemObject.getString("fcstDate"),
                            itemObject.getString("fcstTime"));
                    if (!weatherMap.containsKey(key)) {
                        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMdd HHmm");
                        WeatherEntity weather = new WeatherEntity();
                        weather.setDatetime(simpleDateFormat.parse(String.format("%s %s",
                                        itemObject.getString("fcstDate"),
                                        itemObject.getString("fcstTime"))))
                                .setX(itemObject.getInt("nx"))
                                .setY(itemObject.getInt("ny"));
                        weatherMap.put(key, weather);
                    }
                    WeatherEntity weather = weatherMap.get(key);
                    switch (itemObject.getString("category")) {
                        case "PTY": {
                            int value = itemObject.getInt("fcstValue");
                            String precipitation;
                            if (value == 0) {
                                precipitation = "NONE";
                            } else if (value == 1) {
                                precipitation = "RAIN";
                            } else if (value == 2) {
                                precipitation = "RAIN_SNOW";
                            } else if (value == 3) {
                                precipitation = "SNOW";
                            } else if (value == 5) {
                                precipitation = "RAIN_WEAK";
                            } else if (value == 6) {
                                precipitation = "RAIN_SNOW_WEAK";
                            } else if (value == 7) {
                                precipitation = "SNOW_WEAK";
                            } else {
                                throw new NotImplementedException();
                            }
                            weather.setPrecipitationType(precipitation);
                            break;
                        }
                        case "REH": {
                            weather.setHumidity(itemObject.getInt("fcstValue"));
                            break;
                        }
                        case "RN1": {
                            String rainString = itemObject.getString("fcstValue");
                            double rain;
                            if (rainString.contains("mm")) {
                                rain = Double.parseDouble(rainString.replace("mm", ""));
                            } else {
                                rain = 0D;
                            }
                            weather.setPrecipitation(rain);
                            break;
                        }
                        case "SKY": {
                            int value = itemObject.getInt("fcstValue");
                            String skyType;
                            if (value == 1) {
                                skyType = "CLEAR";
                            } else if (value == 3) {
                                skyType = "CLOUDY";
                            } else if (value == 4) {
                                skyType = "MOSTLY_CLOUDY";
                            } else {
                                throw new NotImplementedException();
                            }
                            weather.setSkyType(skyType);
                            break;
                        }
                        case "T1H": {
                            weather.setTemperature(itemObject.getInt("fcstValue"));
                            break;
                        }
                    }
                }
                return weatherMap.values().toArray(WeatherEntity[]::new);
            }
        } catch (IOException | ParseException e) {
            throw new RuntimeException(e);
        }
    }
}