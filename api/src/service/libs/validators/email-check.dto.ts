import { EMAIL_REGEX } from "@/common/constants/regex.constants";
import { IsNotEmpty, Matches } from "class-validator";

export class EmailCheckDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @Matches(EMAIL_REGEX, { message: 'auth.INVALID_EMAIL' })
  email: string;
}
