package dev.yhpark.matzip.services;

import dev.yhpark.matzip.apis.MailApi;
import dev.yhpark.matzip.apis.ncloud.SensApi;
import dev.yhpark.matzip.entities.ContactCodeEntity;
import dev.yhpark.matzip.entities.EmailCodeEntity;
import dev.yhpark.matzip.entities.UserEntity;
import dev.yhpark.matzip.exceptions.InvalidArgumentException;
import dev.yhpark.matzip.exceptions.TransactionalException;
import dev.yhpark.matzip.mappers.UserMapper;
import dev.yhpark.matzip.regexes.ContactCodeRegex;
import dev.yhpark.matzip.regexes.EmailCodeRegex;
import dev.yhpark.matzip.regexes.UserRegex;
import dev.yhpark.matzip.results.CommonResult;
import dev.yhpark.matzip.results.Result;
import dev.yhpark.matzip.results.user.*;
import dev.yhpark.matzip.utils.CryptoUtil;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;

@Service(value = "dev.yhpark.matzip.services.UserService")
public class UserService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final UserMapper userMapper;

    @Value("${spring.mail.username}")
    private String mailSenderAddress;

    @Value("${custom.ncloud.access-key}")
    private String ncloudAccessKey;

    @Value("${custom.ncloud.secret-key}")
    private String ncloudSecretKey;

    @Value("${custom.ncloud.service-id}")
    private String ncloudServiceId;

    @Value("${custom.ncloud.from}")
    private String ncloudFrom;

    private EmailCodeEntity sendEmail(HttpServletRequest request, String to, String subject, String template) throws MessagingException {
        String clientIp = request.getRemoteAddr();
        String clientUa = request.getHeader("User-Agent");
        String code = RandomStringUtils.randomAlphanumeric(32);
        String salt = CryptoUtil.hashSha512(String.format("%s%s%s%f%f",
                clientIp,
                clientUa,
                code,
                RandomUtils.nextDouble(),
                RandomUtils.nextDouble()));
        Date createdAt = new Date();
        Date expiresAt = DateUtils.addMinutes(createdAt, 60);
        EmailCodeEntity emailCode = new EmailCodeEntity()
                .setEmail(to)
                .setCode(code)
                .setSalt(salt)
                .setCreatedAt(createdAt)
                .setExpiresAt(expiresAt)
                .setExpired(false)
                .setClientIp(clientIp)
                .setClientUa(clientUa);
        if (this.userMapper.insertEmailCode(emailCode) < 1) {
            throw new TransactionalException();
        }
        new MailApi(this.mailSender, this.templateEngine)
                .setContextVariable("domain", String.format("%s://%s:%d/",
                        request.getScheme(),
                        request.getServerName(),
                        request.getServerPort()))
                .setContextVariable("emailCode", emailCode)
                .setFrom(this.mailSenderAddress)
                .setTo(to)
                .setSubject(subject)
                .setTemplate(template)
                .send();
        return emailCode;
    }

    @Autowired
    public UserService(JavaMailSender mailSender, SpringTemplateEngine templateEngine, UserMapper userMapper) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.userMapper = userMapper;
    }

    public Enum<? extends Result> deleteUser(UserEntity user, String currentPassword) {
        if (!UserRegex.PASSWORD.matches(currentPassword)) {
            throw new InvalidArgumentException();
        }
        currentPassword = CryptoUtil.hashSha512(currentPassword);
        if (!user.getPassword().equals(currentPassword)) {
            return DeleteResult.FAILURE_INVALID_PASSWORD;
        }
        user.setDeleted(true);
        return this.userMapper.updateUser(user) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    @Transactional
    public Enum<? extends Result> editUser(UserEntity signedUser, UserEntity user, ContactCodeEntity contactCode, String currentPassword) {
        if (!UserRegex.PASSWORD.matches(currentPassword) ||
                !UserRegex.NAME.matches(user.getName()) ||
                !UserRegex.ADDRESS_POSTAL.matches(user.getAddressPostal()) ||
                !UserRegex.ADDRESS_PRIMARY.matches(user.getAddressPrimary()) ||
                !UserRegex.ADDRESS_SECONDARY.matches(user.getAddressSecondary())) {
            throw new InvalidArgumentException();
        }
        currentPassword = CryptoUtil.hashSha512(currentPassword);
        if (!signedUser.getPassword().equals(currentPassword)) {
            return EditResult.FAILURE_INVALID_PASSWORD;
        }
        if (user.getPassword() == null) {
            user.setPassword(signedUser.getPassword());
        } else {
            if (!UserRegex.PASSWORD.matches(user.getPassword())) {
                throw new InvalidArgumentException();
            }
            user.setPassword(CryptoUtil.hashSha512(user.getPassword()));
        }
        if (user.getContact() == null) {
            user.setContact(signedUser.getContact());
        } else {
            if (!ContactCodeRegex.CONTACT.matches(contactCode.getContact()) ||
                    !ContactCodeRegex.CODE.matches(contactCode.getCode()) ||
                    !ContactCodeRegex.SALT.matches(contactCode.getSalt())) {
                throw new InvalidArgumentException();
            }
            contactCode = this.userMapper.selectContactCodeByContactCodeSalt(
                    contactCode.getContact(),
                    contactCode.getCode(),
                    contactCode.getSalt());
            if (contactCode == null || !contactCode.isExpired()) {
                return CommonResult.FAILURE;
            }
            UserEntity userByContact = this.userMapper.selectUserByContact(contactCode.getContact());
            if (userByContact != null && !userByContact.equals(signedUser)) {
                return EditResult.FAILURE_DUPLICATE_CONTACT;
            }
            user.setContact(contactCode.getContact());
        }
        user.setIndex(signedUser.getIndex())
                .setEmail(signedUser.getEmail())
                .setNickname(signedUser.getNickname())
                .setRegisteredAt(signedUser.getRegisteredAt())
                .setVerified(signedUser.isVerified())
                .setSuspended(signedUser.isSuspended())
                .setDeleted(signedUser.isDeleted())
                .setAdmin(signedUser.isAdmin());
        return this.userMapper.updateUser(user) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public UserEntity getUserByEmail(String email) {
        if (!UserRegex.EMAIL.matches(email)) {
            throw new InvalidArgumentException();
        }
        return this.userMapper.selectUserByEmail(email);
    }

    public int getUserCountByContact(String contact) {
        if (!UserRegex.CONTACT.matches(contact)) {
            throw new InvalidArgumentException();
        }
        return this.userMapper.selectUserCountByContact(contact);
    }

    public int getUserCountByEmail(String email) {
        if (!UserRegex.EMAIL.matches(email)) {
            throw new InvalidArgumentException();
        }
        return this.userMapper.selectUserCountByEmail(email);
    }

    public int getUserCountByNickname(String nickname) {
        if (!UserRegex.NICKNAME.matches(nickname)) {
            throw new InvalidArgumentException();
        }
        return this.userMapper.selectUserCountByNickname(nickname);
    }

    public Enum<? extends Result> login(UserEntity user) {
        if (!UserRegex.EMAIL.matches(user.getEmail()) ||
                !UserRegex.PASSWORD.matches(user.getPassword())) {
            throw new InvalidArgumentException();
        }
        user.setPassword(CryptoUtil.hashSha512(user.getPassword()));
        UserEntity existingUser = this.userMapper.selectUserByEmail(user.getEmail());
        if (!user.getPassword().equals(existingUser.getPassword()) || existingUser.isDeleted()) {
            return CommonResult.FAILURE;
        }
        if (!existingUser.isVerified()) {
            return LoginResult.FAILURE_NOT_VERIFIED;
        }
        if (existingUser.isSuspended()) {
            return LoginResult.FAILURE_SUSPENDED;
        }
        user.setIndex(existingUser.getIndex())
                .setNickname(existingUser.getNickname())
                .setName(existingUser.getName())
                .setContact(existingUser.getContact())
                .setAddressPostal(existingUser.getAddressPostal())
                .setAddressPrimary(existingUser.getAddressPrimary())
                .setAddressSecondary(existingUser.getAddressSecondary())
                .setRegisteredAt(existingUser.getRegisteredAt())
                .setVerified(existingUser.isVerified())
                .setSuspended(existingUser.isSuspended())
                .setDeleted(existingUser.isDeleted())
                .setAdmin(existingUser.isAdmin());
        return CommonResult.SUCCESS;
    }

    public Enum<? extends Result> recoverEmail(ContactCodeEntity contactCode, UserEntity user) {
        if (!ContactCodeRegex.CONTACT.matches(contactCode.getContact()) ||
                !ContactCodeRegex.CODE.matches(contactCode.getCode()) ||
                !ContactCodeRegex.SALT.matches(contactCode.getSalt()) ||
                !UserRegex.NAME.matches(user.getName())) {
            throw new InvalidArgumentException();
        }
        contactCode = this.userMapper.selectContactCodeByContactCodeSalt(
                contactCode.getContact(),
                contactCode.getCode(),
                contactCode.getSalt());
        if (contactCode == null || !contactCode.isExpired()) {
            return CommonResult.FAILURE;
        }
        UserEntity existingUser = this.userMapper.selectUserByContact(contactCode.getContact());
        if (!user.getName().equals(existingUser.getName())) {
            return CommonResult.FAILURE;
        }
        boolean contactCodeDeleted = this.userMapper.deleteContactCodeByIndex(contactCode.getIndex()) > 0;
        if (!contactCodeDeleted) {
            throw new TransactionalException();
        }
        user.setEmail(existingUser.getEmail());
        new SensApi()
                .setSpec(new SensApi.Spec()
                        .setAccessKey(this.ncloudAccessKey)
                        .setSecretKey(this.ncloudSecretKey)
                        .setServiceId(this.ncloudServiceId))
                .setFrom(this.ncloudFrom)
                .setType(SensApi.Type.SMS)
                .setContentType(SensApi.ContentType.COMM)
                .setTo(contactCode.getContact())
                .setContent(String.format("[맛집] 이메일 주소는 [%s]입니다.", user.getEmail()))
                .send();
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Enum<? extends Result> register(HttpServletRequest request, ContactCodeEntity contactCode, UserEntity user)
            throws MessagingException {
        if (!ContactCodeRegex.CONTACT.matches(contactCode.getContact()) ||
                !ContactCodeRegex.CODE.matches(contactCode.getCode()) ||
                !ContactCodeRegex.SALT.matches(contactCode.getSalt()) ||
                !UserRegex.EMAIL.matches(user.getEmail()) ||
                !UserRegex.PASSWORD.matches(user.getPassword()) ||
                !UserRegex.NICKNAME.matches(user.getNickname()) ||
                !UserRegex.NAME.matches(user.getName()) ||
                !UserRegex.CONTACT.matches(user.getContact()) ||
                !UserRegex.ADDRESS_POSTAL.matches(user.getAddressPostal()) ||
                !UserRegex.ADDRESS_PRIMARY.matches(user.getAddressPrimary()) ||
                !UserRegex.ADDRESS_SECONDARY.matches(user.getAddressSecondary())) {
            throw new InvalidArgumentException();
        }
        contactCode = this.userMapper.selectContactCodeByContactCodeSalt(
                contactCode.getContact(),
                contactCode.getCode(),
                contactCode.getSalt());
        if (contactCode == null || !contactCode.isExpired()) {
            return CommonResult.FAILURE;
        }
        if (this.getUserCountByEmail(user.getEmail()) > 0) {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }
        if (this.getUserCountByNickname(user.getNickname()) > 0) {
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }
        if (this.getUserCountByContact(user.getContact()) > 0) {
            return RegisterResult.FAILURE_DUPLICATE_CONTACT;
        }
        user.setPassword(CryptoUtil.hashSha512(user.getPassword()))
                .setRegisteredAt(new Date())
                .setVerified(false)
                .setSuspended(false)
                .setDeleted(false)
                .setAdmin(false);
        if (this.userMapper.insertUser(user) < 1) {
            return CommonResult.FAILURE;
        }
        this.sendEmail(request, user.getEmail(), "[맛집] 회원가입 이메일 인증", "user/registerEmail");
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Enum<? extends Result> resetPasswordSendEmail(HttpServletRequest request, EmailCodeEntity emailCode, UserEntity user)
            throws MessagingException {
        if (!UserRegex.EMAIL.matches(user.getEmail()) ||
                !UserRegex.NAME.matches(user.getName()) ||
                !EmailCodeRegex.EMAIL.matches(emailCode.getEmail())) {
            throw new InvalidArgumentException();
        }
        UserEntity existingUser = this.getUserByEmail(user.getEmail());
        if (existingUser == null || !existingUser.getName().equals(user.getName())) {
            return CommonResult.FAILURE;
        }
        EmailCodeEntity sentEmailCode = this.sendEmail(request, emailCode.getEmail(), "[맛집] 비밀번호 재설정 인증번호", "user/resetPasswordEmail");
        emailCode.setSalt(sentEmailCode.getSalt());
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Enum<? extends Result> resetPasswordVerifyEmail(EmailCodeEntity emailCode, UserEntity user) {
        if (!EmailCodeRegex.EMAIL.matches(emailCode.getEmail()) ||
                !EmailCodeRegex.CODE.matches(emailCode.getCode()) ||
                !EmailCodeRegex.SALT.matches(emailCode.getSalt()) ||
                !UserRegex.EMAIL.matches(user.getEmail()) ||
                !UserRegex.NAME.matches(user.getName())) {
            throw new InvalidArgumentException();
        }
        emailCode = this.userMapper.selectEmailCodeByEmailCodeSalt(
                emailCode.getEmail(),
                emailCode.getCode(),
                emailCode.getSalt());
        if (emailCode == null) {
            return CommonResult.FAILURE;
        }
        UserEntity existingUser = this.getUserByEmail(user.getEmail());
        if (existingUser == null || !existingUser.getName().equals(user.getName())) {
            return CommonResult.FAILURE;
        }
        emailCode.setExpired(true);
        return this.userMapper.updateEmailCode(emailCode) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    @Transactional
    public Enum<? extends Result> resetPassword(EmailCodeEntity emailCode, UserEntity user) {
        if (!EmailCodeRegex.EMAIL.matches(emailCode.getEmail()) ||
                !EmailCodeRegex.CODE.matches(emailCode.getCode()) ||
                !EmailCodeRegex.SALT.matches(emailCode.getSalt()) ||
                !UserRegex.EMAIL.matches(user.getEmail()) ||
                !UserRegex.PASSWORD.matches(user.getPassword()) ||
                !UserRegex.NAME.matches(user.getName())) {
            throw new InvalidArgumentException();
        }
        emailCode = this.userMapper.selectEmailCodeByEmailCodeSalt(
                emailCode.getEmail(),
                emailCode.getCode(),
                emailCode.getSalt());
        if (emailCode == null || !emailCode.isExpired()) {
            return CommonResult.FAILURE;
        }
        UserEntity existingUser = this.getUserByEmail(user.getEmail());
        if (existingUser == null || !existingUser.getName().equals(user.getName())) {
            return CommonResult.FAILURE;
        }
        existingUser.setPassword(CryptoUtil.hashSha512(user.getPassword()));
        boolean emailCodeDeleted = this.userMapper.deleteEmailCodeByIndex(emailCode.getIndex()) > 0;
        boolean userUpdated = this.userMapper.updateUser(existingUser) > 0;
        if (!emailCodeDeleted || !userUpdated) {
            throw new TransactionalException();
        }
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Enum<? extends Result> sendContactCode(HttpServletRequest request, ContactCodeEntity contactCode) {
        if (!UserRegex.CONTACT.matches(contactCode.getContact())) {
            throw new InvalidArgumentException();
        }
        String clientIp = request.getRemoteAddr();
        String clientUa = request.getHeader("User-Agent");
        String code = RandomStringUtils.randomNumeric(6);
        String salt = CryptoUtil.hashSha512(String.format("%s%s%s%s%f%f",
                clientIp,
                clientUa,
                contactCode.getContact(),
                code,
                RandomUtils.nextDouble(),
                RandomUtils.nextDouble()));
        Date createdAt = new Date();
        Date expiresAt = DateUtils.addMinutes(createdAt, 3);
        contactCode.setCode(code)
                .setSalt(salt)
                .setCreatedAt(createdAt)
                .setExpiresAt(expiresAt)
                .setExpired(false)
                .setClientIp(clientIp)
                .setClientUa(clientUa);
        if (this.userMapper.insertContactCode(contactCode) < 1) {
            return CommonResult.FAILURE;
        }
        new SensApi()
                .setSpec(new SensApi.Spec()
                        .setAccessKey(this.ncloudAccessKey)
                        .setSecretKey(this.ncloudSecretKey)
                        .setServiceId(this.ncloudServiceId))
                .setFrom(this.ncloudFrom)
                .setType(SensApi.Type.SMS)
                .setContentType(SensApi.ContentType.COMM)
                .setTo(contactCode.getContact())
                .setContent(String.format("[맛집] 인증번호 [%s]를 입력해 주세요.", contactCode.getCode()))
                .send();
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Enum<? extends Result> verifyContactCode(ContactCodeEntity contactCode) {
        if (!ContactCodeRegex.CONTACT.matches(contactCode.getContact()) ||
                !ContactCodeRegex.CODE.matches(contactCode.getCode()) ||
                !ContactCodeRegex.SALT.matches(contactCode.getSalt())) {
            throw new InvalidArgumentException();
        }
        contactCode = this.userMapper.selectContactCodeByContactCodeSalt(contactCode.getContact(),
                contactCode.getCode(),
                contactCode.getSalt());
        if (contactCode == null) {
            return CommonResult.FAILURE;
        }
        if (new Date().compareTo(contactCode.getExpiresAt()) > 0 || contactCode.isExpired()) {
            return VerifyContactCodeResult.FAILURE_EXPIRED;
        }
        contactCode.setExpired(true);
        if (this.userMapper.updateContactCode(contactCode) < 1) {
            return CommonResult.FAILURE;
        }
        return CommonResult.SUCCESS;
    }

    @Transactional
    public Enum<? extends Result> verifyEmailCode(EmailCodeEntity emailCode) {
        if (!EmailCodeRegex.EMAIL.matches(emailCode.getEmail()) ||
                !EmailCodeRegex.CODE.matches(emailCode.getCode()) ||
                !EmailCodeRegex.SALT.matches(emailCode.getSalt())) {
            throw new InvalidArgumentException();
        }
        emailCode = this.userMapper.selectEmailCodeByEmailCodeSalt(
                emailCode.getEmail(),
                emailCode.getCode(),
                emailCode.getSalt());
        if (emailCode == null) {
            return CommonResult.FAILURE;
        }
        if (new Date().compareTo(emailCode.getExpiresAt()) > 0 || emailCode.isExpired()) {
            return VerifyEmailCodeResult.FAILURE_EXPIRED;
        }
        emailCode.setExpired(true);
        if (this.userMapper.updateEmailCode(emailCode) < 1) {
            return CommonResult.FAILURE;
        }
        UserEntity user = this.userMapper.selectUserByEmail(emailCode.getEmail());
        user.setVerified(true);
        if (this.userMapper.updateUser(user) < 1) {
            throw new TransactionalException();
        }
        return CommonResult.SUCCESS;
    }
}