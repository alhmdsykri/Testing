import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { CustomerEntityModelDto } from "../../dto/index";
import { CustomerAttributes, CustomerBusinessUnitAttributes, CustomerContactAttributes } from "../../models/interface/index";
import { DML, CustomerDeltaSink, CustomerBusinessUnitDeltaSink, CustomerContactDeltaSink } from "../../interface/index"
import * as _ from "lodash";
import { PrismaClient } from '@prisma/client'
import { helper } from "../../utils/helper"

export class CustomerEntityPrismaDao extends AuditClass<CustomerAttributes> implements DML<CommonRequest> {
  private logger: any = Logger.getLogger("./dao/entity/customer-contract/customer.entity.prisma.dao")
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
   * This Function use to upsert data from Customer, CustomerBusinessUnit and customerContact
   * @param commonRequest 
   * @return CustomerEntityModelDto
   */
  public async sync(commonRequest: CommonRequest) {
    console.log("[Customer Entity DAO] sync...")
    try {
      let customer: CustomerAttributes = commonRequest.body?.customer;
      const customerBusinessUnitBody: CustomerBusinessUnitAttributes[] = commonRequest.body?.customerBusinessUnit;
      const customerContactBody: CustomerContactAttributes[] = commonRequest.body?.customerContact;
      let dataValues: CustomerAttributes
      let customerFinal: CustomerDeltaSink;
      let customerBusinessUnitFinal: CustomerBusinessUnitDeltaSink;
      const customerBusinessUnitFinalList: CustomerBusinessUnitDeltaSink[] = [];
      let customerContactFinal: CustomerContactDeltaSink;
      const customerContactFinalList: CustomerContactDeltaSink[] = [];

      const customerTransactionData: CustomerEntityModelDto = await this.prisma.$transaction(async (tx: any) => {
        // remove unregistered fields
        customer = helper.stripPrisma(this.prisma.customer, customer);

        // Upsert to DB
          customer.uniqueKey = String(customer.customerCode)
          dataValues = await tx.customer.upsert({
            where: {
              customerCode: customer.customerCode,
            },
            update: {
              ...customer
            },
            create: {
              ...customer
            },
          });
          if (dataValues) {
            this.setParentSource(dataValues);
            const customerId: number = dataValues.customerId;
            customerFinal = dataValues;
            customerFinal.entity = DELTA_SINK.ENTITY.CUSTOMER;
            customerFinal.action = DELTA_SINK.ACTION.CUSTOMER
            customerFinal.status = DELTA_SINK.STATUS;
          if (customerBusinessUnitBody && customerBusinessUnitBody.length >= 1) {
              await Promise.all(customerBusinessUnitBody.map(async (customerBusinessUnit: CustomerBusinessUnitAttributes) => {

                // remove unregistered fields
                customerBusinessUnit = helper.stripPrisma(this.prisma.customerBusinessUnit, customerBusinessUnit);

                customerBusinessUnit = _.omit(customerBusinessUnit, ["businessUnitCode"]);
                customerBusinessUnit.customerId = customerId;
                customerBusinessUnit = this.addAuditAttribute(customerBusinessUnit);
                // Upsert to DB
                const custBUdataValues: CustomerBusinessUnitAttributes = await tx.customerBusinessUnit.upsert({
                  where: {
                    customerId_businessUnitId: {
                      customerId,
                      businessUnitId: customerBusinessUnit.businessUnitId
                    }
                  },
                  update: {
                    ...customerBusinessUnit
                  },
                  create: {
                    ...customerBusinessUnit
                  },
                });
                if (custBUdataValues) {
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
                // Trasform workaround wrong datatype
                if (customerContact.position !== null) {
                  customerContact.position = String(customerContact.position )
                }

                // remove unregistered fields
                customerContact = helper.stripPrisma(this.prisma.customerContact, customerContact);

                customerContact.customerId = customerId;
                customerContact = this.addAuditAttribute(customerContact);
                // Upsert to DB
                const cContactdataValues: CustomerContactAttributes = await tx.customerContact.upsert({
                  where: {
                    customerId_customerContactCode: {
                      customerId,
                      customerContactCode: customerContact.customerContactCode
                    }
                  },
                  update: {
                    ...customerContact
                  },
                  create: {
                    ...customerContact
                  },
                });
                if (cContactdataValues) {
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
      },
      {
        maxWait: this.maxWait, // default: 2000
        timeout: this.timeout, // default: 5000
      }
      ); // trasaction end

      return customerTransactionData;
    } catch (error) {
      // const err: any = prismaErrorHelper.getPrismaErrorInstance(error);
      throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
    } finally {
      // console.log("--customer finally called--")
      // await prisma.$disconnect()
    }
  }
}




