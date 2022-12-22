import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { VendorEntityModelDto } from "../../dto/index";
import { VendorAttributes, VendorBusinessUnitAttributes } from "../../models/interface/index";
import { DML, VendorDeltaSink, VendorBusinessUnitDeltaSink } from "../../interface/index"
import * as _ from "lodash";
import { PrismaClient } from "@prisma/client"
import { helper } from "../../utils/helper"
// import { prismaErrorHelper } from "../../utils/prisma.error.helper"

export class VendorEntityPrismaDao extends AuditClass<VendorAttributes> implements DML<CommonRequest> {
  private logger: any = Logger.getLogger("./dao/entity/vendor.entity.prisma.dao")
  private trace: any;
  private traceFileName: any;
  private prisma: any = null;
  private maxWait: any = 2000; // default, override in env var
  private timeout: any = 5000; // default, override in env var
  // maxWait: The maximum amount of time the Prisma Client will wait to acquire a transaction from the database. The default value is 2 seconds.
  // timeout: The maximum amount of time the interactive transaction can run before being canceled and rolled back. The default value is 5 seconds.


  constructor(prisma?: any, options?: any) {
    super()
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    if (!prisma) {
      this.logger.info("@@ Create new Instance of Prisma");
      // this.prisma = new PrismaClient({ log: ["query"]});
      this.prisma = new PrismaClient();
    } else {
      console.log("from constructor");
      this.prisma = prisma;
    }
    if (options && options.sql) {
      this.maxWait = options.sql?.maxWait || this.maxWait;
      this.timeout = options.sql?.timeout || this.timeout;
    }
  }

  /**
   * This Function use to upsert data from Vendor and VendorBusinessUnit
   * @param commonRequest 
   * @return VendorEntityModelDto
   */
   public async sync(commonRequest: CommonRequest) {
    console.log("[Vendor Entity DAO] sync...")
    try {
      let vendor: VendorAttributes = commonRequest.body?.vendor;
      const vendorBusinessUnitBody: VendorBusinessUnitAttributes[] = commonRequest.body?.businessUnit;

      let vendorFinal: VendorDeltaSink;
      let vendorBusinessUnitFinal: VendorBusinessUnitDeltaSink;
      const vendorBusinessUnitFinalList: VendorBusinessUnitDeltaSink[] = [];

      const vendorTransactionData: VendorEntityModelDto = await this.prisma.$transaction(async (tx: any) => {
        // remove unregistered fields
        vendor = helper.stripPrisma(this.prisma.vendor, vendor);

        vendor.uniqueKey = String(vendor.vendorCode)
        // Trasform workaround wrong datatype
        if (vendor.isBlocked !== null) {
          vendor.isBlocked = String(vendor.isBlocked )
        }

        const dataValues: VendorAttributes = await tx.vendor.upsert({
          where: {
            vendorCode: vendor.vendorCode,
          },
          update: {
            ...vendor
          },
          create: {
            ...vendor
          },
        });
        if (dataValues) {
          this.setParentSource(dataValues);
          const vendorId: number = dataValues.vendorId;
          vendorFinal = dataValues;
          vendorFinal.entity = DELTA_SINK.ENTITY.VENDOR;
          vendorFinal.action = DELTA_SINK.ACTION.VENDOR;
          vendorFinal.status = DELTA_SINK.STATUS;
          if (vendorBusinessUnitBody && vendorBusinessUnitBody.length >= 1) {
              await Promise.all(vendorBusinessUnitBody.map(async (vendorBusinessUnit: VendorBusinessUnitAttributes) => {

                // remove unregistered fields
                vendorBusinessUnit = helper.stripPrisma(this.prisma.vendorBusinessUnit, vendorBusinessUnit);

                vendorBusinessUnit.vendorId = vendorId;
                const vendorBUdataValues: VendorBusinessUnitAttributes = this.addAuditAttribute(vendorBusinessUnit);
                const vendorBUData: any = await tx.vendorBusinessUnit.upsert({
                  where: {
                    businessUnitId_vendorId: {
                      businessUnitId: vendorBusinessUnit.businessUnitId,
                      vendorId: vendorBusinessUnit.vendorId
                    }
                  },
                  update: {
                    ...vendorBUdataValues
                  },
                  create: {
                    ...vendorBUdataValues
                  },
                });
                if (vendorBUData) {
                  vendorBusinessUnitFinal = vendorBUData;
                  vendorBusinessUnitFinal.entity = DELTA_SINK.ENTITY.VENDOR_BUSINESS_UNIT;
                  vendorBusinessUnitFinal.action = DELTA_SINK.ACTION.VENDOR_BUSINESS_UNIT
                  vendorBusinessUnitFinal.status = DELTA_SINK.STATUS;
                  vendorBusinessUnitFinalList.push(vendorBusinessUnitFinal);
                }
              })); // promise end customerBusinessUnitBody
          }
        }
        const customerEntityModelDto: VendorEntityModelDto = {
          vendor: vendorFinal,
          businessUnit: vendorBusinessUnitFinalList,
        };

        return customerEntityModelDto;
      },
      {
        maxWait: this.maxWait, // default: 2000
        timeout: this.timeout, // default: 5000
      }
      ); // trasaction end

      return vendorTransactionData;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    } finally {
    }
  }

}



