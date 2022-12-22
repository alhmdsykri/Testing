import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest, CommonResponseListDto, RECORD_STATUS } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { DatabaseCredential } from "../../private/database.credential"
import { sequelizer } from "../../private/initialize.database";
import { CustomerContractEntityModelDto } from "../../dto/index";
import { CustomerContract, CustomerContractItem } from "../../models/index";
import { CustomerContractAttributes, CustomerContractItemAttributes } from "../../models/interface/index";
import { DML, CustomerContractDeltaSink, CustomerContractItemDeltaSink  } from "../../interface/index"
import Sequelize from 'sequelize';

// sequelize Direct object to dabase connection
import { sequelize } from "../../private/database";

const Op = Sequelize.Op;

export class CustomerContractEntityDao extends AuditClass<CustomerContractAttributes> implements DML<CommonRequest>  {
  private logger: any = Logger.getLogger("./dao/mssql/user.dao")
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
   * This Function use to upsert data from Vendor and VendorBusinessUnit
   * @param commonRequest 
   * @return VendorEntityModelDto
   */
    public async sync(commonRequest: CommonRequest) {
      console.log("[CustomerContract Entity DAO] sync...")

      try {
        const customerContract: CustomerContractAttributes = commonRequest.body?.customerContract;
        let customerContractItem: CustomerContractItemAttributes = commonRequest.body?.customerContractItem;

        let customerContactFinal: CustomerContractDeltaSink;
        let customerContactItemFinal: CustomerContractItemDeltaSink;

        const customerContactItemTransactionData: CustomerContractEntityModelDto = await sequelize.transaction(async (t: any) => {
          let ccData: any = {};
          let dataValues: CustomerContractAttributes;

          if (!customerContract.customerContractId) {
            console.log("-=- create customer contract-=-")
            ccData = await CustomerContract.create(customerContract, { transaction: t });
            dataValues = ccData.dataValues;
          } else {
            console.log("-=- upsert customer contract-=-")
            ccData = await CustomerContract.upsert(customerContract, { transaction: t });
            dataValues = ccData[0].dataValues;
          }

          if (dataValues) {
            this.setParentSource(dataValues);
            const customerContractId: number = dataValues.customerContractId;
            customerContactFinal = dataValues;
            customerContactFinal.entity = DELTA_SINK.ENTITY.CUSTOMER_CONTRACT;
            customerContactFinal.action = DELTA_SINK.ACTION.CUSTOMER_CONTRACT;
            customerContactFinal.status = DELTA_SINK.STATUS;
            if (customerContractItem) {
              customerContractItem.customerContractId = customerContractId;
              customerContractItem = this.addAuditAttribute(customerContractItem);
              customerContractItem.uniqueKey = String(customerContractId)

              let cContractItemData: any;
              let cContractItemDataValue: CustomerContractItemAttributes;
              if (!customerContractItem.customerContractItemId) {
                console.log("-=- create customer contract item-=-")
                cContractItemData = await CustomerContractItem.create(customerContractItem, { transaction: t });
                cContractItemDataValue = cContractItemData?.dataValues;
              } else {
                console.log("-=- upsert customer contract item-=-")
                cContractItemData = await CustomerContractItem.upsert(customerContractItem, { transaction: t });
                cContractItemDataValue = cContractItemData[0]?.dataValues;
              }
              customerContactItemFinal = cContractItemDataValue;
              customerContactItemFinal.entity = DELTA_SINK.ENTITY.CUSTOMER_CONTRACT_ITEM;
              customerContactItemFinal.action = DELTA_SINK.ACTION.CUSTOMER_CONTRACT_ITEM;
              customerContactItemFinal.status = DELTA_SINK.STATUS;
            }
          }

          const customerEntityModelDto: CustomerContractEntityModelDto = {
            customerContract: customerContactFinal,
            customerContractItem: customerContactItemFinal
          };
          return customerEntityModelDto;
        }); // trasaction end

        return customerContactItemTransactionData;
      } catch (error) {
        throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
      }
    }
}



