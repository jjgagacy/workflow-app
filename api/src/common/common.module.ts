import { Module } from "@nestjs/common";
import { DateScalar } from "./graphql/scalars/date.scalar";

@Module({
  imports: [],
  controllers: [],
  providers: [DateScalar]
})
export class CommonModule { }
