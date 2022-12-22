import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest, CommonResponseListDto, RECORD_STATUS } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { DatabaseCredential } from "../../private/database.credential"
import { sequelizer } from "../../private/initialize.database";
import { helper } from "../../utils/helper";
import { Vendor, VendorBusinessUnit } from "../../models/index";
import { VendorEntityModelDto } from "../../dto/index";
import { VendorAttributes, VendorBusinessUnitAttributes } from "../../models/interface/index";
import { DML, VendorDeltaSink, VendorBusinessUnitDeltaSink } from "../../interface/index"
import Sequelize from 'sequelize';

// sequelize Direct object to dabase connection
import { sequelize } from "../../private/database";

const Op = Sequelize.Op;

export class VendorEntityDao extends AuditClass<VendorAttributes> implements DML<CommonRequest> {
  private logger: any = Logger.getLogger("./dao/entity/vendor.entity.dao")
  private trace: any;
  private traceFileName: any;

  constructor(host: string | null, username: string | null, password: string | null, databaseName: string | null) {
    super();
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    DatabaseCredential.set(host, username, password, databaseName);
    if (host) {
      sequelizer.sync();
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
      const vendor: VendorAttributes = commonRequest.body?.vendor;
      const vendorBusinessUnitBody: VendorBusinessUnitAttributes[] = commonRequest.body?.businessUnit;

      let vendorFinal: VendorDeltaSink;
      let vendorBusinessUnitFinal: VendorBusinessUnitDeltaSink;
      const vendorBusinessUnitFinalList: VendorBusinessUnitDeltaSink[] = [];

      const vendorTransactionData: VendorEntityModelDto = await sequelize.transaction(async (t: any) => {
        vendor.uniqueKey = String(vendor.vendorCode)
        const vendData: any = await Vendor.upsert(vendor, { transaction: t });
        if (vendData && Array.isArray(vendData) && vendData.length >= 1) {
          const dataValues: VendorAttributes = vendData[0].dataValues;
          this.setParentSource(dataValues);
          const vendorId: number = dataValues.vendorId;  
          vendorFinal = dataValues;
          vendorFinal.entity = DELTA_SINK.ENTITY.VENDOR;
          vendorFinal.action = DELTA_SINK.ACTION.VENDOR;
          vendorFinal.status = DELTA_SINK.STATUS;
          if (vendorBusinessUnitBody && vendorBusinessUnitBody.length >= 1) {
              await Promise.all(vendorBusinessUnitBody.map(async (vendorBusinessUnit: VendorBusinessUnitAttributes) => {
                vendorBusinessUnit.vendorId = vendorId;
                vendorBusinessUnit = this.addAuditAttribute(vendorBusinessUnit);
                const vendorBUData: any = await VendorBusinessUnit.upsert(vendorBusinessUnit, { transaction: t });
                if (vendorBUData && Array.isArray(vendorBUData) && vendorBUData.length >= 1) {
                  const vendorBUdataValues: VendorBusinessUnitAttributes = vendorBUData[0].dataValues;
                  vendorBusinessUnitFinal = vendorBUdataValues;
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
      }); // trasaction end

      return vendorTransactionData;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    }
  }

}



