import { InstalledAppEntity } from "@/account/entities/installed-app.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class InstalledAppService {
  constructor(
    @InjectRepository(InstalledAppEntity)
    private readonly installedAppRepository: Repository<InstalledAppEntity>,

  ) { }
}