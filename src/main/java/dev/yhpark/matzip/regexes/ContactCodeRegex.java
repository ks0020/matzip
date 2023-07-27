package dev.yhpark.matzip.regexes;

public enum ContactCodeRegex implements Regex {
    CONTACT("^(010[\\d]{8})$"),
    CODE("^(\\d{6})$"),
    SALT("^([\\da-f]{128})$");

    private final String exp;

    ContactCodeRegex(String exp) {
        this.exp = exp;
    }

    @Override
    public boolean matches(String input) {
        return input != null && input.matches(this.exp);
    }
}