package dev.yhpark.matzip.regexes;

public enum UserRegex implements Regex {
    EMAIL("^(?=.{8,50}$)([\\da-zA-Z][\\da-zA-Z\\-_.]+[\\da-zA-Z])@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$"),
    PASSWORD("^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]}\\\\|;:'\",<.>/?]{4,50})$"),
    NICKNAME("^([a-zA-Z가-힣]{2,10})$"),
    NAME("^([가-힣]{2,5})$"),
    CONTACT("^(010[\\d]{8})$"),
    ADDRESS_POSTAL("^([\\d]{5})$"),
    ADDRESS_PRIMARY("^(?=.{8,100}$)([\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$"),
    ADDRESS_SECONDARY("^(?=.{0,100}$)(.{0}|[\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$");

    private final String exp;

    UserRegex(String exp) {
        this.exp = exp;
    }

    @Override
    public boolean matches(String input) {
        return input != null && input.matches(this.exp);
    }
}