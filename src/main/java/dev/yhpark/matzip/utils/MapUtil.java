package dev.yhpark.matzip.utils;

import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;

public final class MapUtil {
    private static final double RADIAN = 0.017453292519943295D;
    private static final double EARTH_RADIUS = 6_371.00877D;
    private static final double GRID_GAP = 5.0D;
    private static final double PROJECT_LATITUDE_1 = 30.0D;
    private static final double PROJECT_LATITUDE_2 = 60.0D;
    private static final double OBJECT_LONGITUDE = 126.0D;
    private static final double OBJECT_LATITUDE = 38.0D;
    private static final double OBJECT_X = 43D;
    private static final double OBJECT_Y = 136D;

    public static Pair<Integer, Integer> coordsToGrid(double latitude, double longitude) {
        final double gridCount = EARTH_RADIUS / GRID_GAP;
        final double projectLatitude1 = PROJECT_LATITUDE_1 * RADIAN;
        final double projectLatitude2 = PROJECT_LATITUDE_2 * RADIAN;
        final double objectLongitude = OBJECT_LONGITUDE * RADIAN;
        final double objectLatitude = OBJECT_LATITUDE * RADIAN;

        double dv = Math.tan(Math.PI * 0.25D + projectLatitude1 * 0.5D);
        double sn;
        sn = Math.tan(Math.PI * 0.25D + projectLatitude2 * 0.5D) / dv;
        sn = Math.log(Math.cos(projectLatitude1) / Math.cos(projectLatitude2)) / Math.log(sn);
        double sf = Math.pow(dv, sn) * Math.cos(projectLatitude1) / sn;
        double ro;
        ro = Math.tan(Math.PI * 0.25D + objectLatitude * 0.5D);
        ro = gridCount * sf / Math.pow(ro, sn);

        double ra;
        ra = Math.tan(Math.PI * 0.25D + latitude * RADIAN * 0.5D);
        ra = gridCount * sf / Math.pow(ra, sn);
        double theta = longitude * RADIAN - objectLongitude;
        if (theta > Math.PI) theta -= 2.0D * Math.PI;
        if (theta < -Math.PI) theta += 2.0D * Math.PI;
        theta *= sn;

        int gridX = (int) Math.floor(ra * Math.sin(theta) + OBJECT_X + 0.5D);
        int gridY = (int) Math.floor(ro - ra * Math.cos(theta) + OBJECT_Y + 0.5D);
        return new ImmutablePair<>(gridX, gridY);
    }

    private MapUtil() {
    }
}