import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";
import { CustomerContractEntityPrismaV2Dao, CustomerContractEntityModelDto } from "astrafms-db-mssql-prisma-data-stream-master"

export class CustomerContractEntityPrismaServiceV2 {
  private logger: any = Logger.getLogger("./services/customer.contract.entity.prisma.service.v2")
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
    this.logger.info("[sync]...start");
    try {
      const customerContractEntityPrismaDao: CustomerContractEntityPrismaV2Dao = new CustomerContractEntityPrismaV2Dao(this.prisma, this.option)
      const result: CustomerContractEntityModelDto = await customerContractEntityPrismaDao.sync(commonRequest);
      return result;
    } catch (error) {
      console.log("@@ error -->> ", error)
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    }
  }

}
