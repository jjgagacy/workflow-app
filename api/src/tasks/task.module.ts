import { Global, Module } from "@nestjs/common";
import { TaskService } from "./task.service";

@Global()
@Module({
  imports: [],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule { }
