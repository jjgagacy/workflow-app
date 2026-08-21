import { Injectable } from "@nestjs/common";
import { NODE_TYPE_CLASS_MAPPINGS, LATEST_VERSION } from "./constants";
import { NodeType } from "./types/node-type.enum";
import { WorkflowEntity } from "@/account/entities/workflow.entity";
import { CreateWorkflowDto, QueryWorkflowDto, UpdateWorkflowDto } from "@/ai/apps/workflow/dto/workflow.dto";
import { getPaginationOptions } from "@/common/database/dto/query.dto";
import { isPaginator } from "@/common/database/utils/pagination";
import { checkEntityCreatedId } from "@/common/database/utils/validate";
import { Transactional } from "@/common/decorators/transaction.decorator";
import { validateDto } from "@/common/utils/validation";
import { WorkflowSyncDraftEvent } from "@/events/workflow.event";
import { I18nTranslations } from "@/generated/i18n.generated";
import { MonieEvent } from "@/monie/constants/events";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { DataSource, EntityManager, FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly workflowRepository: Repository<WorkflowEntity>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly eventEmitter: EventEmitter2,
  ) { }


  public getNodeDefaultConfig(nodeType: string, filters?: Record<string, any>): Record<string, any> | null {
    const nodeClass = NODE_TYPE_CLASS_MAPPINGS[nodeType as NodeType]?.[LATEST_VERSION];
    if (!nodeClass) {
      // throw new Error(`Node class not found for node type: ${nodeType}`);
      return null;
    }
    const defaultConfig = nodeClass.getDefaultConfig(filters);
    if (!defaultConfig || Object.keys(defaultConfig).length === 0) {
      return null;
    }
    return defaultConfig;
  }


  async getById(id: string): Promise<WorkflowEntity | null> {
    return await this.workflowRepository.findOne({
      where: { id },
      relations: { tenant: true, app: true },
    });
  }

  async getByAppIdAndTenant(appId: string, tenantId: string): Promise<WorkflowEntity | null> {
    return await this.workflowRepository.findOne({
      where: {
        app: { id: appId },
        tenant: { id: tenantId },
      },
      relations: { tenant: true, app: true },
    });
  }

  async query(queryDto: QueryWorkflowDto) {
    const where: FindOptionsWhere<WorkflowEntity> = {
      ...(queryDto.tenantId && { tenant: { id: queryDto.tenantId } }),
      ...(queryDto.appId && { app: { id: queryDto.appId } }),
      ...(queryDto.type && { type: queryDto.type }),
    };

    const order: FindOptionsOrder<WorkflowEntity> = queryDto.order || { operate: { createdAt: 'DESC' } };
    const options: FindManyOptions<WorkflowEntity> = {
      where,
      order,
      relations: { tenant: true, app: true },
      select: {
        id: true,
        type: true,
        graph: true,
        features: true,
        environmentVariables: true,
        sessionVariables: true,
        tenant: { id: true },
        app: { id: true },
        operate: {
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
        },
      },
      ...getPaginationOptions(queryDto),
    };

    if (isPaginator(queryDto)) {
      const [data, total] = await this.workflowRepository.findAndCount(options);
      return { data, total };
    }

    const data = await this.workflowRepository.find(options);
    return { data, total: data.length };
  }

  @Transactional()
  async create(dto: CreateWorkflowDto, entityManager?: EntityManager): Promise<WorkflowEntity> {
    const workflowRepository = entityManager ? entityManager.getRepository(WorkflowEntity) : this.workflowRepository;
    const dtoInstance = await validateDto(CreateWorkflowDto, dto, this.i18n);

    const workflowEntity = workflowRepository.create({
      tenant: { id: dtoInstance.tenantId },
      app: { id: dtoInstance.appId },
      type: dtoInstance.type,
      graph: dtoInstance.graph,
      features: dtoInstance.features,
      environmentVariables: dtoInstance.environmentVariables,
      sessionVariables: dtoInstance.sessionVariables,
      operate: {
        createdAt: dtoInstance.createdAt || new Date(),
        updatedAt: dtoInstance.createdAt || new Date(),
        createdBy: dtoInstance.createdBy,
        updatedBy: dtoInstance.createdBy,
      },
    });

    await workflowRepository.save(workflowEntity);
    checkEntityCreatedId(workflowEntity, this.i18n);
    return workflowEntity;
  }

  @Transactional()
  async update(workflow: WorkflowEntity, dto: UpdateWorkflowDto, entityManager?: EntityManager): Promise<WorkflowEntity> {
    const workflowRepository = entityManager ? entityManager.getRepository(WorkflowEntity) : this.workflowRepository;
    const dtoInstance = await validateDto(UpdateWorkflowDto, dto, this.i18n);

    const updateFields = {
      ...this.mapBaseFields(dtoInstance),
      operate: {
        ...workflow.operate,
        updatedAt: new Date(),
        updatedBy: dtoInstance.updatedBy,
      },
    };

    Object.assign(workflow, updateFields);
    await workflowRepository.save(workflow);
    return workflow;
  }

  @Transactional()
  async delete(workflowId: string, tenantId: string, entityManager?: EntityManager): Promise<void> {
    const workflowRepository = entityManager ? entityManager.getRepository(WorkflowEntity) : this.workflowRepository;
    await workflowRepository.delete({ id: workflowId, tenant: { id: tenantId } });
  }

  async saveDraft(
    appId: string,
    tenantId: string,
    payload: {
      graph: Record<string, any>;
      features: Record<string, any>;
      environmentVariables: Record<string, any>;
      sessionVariables: Record<string, any>;
      type: string;
      createdBy?: string;
      updatedBy?: string;
    },
    entityManager?: EntityManager,
  ): Promise<Record<string, any>> {
    const existing = await this.getByAppIdAndTenant(appId, tenantId);

    let workflow: WorkflowEntity;
    if (existing) {
      workflow = await this.update(existing, {
        type: payload.type,
        graph: JSON.stringify(payload.graph),
        features: JSON.stringify(payload.features),
        environmentVariables: JSON.stringify(payload.environmentVariables),
        sessionVariables: JSON.stringify(payload.sessionVariables),
        updatedBy: payload.updatedBy || payload.createdBy || '',
      }, entityManager);
    } else {
      workflow = await this.create({
        tenantId,
        appId,
        type: payload.type,
        graph: JSON.stringify(payload.graph),
        features: JSON.stringify(payload.features),
        environmentVariables: JSON.stringify(payload.environmentVariables),
        sessionVariables: JSON.stringify(payload.sessionVariables),
        createdBy: payload.createdBy || '',
      }, entityManager);
    }

    // emit event
    const event = new WorkflowSyncDraftEvent(appId, workflow.id);
    this.eventEmitter.emit(MonieEvent.WORKFLOW_DRAFT_SYNCED, event);

    return this.transformWorkflow(workflow);
  }

  transformWorkflow(workflow: WorkflowEntity): Record<string, any> {
    return {
      id: workflow.id,
      appId: workflow.app?.id,
      tenantId: workflow.tenant?.id,
      type: workflow.type,
      graph: JSON.parse(workflow.graph || '{}'),
      features: JSON.parse(workflow.features || '{}'),
      environmentVariables: JSON.parse(workflow.environmentVariables || '{}'),
      sessionVariables: JSON.parse(workflow.sessionVariables || '{}'),
      createdAt: workflow.operate?.createdAt,
      updatedAt: workflow.operate?.updatedAt,
      createdBy: workflow.operate?.createdBy,
      updatedBy: workflow.operate?.updatedBy,
    };
  }

  private mapBaseFields(dto: Partial<CreateWorkflowDto & UpdateWorkflowDto>) {
    return {
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.graph !== undefined && { graph: dto.graph }),
      ...(dto.features !== undefined && { features: dto.features }),
      ...(dto.environmentVariables !== undefined && { environmentVariables: dto.environmentVariables }),
      ...(dto.sessionVariables !== undefined && { sessionVariables: dto.sessionVariables }),
    };
  }
}
