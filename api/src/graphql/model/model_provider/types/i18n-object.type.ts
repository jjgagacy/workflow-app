import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('I18nObject')
export class I18nObject {
  @Field(() => String, { nullable: true, description: "English (United States) translation" })
  en_US?: string;

  @Field(() => String, { nullable: true, description: "Chinese (Simplified) translation" })
  zh_Hans?: string;
}
