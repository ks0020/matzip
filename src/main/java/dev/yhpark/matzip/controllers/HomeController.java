package dev.yhpark.matzip.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller(value = "dev.yhpark.matzip.controllers.HomeController")
@RequestMapping(value = "/")
public class HomeController {
    @Value("${custom.kakao.app-key}")
    private String kakaoAppKey;

    @RequestMapping(value = "/",
            method = RequestMethod.GET,
            produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getIndex() {
        ModelAndView modelAndView = new ModelAndView("home/index");
        modelAndView.addObject("kakaoAppKey", this.kakaoAppKey);
        return modelAndView;
    }
}