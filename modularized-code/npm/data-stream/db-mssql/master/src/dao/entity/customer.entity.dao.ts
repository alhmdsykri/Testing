import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { DatabaseCredential } from "../../private/database.credential"
import { sequelizer } from "../../private/initialize.database";
import { Customer, CustomerBusinessUnit, CustomerContact } from "../../models/index";
import { CustomerEntityModelDto } from "../../dto/index";
import { CustomerAttributes, CustomerBusinessUnitAttributes, CustomerContactAttributes } from "../../models/interface/index";
import { DML, CustomerDeltaSink, CustomerBusinessUnitDeltaSink, CustomerContactDeltaSink } from "../../interface/index"
import Sequelize from 'sequelize';
import * as _ from "lodash";

// sequelize Direct object to dabase connection
import { sequelize } from "../../private/database";

const Op = Sequelize.Op;

export class CustomerEntityDao extends AuditClass<CustomerAttributes> implements DML<CommonRequest> {
  private logger: any = Logger.getLogger("./dao/entity/customer-contract/customer-contract.dao")
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
   * This Function use to upsert data from Customer, CustomerBusinessUnit and customerContact
   * @param commonRequest 
   * @return CustomerEntityModelDto
   */
  public async sync(commonRequest: CommonRequest) {
    console.log("[Customer Entity DAO] sync...")

    try {
      const customer: CustomerAttributes = commonRequest.body?.customer;
      const customerBusinessUnitBody: CustomerBusinessUnitAttributes[] = commonRequest.body?.customerBusinessUnit;
      const customerContactBody: CustomerContactAttributes[] = commonRequest.body?.customerContact;
      let customerFinal: CustomerDeltaSink;
      let customerBusinessUnitFinal: CustomerBusinessUnitDeltaSink;
      const customerBusinessUnitFinalList: CustomerBusinessUnitDeltaSink[] = [];
      let customerContactFinal: CustomerContactDeltaSink;
      const customerContactFinalList: CustomerContactDeltaSink[] = [];

      const customerTransactionData: CustomerEntityModelDto = await sequelize.transaction(async (t: any) => {
        // Upsert to DB
        customer.uniqueKey = String(customer.customerCode)
        const custData: any = await Customer.upsert(customer, { transaction: t });
        if (custData && Array.isArray(custData) && custData.length >= 1) {
          const dataValues: CustomerAttributes = custData[0].dataValues;
          this.setParentSource(dataValues);
          const customerId: number = dataValues.customerId;
          customerFinal = dataValues;
          customerFinal.entity = DELTA_SINK.ENTITY.CUSTOMER;
          customerFinal.action = DELTA_SINK.ACTION.CUSTOMER
          customerFinal.status = DELTA_SINK.STATUS;
          if (customerBusinessUnitBody && customerBusinessUnitBody.length >= 1) {
              await Promise.all(customerBusinessUnitBody.map(async (customerBusinessUnit: CustomerBusinessUnitAttributes) => {
                customerBusinessUnit.customerId = customerId;
                customerBusinessUnit = this.addAuditAttribute(customerBusinessUnit);
                // Upsert to DB
                const custBUData: any = await CustomerBusinessUnit.upsert(customerBusinessUnit,
                  {
                    transaction: t,
                    logging:false
                  });
                if (custBUData && Array.isArray(custBUData) && custBUData.length >= 1) {
                  const custBUdataValues: CustomerBusinessUnitAttributes = custBUData[0].dataValues;
                  customerBusinessUnitFinal = custBUdataValues;
                  customerBusinessUnitFinal.entity = DELTA_SINK.ENTITY.CUSTOMER_BUSINESS_UNIT;
                  customerBusinessUnitFinal.action = DELTA_SINK.ACTION.CUSTOMER_BUSINESS_UNIT;
                  customerBusinessUnitFinal.status = DELTA_SINK.STATUS;
                  customerBusinessUnitFinalList.push(customerBusinessUnitFinal);
                }
              })); // promise end customerBusinessUnitBody
          }
          if (customerContactBody && customerContactBody.length >= 1) {
              await Promise.all(customerContactBody.map(async (customerContact: CustomerContactAttributes) => {
                customerContact.customerId = customerId;
                customerContact = this.addAuditAttribute(customerContact);
                // Upsert to DB
                const custContactData: any = await CustomerContact.upsert(customerContact, { transaction: t });
                if (custContactData && Array.isArray(custContactData) && custContactData.length >= 1) {
                  const cContactdataValues: CustomerContactAttributes = custContactData[0].dataValues;
                  customerContactFinal = cContactdataValues;
                  customerContactFinal.entity = DELTA_SINK.ENTITY.CUSTOMER_CONTACT;
                  customerContactFinal.action = DELTA_SINK.ACTION.CUSTOMER_CONTACT;
                  customerContactFinal.status = DELTA_SINK.STATUS;
                  customerContactFinalList.push(customerContactFinal);
                }
              })); // promise end customerContactBody
          }
        }
        const customerEntityModelDto: CustomerEntityModelDto = {
          customer: customerFinal,
          customerBusinessUnit: customerBusinessUnitFinalList,
          customerContact: customerContactFinalList
        };

        return customerEntityModelDto;
      }); // trasaction end

      return customerTransactionData;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    }
  }
}




