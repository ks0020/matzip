package dev.yhpark.matzip.regexes;

public enum EmailCodeRegex implements Regex {
    EMAIL("^(?=.{8,50}$)([\\da-zA-Z][\\da-zA-Z\\-_.]+[\\da-zA-Z])@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$"),
    CODE("^([\\da-zA-Z]{32})$"),
    SALT("^([\\da-f]{128})$");

    private final String exp;

    EmailCodeRegex(String exp) {
        this.exp = exp;
    }

    @Override
    public boolean matches(String input) {
        return input != null && input.matches(this.exp);
    }
}
