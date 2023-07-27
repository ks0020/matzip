package dev.yhpark.matzip.apis;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

public class MailApi {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    private final Context context = new Context();

    private String from;
    private String to;
    private String subject;
    private String template;

    public MailApi(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public JavaMailSender getMailSender() {
        return this.mailSender;
    }

    public SpringTemplateEngine getTemplateEngine() {
        return this.templateEngine;
    }

    public Context getContext() {
        return this.context;
    }

    public MailApi setContextVariable(String name, Object value) {
        this.context.setVariable(name, value);
        return this;
    }

    public String getFrom() {
        return this.from;
    }

    public MailApi setFrom(String from) {
        this.from = from;
        return this;
    }

    public String getTo() {
        return this.to;
    }

    public MailApi setTo(String to) {
        this.to = to;
        return this;
    }

    public String getSubject() {
        return this.subject;
    }

    public MailApi setSubject(String subject) {
        this.subject = subject;
        return this;
    }

    public String getTemplate() {
        return this.template;
    }

    public MailApi setTemplate(String template) {
        this.template = template;
        return this;
    }

    public void send() throws MessagingException {
        MimeMessage mimeMessage = this.getMailSender().createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        mimeMessageHelper.setSubject(this.getSubject());
        mimeMessageHelper.setFrom(this.getFrom());
        mimeMessageHelper.setTo(this.getTo());
        mimeMessageHelper.setText(this.getTemplateEngine().process(this.getTemplate(), this.getContext()), true);
        this.getMailSender().send(mimeMessage);
    }
}