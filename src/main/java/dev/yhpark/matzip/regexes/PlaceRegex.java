package dev.yhpark.matzip.regexes;

public enum PlaceRegex implements Regex {
    NAME("^([\\da-zA-Z가-힣][\\da-zA-Z가-힣 ]{0,23}[\\da-zA-Z가-힣])$"),
    CONTACT("^(\\d{10,12})$"),
    ADDRESS_POSTAL("^(\\d{5})$"),
    ADDRESS_PRIMARY("^(?=.{8,100}$)([\\d가-힣(][\\d가-힣()\\-, ]*[\\d가-힣)])$"),
    ADDRESS_SECONDARY("^(?=.{0,100}$)(.{0}|[\\d가-힣(][\\d가-힣(), ]*[\\d가-힣)])$");

    public final String exp;

    PlaceRegex(String exp) {
        this.exp = exp;
    }

    @Override
    public boolean matches(String input) {
        return input != null && input.matches(this.exp);
    }
}
