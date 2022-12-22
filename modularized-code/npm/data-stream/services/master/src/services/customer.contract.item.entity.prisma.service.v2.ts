import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";
import { CustomerContractItemEntityPrismaV2Dao, CustomerContractItemEntityModelDto } from "astrafms-db-mssql-prisma-data-stream-master"

export class CustomerContractItemEntityPrismaServiceV2 {
  private logger: any = Logger.getLogger("./services/customer.contract.item.entity.prisma.service.v2")
  private trace: any;
  private traceFileName: any;
  private prisma: any = null;
  private option: any = null;

  constructor(prisma: any, option: any) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.prisma = prisma;
    this.option = option;
  }

  public async sync(commonRequest: CommonRequest) {
    this.logger.info("[sync]...Item start");
    try {
      const customerContractItemEntityPrismaV2Dao: CustomerContractItemEntityPrismaV2Dao = new CustomerContractItemEntityPrismaV2Dao(this.prisma, this.option)
      const result: CustomerContractItemEntityModelDto = await customerContractItemEntityPrismaV2Dao.sync(commonRequest);
      return result;
    } catch (error) {
      console.log("@@ error -->> ", error)
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    }
  }

}
