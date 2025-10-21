import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class InputAccountDto {
  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  username: string;

  @Field()
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  password: string;
}
