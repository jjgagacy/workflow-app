import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('I18nObjectType')
export class I18nObjectType {
  @Field(() => String, { nullable: true, description: "English (United States) translation" })
  en_US?: string;

  @Field(() => String, { nullable: true, description: "Chinese (Simplified) translation" })
  zh_Hans?: string;
}
