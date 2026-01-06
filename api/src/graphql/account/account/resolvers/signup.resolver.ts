import { AccountService } from "@/account/account.service";
import { I18nTranslations } from "@/generated/i18n.generated";
import { AuthAccountService } from "@/service/auth-account.service";
import { FeatureService } from "@/service/feature.service";
import { DeviceService } from "@/service/libs/device.service";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { I18nService } from "nestjs-i18n";
import { EmailCodeLoginSendEmail } from "../types/login-input.type";
import { BadRequestException, Req } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { throwIfDtoValidateFail } from "@/common/utils/validation";

@Resolver()
export class SignUpResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly authAccountService: AuthAccountService,
    private readonly deviceService: DeviceService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly featureService: FeatureService
  ) { }

  @Mutation(() => Boolean)
  async checkSignUpUsername(@Args('username') username: string): Promise<boolean> {
    const validateResult = await this.accountService.validateSignupUsername(username);
    if (!validateResult.valid) {
      throw new BadRequestException(validateResult.error);
    }
    return true;
  }

  @Mutation(() => String)
  async emailCodeSignupSendEmail(@Args('input') input: EmailCodeLoginSendEmail, @Req() req: Request): Promise<string> {
    const validateObj = plainToInstance(EmailCodeLoginSendEmail, input);
    //   const errors = await this.i18n.validate(validateObj);
    //    throwIfDtoValidateFail(errors);
    await this.authAccountService.sendEmailCodeLogin
    console.log(input);


    return "";
  }
}
