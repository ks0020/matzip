package dev.yhpark.matzip.mappers;

import dev.yhpark.matzip.entities.ContactCodeEntity;
import dev.yhpark.matzip.entities.EmailCodeEntity;
import dev.yhpark.matzip.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int deleteContactCodeByIndex(@Param(value = "index") int index);

    int deleteEmailCodeByIndex(@Param(value = "index") int index);

    int insertContactCode(ContactCodeEntity contactCode);

    int insertEmailCode(EmailCodeEntity emailCode);

    int insertUser(UserEntity user);

    ContactCodeEntity selectContactCodeByContactCodeSalt(@Param(value = "contact") String contact,
                                                         @Param(value = "code") String code,
                                                         @Param(value = "salt") String salt);

    EmailCodeEntity selectEmailCodeByEmailCodeSalt(@Param(value = "email") String email,
                                                   @Param(value = "code") String code,
                                                   @Param(value = "salt") String salt);

    UserEntity selectUserByEmail(@Param(value = "email") String email);

    UserEntity selectUserByContact(@Param(value = "contact") String contact);

    int selectUserCountByContact(@Param(value = "contact") String contact);

    int selectUserCountByEmail(@Param(value = "email") String email);

    int selectUserCountByNickname(@Param(value = "nickname") String nickname);

    int updateContactCode(ContactCodeEntity contactCode);

    int updateEmailCode(EmailCodeEntity emailCode);

    int updateUser(UserEntity user);
}