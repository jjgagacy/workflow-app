import { BadRequestException } from "@nestjs/common";
import { PAGE_LIMIT_MAX } from "@/config/constants";
import { BadRequestGraphQLException } from "@/common/exceptions";

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
            throw new BadRequestGraphQLException(`The number of entries per page cannot exceed ${PAGE_LIMIT_MAX}.`);
        }
    }
}
