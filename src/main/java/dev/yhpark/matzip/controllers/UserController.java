package dev.yhpark.matzip.controllers;

import dev.yhpark.matzip.entities.ContactCodeEntity;
import dev.yhpark.matzip.entities.EmailCodeEntity;
import dev.yhpark.matzip.entities.UserEntity;
import dev.yhpark.matzip.exceptions.TransactionalException;
import dev.yhpark.matzip.results.CommonResult;
import dev.yhpark.matzip.results.Result;
import dev.yhpark.matzip.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

@Controller(value = "dev.yhpark.matzip.controllers.UserController")
@RequestMapping(value = "/user")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "account",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteAccount(@SessionAttribute(value = "user") UserEntity user,
                                @RequestParam(value = "currentPassword") String currentPassword,
                                HttpSession session) throws InterruptedException {
        Thread.sleep(1000);
        Enum<? extends Result> result = this.userService.deleteUser(user, currentPassword);
        if (result == CommonResult.SUCCESS) {
            session.setAttribute("user", null);
        }
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "account",
            method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchAccount(@SessionAttribute(value = "user") UserEntity signedUser,
                               @RequestParam(value = "currentPassword") String currentPassword,
                               HttpSession session,
                               UserEntity user,
                               ContactCodeEntity contactCode) throws InterruptedException {
        Thread.sleep(1000);
        Enum<? extends Result> result = this.userService.editUser(signedUser, user, contactCode, currentPassword);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            session.setAttribute("user", null);
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "email-count",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getEmailCount(@RequestParam(value = "email") String email) {
        int count = this.userService.getUserCountByEmail(email);
        JSONObject responseObject = new JSONObject();
        responseObject.put("count", count);
        return responseObject.toString();
    }

    @RequestMapping(value = "nickname-count",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getNicknameCount(@RequestParam(value = "nickname") String nickname) {
        int count = this.userService.getUserCountByNickname(nickname);
        JSONObject responseObject = new JSONObject();
        responseObject.put("count", count);
        return responseObject.toString();
    }

    @RequestMapping(value = "contact-code",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postContactCode(HttpServletRequest request, ContactCodeEntity contactCode)
            throws InterruptedException {
        Thread.sleep(1500);
        Enum<? extends Result> result = this.userService.sendContactCode(request, contactCode);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("salt", contactCode.getSalt());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "contact-code",
            method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchContactCode(ContactCodeEntity contactCode)
            throws InterruptedException {
        Thread.sleep(1500);
        Enum<? extends Result> result = this.userService.verifyContactCode(contactCode);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "email-auth",
            method = RequestMethod.GET,
            produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getEmailAuth(EmailCodeEntity emailCode) {
        ModelAndView modelAndView = new ModelAndView("user/emailAuth");
        Enum<? extends Result> result;
        try {
            result = this.userService.verifyEmailCode(emailCode);
        } catch (TransactionalException ignored) {
            result = CommonResult.FAILURE;
        }
        modelAndView.addObject("result", result.name().toLowerCase());
        return modelAndView;
    }

    @RequestMapping(value = "login",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postLogin(HttpServletRequest request, UserEntity user)
            throws InterruptedException {
        Thread.sleep(750);
        Enum<? extends Result> result = this.userService.login(user);
        if (result == CommonResult.SUCCESS) {
            HttpSession session = request.getSession();
            session.setAttribute("user", user);
        }
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "logout", method = RequestMethod.GET)
    public ModelAndView getLogout(HttpSession session) {
        ModelAndView modelAndView = new ModelAndView("redirect:/");
        session.setAttribute("user", null);
        return modelAndView;
    }

    @RequestMapping(value = "recover-email",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRecoverEmail(ContactCodeEntity contactCode, UserEntity user) {
        Enum<? extends Result> result = this.userService.recoverEmail(contactCode, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            String[] emailArray = user.getEmail().split("@");
            responseObject.put("email", "*".repeat(3) + emailArray[0].substring(3) + "@" + emailArray[1]);
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "register",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegister(HttpServletRequest request, ContactCodeEntity contactCode, UserEntity user)
            throws MessagingException {
        Enum<? extends Result> result;
        try {
            result = this.userService.register(request, contactCode, user);
        } catch (TransactionalException ignored) {
            result = CommonResult.FAILURE;
        }
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "reset-password",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postResetPassword(HttpServletRequest request, EmailCodeEntity emailCode, UserEntity user)
            throws MessagingException, InterruptedException {
        Enum<? extends Result> result = this.userService.resetPasswordSendEmail(request, emailCode, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("salt", emailCode.getSalt());
        } else {
            Thread.sleep(1500);
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "reset-password",
            method = RequestMethod.PATCH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchResetPassword(EmailCodeEntity emailCode, UserEntity user)
            throws InterruptedException {
        Thread.sleep(1500);
        Enum<? extends Result> result = this.userService.resetPasswordVerifyEmail(emailCode, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "reset-password",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String putResetPassword(EmailCodeEntity emailCode, UserEntity user)
            throws InterruptedException {
        Thread.sleep(1500);
        Enum<? extends Result> result = this.userService.resetPassword(emailCode, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }
}