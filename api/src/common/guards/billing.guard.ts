import { FeatureService } from "@/service/feature.service";
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export abstract class BaseBillingGuard implements CanActivate {
  constructor(
    private readonly featureService: FeatureService
  ) { }

  protected abstract getResource(): string;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    // 从GraphQL上下文中获取请求对象，并返回用户信息
    const tenant = ctx.getContext().req.tenant;
    if (!tenant) {
      throw new BadRequestException("Invalid tenant context");
    }
    const feature = await this.featureService.getFeatures();
    if (!feature.billing.enabled) {
      return true;
    }

    const resource = this.getResource();

    const members = feature.members;
    const apps = feature.apps;
    const vectorSpace = feature.vectorSpace;
    const documentsUploadQuota = feature.documentsUploadQuota;
    const annotationQuota = feature.annotationQuota;

    if (resource === 'members') {
      if (members.limit > 0 && members.size >= members.limit) {
        throw new BadRequestException(`Members limit exceeded.`);
      }
    } else if (resource === 'apps') {
      if (apps.limit > 0 && apps.size >= apps.limit) {
        throw new BadRequestException(`Apps limit exceeded.`);
      }
    } else if (resource === 'vectorSpace') {
      if (vectorSpace.limit > 0 && vectorSpace.size >= vectorSpace.limit) {
        throw new BadRequestException(`Vector space limit exceeded.`);
      }
    } else if (resource === 'documentsUploadQuota') {
      if (documentsUploadQuota.limit > 0 && documentsUploadQuota.size >= documentsUploadQuota.limit) {
        throw new BadRequestException(`Document upload quota exceeded.`);
      }
    } else if (resource === 'annotationQuota') {
      if (annotationQuota.limit > 0 && annotationQuota.size >= annotationQuota.limit) {
        throw new BadRequestException(`Annotation quota exceeded.`);
      }
    }

    return true;
  }
}

@Injectable()
export class AppsBillingGuard extends BaseBillingGuard {
  protected getResource(): string {
    return 'apps';
  }
}

@Injectable()
export class MembersBillingGuard extends BaseBillingGuard {
  protected getResource(): string {
    return 'members';
  }
}

@Injectable()
export class VectorSpaceBillingGuard extends BaseBillingGuard {
  protected getResource(): string {
    return 'vectorSpace';
  }
}

@Injectable()
export class DocumentUploadQuotaBillingGuard extends BaseBillingGuard {
  protected getResource(): string {
    return 'documentsUploadQuota';
  }
}

@Injectable()
export class AnnotationQuotaBillingGuard extends BaseBillingGuard {
  protected getResource(): string {
    return 'annotationQuota';
  }
}
