import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";
import * as _ from "lodash";

import { DML, CustomerEntityPrismaDao, CustomerEntityModelDto, } from "astrafms-db-mssql-prisma-data-stream-master"

export class CustomerEntityPrismaService implements DML<CommonRequest> {
  private logger: any = Logger.getLogger("./services/customer.entity.prisma.service")
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
      const customerEntityPrismaDao: CustomerEntityPrismaDao = new CustomerEntityPrismaDao(this.prisma, this.option)
      const result: CustomerEntityModelDto = await customerEntityPrismaDao.sync(commonRequest);
      return result;
    } catch (error) {
      console.log("@@ error -->> ", error)
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    }
  }

}
