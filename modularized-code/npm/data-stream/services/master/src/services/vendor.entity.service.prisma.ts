import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";
import * as _ from "lodash";
import { DML, VendorEntityPrismaDao, VendorEntityModelDto, } from "astrafms-db-mssql-prisma-data-stream-master"

export class VendorEntityPrismaService implements DML<CommonRequest>  {
  private logger: any = Logger.getLogger("./services/vendor.entity.prisma.service")
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
      const vendorEntityPrismaDao: VendorEntityPrismaDao = new VendorEntityPrismaDao(this.prisma, this.option);
      const result: VendorEntityModelDto = await vendorEntityPrismaDao.sync(commonRequest);
      return result;
    } catch (error) {
      console.log("@@ error -->> ", error)
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    }
  }
}
