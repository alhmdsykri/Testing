import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest, CommonResponseListDto, RECORD_STATUS } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { MaterialEntityModelDto } from "../../dto/index";
import { MaterialAttributes, MaterialItemAttributes } from "../../models/interface/index";
import { DML, MaterialDeltaSink, MaterialItemDeltaSink } from "../../interface/index"
import * as _ from "lodash";
import { PrismaClient } from "@prisma/client"
import { helper } from "../../utils/helper"

export class MaterialEntityPrismaDao extends AuditClass<MaterialAttributes> implements DML<CommonRequest> {
  private logger: any = Logger.getLogger("./dao/entity/material/material.dao")
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

  async sync(commonRequest: CommonRequest) {
    console.log("[Material Entity DAO] sync...")
    // const prisma = new PrismaClient({ log: ["query"]});
    try {
      let material: MaterialAttributes = commonRequest.body?.material;
      const materialItemBody: MaterialItemAttributes[] = commonRequest.body?.materialItem;
      let materialDataValue: MaterialAttributes;
      material.uniqueKey = String(material.materialCode)

      let materialFinal: MaterialDeltaSink;
      const materialItemFinalList: MaterialItemDeltaSink[] = [];

       const materialFinalEntityModelDto: any = await this.prisma.$transaction(async (tx: any) => {

        // remove unregistered fields
        material = helper.stripPrisma(this.prisma.material, material);

        materialDataValue = await tx.material.upsert({
          where: {
            materialCode: material.materialCode,
          },
          update: {
            ...material
          },
          create: {
            ...material
          },
        });
        if (materialDataValue) {
          this.setParentSource(materialDataValue);
          const materialId: number = materialDataValue.materialId;
          materialFinal = materialDataValue;
          materialFinal.entity = DELTA_SINK.ENTITY.MATERIAL;
          materialFinal.action = DELTA_SINK.ACTION.MATERIAL;
          materialFinal.status = DELTA_SINK.STATUS;
          if (materialItemBody && materialItemBody.length >= 1) {
              await Promise.all(materialItemBody.map(async (materialItem: MaterialItemAttributes) => {
                // remove unregistered fields
                materialItem = helper.stripPrisma(this.prisma.materialItem, materialItem);

                let materialItemFinal: MaterialItemDeltaSink;
                let materialItemDataValue: MaterialItemAttributes;
                materialItem = _.omit(materialItem, ["status"]);
                materialItem.materialId = materialId;
                materialItem = this.addAuditAttribute(materialItem);

                materialItemDataValue = await tx.materialItem.upsert({
                  where: {
                    materialId_businessUnitId: {
                      materialId: materialItem.materialId,
                      businessUnitId: materialItem.businessUnitId
                    }
                  },
                  update: {
                    ...materialItem
                  },
                  create: {
                    ...materialItem
                  },
                });
                materialItemFinal = materialItemDataValue;
                materialItemFinal.entity = DELTA_SINK.ENTITY.MATERIAL_ITEM;
                materialItemFinal.action = DELTA_SINK.ACTION.MATERIAL_ITEM
                materialItemFinal.status = DELTA_SINK.STATUS;
                materialItemFinalList.push(materialItemFinal);
              })); // promise end
          }
        }
        const materialEntityModelDto: MaterialEntityModelDto = {
          material: materialFinal,
          materialItem: materialItemFinalList,
        };
        return materialEntityModelDto;
      },
      {
        maxWait: this.maxWait, // default: 2000
        timeout: this.timeout, // default: 5000
      });
      return materialFinalEntityModelDto;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    } finally {
    }
  }

}



