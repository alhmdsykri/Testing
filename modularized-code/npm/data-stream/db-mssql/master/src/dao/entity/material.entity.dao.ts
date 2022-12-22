import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest, CommonResponseListDto, RECORD_STATUS } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { DatabaseCredential } from "../../private/database.credential"
import { sequelizer } from "../../private/initialize.database";
import { Material, MaterialItem } from "../../models/index";
import { MaterialEntityModelDto } from "../../dto/index";
import { MaterialAttributes, MaterialItemAttributes } from "../../models/interface/index";
import { DML, MaterialDeltaSink, MaterialItemDeltaSink } from "../../interface/index"
import Sequelize from 'sequelize';


// sequelize Direct object to dabase connection
import { sequelize } from "../../private/database";

const Op = Sequelize.Op;

export class MaterialEntityDao extends AuditClass<MaterialAttributes> implements DML<CommonRequest> {
  private logger: any = Logger.getLogger("./dao/entity/material/material.dao")
  private trace: any;
  private traceFileName: any;

  constructor(host: string | null, username: string | null, password: string | null, databaseName: string | null) {
    super()
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    DatabaseCredential.set(host, username, password, databaseName);
    if (host) {
      sequelizer.sync();
    }
  }

   /**
   * This Function use to upsert data from Material and MaterialItem
   * @param commonRequest 
   * @return MaterialEntityModelDto
   */
    public async sync(commonRequest: CommonRequest) {
      console.log("[Material Entity DAO] sync...")
  
      try {
        const material: MaterialAttributes = commonRequest.body?.material;
        const materialItemBody: MaterialItemAttributes[] = commonRequest.body?.materialItem;
  
        let materialFinal: MaterialDeltaSink;
        let materialItemFinalList: MaterialItemDeltaSink[] = [];
        const materialData: MaterialEntityModelDto = await sequelize.transaction(async (t: any) => {
          let materialData: any = {};
          let materialDataValue: MaterialAttributes;
          material.uniqueKey = String(material.materialCode)
            const materialResult: any = await Material.findOne({
              where: { materialCode: material.materialCode },
            });
            if (materialResult) {
              console.log("-=-=- update -=-")
              materialData = await Material.update(material,
                {
                  transaction: t, returning: true, where: { materialCode: material.materialCode }
                }
              );
            } else {
              console.log("-=-=- create -=-")
              materialData = await Material.create(material, { transaction: t });
            }
            if (materialData && Array.isArray(materialData) && materialData.length > 0) {
              console.log("-=-=- array -=- ", materialData)
              materialDataValue = materialData[1][0]?.dataValues;
            } else {
              console.log("-=-=- NOT array -=- ", materialData)
              materialDataValue = materialData?.dataValues;
            }
          console.log("-=-=-=-=- materialDataValue >>> ", materialDataValue)
          if (materialDataValue) {
            this.setParentSource(materialDataValue);
            const materialId: number = materialDataValue.materialId;  
            materialFinal = materialDataValue;
            materialFinal.entity = DELTA_SINK.ENTITY.MATERIAL;
            materialFinal.action = DELTA_SINK.ACTION.MATERIAL;
            materialFinal.status = DELTA_SINK.STATUS;
            if (materialItemBody && materialItemBody.length >= 1) {
                await Promise.all(materialItemBody.map(async (materialItem: MaterialItemAttributes) => {
                  let materialItemFinal: MaterialItemDeltaSink;
                  let materialItemData: any = {};
                  let materialItemDataValue: MaterialItemAttributes;

                  materialItem.materialId = materialId;
                  materialItem = this.addAuditAttribute(materialItem);
                  // await MaterialItem.upsert(materialItem, { transaction: t });

                  const filter: any = { 
                    materialId: materialDataValue.materialId,
                    businessUnitId: materialItem.businessUnitId,
                  }
                  const materialItemResult: any = await MaterialItem.findOne({
                    where: filter
                  });
                  if (materialItemResult) {
                    console.log("-=-=- update Item -=-")
                    materialItemData = await MaterialItem.update(materialItem,
                      {
                        transaction: t, returning: true, where: filter 
                      }
                    );
                  } else {
                    console.log("-=-=- create Item -=-")
                    materialItemData = await MaterialItem.create(materialItem, { transaction: t });
                  }
                  if (materialItemData && Array.isArray(materialItemData) && materialItemData.length > 0) {
                    console.log("-=-=- array item -=- ", materialItemData)
                    materialItemDataValue = materialItemData[1][0]?.dataValues;
                  } else {
                    console.log("-=-=- NOT array item -=- ", materialItemData)
                    materialItemDataValue = materialItemData?.dataValues;
                  }
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
        }); // trasaction end
  
        return materialData;
      } catch (error) {
        throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
      }
    }

}



