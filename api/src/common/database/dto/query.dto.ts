import { BadRequestException } from "@nestjs/common";
import { PAGE_LIMIT_MAX } from "@/config/constants";

export class QueryDto {
    page?: number;
    limit?: number;

    get paginate(): boolean {
        return this.page !== undefined && this.limit !== undefined;
    }

    get skip(): number {
        return this.paginate ? (this.page! - 1) * this.limit! : 0;
    }

    checkLimitAndThrow() {
        if (this.limit !== undefined && this.limit > PAGE_LIMIT_MAX) {
            throw new BadRequestException('Requested page size exceeds maximum allowed limit of ' + PAGE_LIMIT_MAX);
        }
    }
}
