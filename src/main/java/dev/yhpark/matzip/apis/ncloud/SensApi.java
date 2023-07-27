package dev.yhpark.matzip.apis.ncloud;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;

public final class SensApi {
    public enum Type {
        SMS("SMS");

        public final String value;

        Type(String value) {
            this.value = value;
        }
    }

    public enum ContentType {
        COMM("COMM");

        public final String value;

        ContentType(String value) {
            this.value = value;
        }
    }

    public static class Spec {
        private String accessKey;
        private String secretKey;
        private String serviceId;

        public String getAccessKey() {
            return accessKey;
        }

        public Spec setAccessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        public String getSecretKey() {
            return secretKey;
        }

        public Spec setSecretKey(String secretKey) {
            this.secretKey = secretKey;
            return this;
        }

        public String getServiceId() {
            return serviceId;
        }

        public Spec setServiceId(String serviceId) {
            this.serviceId = serviceId;
            return this;
        }
    }

    private static final String SIGNATURE_HASH_ALGORITHM = "HmacSHA256";

    private static String generateSignature(RequestMethod method, String uri, long timestamp, Spec spec) {
        String signature = String.format("%s %s\n%d\n%s", method.name(), uri, timestamp, spec.getAccessKey());
        SecretKeySpec secretKeySpec = new SecretKeySpec(spec.getSecretKey().getBytes(StandardCharsets.UTF_8), SIGNATURE_HASH_ALGORITHM);
        try {
            Mac mac = Mac.getInstance(SIGNATURE_HASH_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(signature.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }

    private Spec spec;
    private Type type = Type.SMS;
    private ContentType contentType = ContentType.COMM;
    private String from;
    private String to;
    private String content;

    public Spec getSpec() {
        return spec;
    }

    public SensApi setSpec(Spec spec) {
        this.spec = spec;
        return this;
    }

    public Type getType() {
        return this.type;
    }

    public SensApi setType(Type type) {
        this.type = type;
        return this;
    }

    public ContentType getContentType() {
        return this.contentType;
    }

    public SensApi setContentType(ContentType contentType) {
        this.contentType = contentType;
        return this;
    }

    public String getFrom() {
        return from;
    }

    public SensApi setFrom(String from) {
        this.from = from;
        return this;
    }

    public String getTo() {
        return to;
    }

    public SensApi setTo(String to) {
        this.to = to;
        return this;
    }

    public String getContent() {
        return content;
    }

    public SensApi setContent(String content) {
        this.content = content;
        return this;
    }

    public String send() {
        final String uri = String.format("/sms/v2/services/%s/messages", this.spec.getServiceId());
        JSONObject requestObject = new JSONObject();
        JSONArray messageArray = new JSONArray();
        JSONObject messageObject = new JSONObject();
        messageObject.put("to", this.getTo());
        messageArray.put(messageObject);
        requestObject.put("type", this.getType().value);
        requestObject.put("contentType", this.getContentType().value);
        requestObject.put("from", this.getFrom());
        requestObject.put("content", this.getContent());
        requestObject.put("messages", messageArray);

        long timestamp = new Date().getTime();
        String signature = SensApi.generateSignature(RequestMethod.POST, uri, timestamp, this.getSpec());
        try {
            URL url = new URL(String.format("https://sens.apigw.ntruss.com%s", uri));
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            connection.setRequestProperty("x-ncp-apigw-timestamp", String.valueOf(timestamp));
            connection.setRequestProperty("x-ncp-iam-access-key", this.getSpec().getAccessKey());
            connection.setRequestProperty("x-ncp-apigw-signature-v2", signature);
            connection.setDoOutput(true);
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(connection.getOutputStream()))) {
                writer.write(requestObject.toString());
                writer.flush();
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                return reader.readLine();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}