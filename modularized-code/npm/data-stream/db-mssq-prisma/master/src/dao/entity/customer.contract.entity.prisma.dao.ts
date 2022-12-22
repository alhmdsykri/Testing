import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { CustomerContractEntityModelDto, PrismaErrorModel } from "../../dto/index";
import { CustomerContractAttributes, CustomerContractItemAttributes } from "../../models/interface/index";
import { DML, CustomerContractDeltaSink, CustomerContractItemDeltaSink  } from "../../interface/index"
import * as _ from "lodash";
import { PrismaClient } from "@prisma/client"
import { helper } from "../../utils/helper"
// import { prismaErrorHelper } from "../../utils/prisma.error.helper"

export class CustomerContractEntityPrismaDao extends AuditClass<CustomerContractAttributes> implements DML<CommonRequest>  {
  private logger: any = Logger.getLogger("./dao/mssql/customer.contract.entity.prisma.dao")
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
   * This Function use to upsert data from CustomerContract and CustomerContractItem
   * @param commonRequest
   * @return CustomerContractEntityModelDto
   */
    public async sync(commonRequest: CommonRequest) {
      console.log("[CustomerContract Entity ORIGNAL DAO] sync...")
      // const prisma = new PrismaClient({
      //   log: ["query"],
      //   errorFormat: 'minimal'
      // });
      try {
        let customerContract: CustomerContractAttributes = commonRequest.body?.customerContract;
        const customerContractItems: CustomerContractItemAttributes[] = commonRequest.body?.customerContractItem;

        // remove unregistered fields
        customerContract = helper.stripPrisma(this.prisma.customerContract, customerContract);

        // let customerContractItem: CustomerContractItemAttributes = commonRequest.body?.customerContractItem;
        let customerContactFinal: CustomerContractDeltaSink;
        let customerContactItemFinal: CustomerContractItemDeltaSink;
        const customerContactItemFinalList: CustomerContractItemDeltaSink[] = [];

        const customerContactItemTransactionData: CustomerContractEntityModelDto = await this.prisma.$transaction(async (tx: any) => {

          this.prisma.$use(async (params: any, next: any) => {
            params.args.create.startDate = new Date(params.args.create.startDate);
            params.args.create.endDate = new Date(params.args.create.endDate);
            params.args.update.startDate = new Date(params.args.update.startDate);
            params.args.update.endDate = new Date(params.args.update.endDate);
            const result: any = await next(params)
            return result
          })

          const dataValues: CustomerContractAttributes = await tx.customerContract.upsert({
            where: {
              contractNumber: customerContract.contractNumber,
            },
            update: {
              ...customerContract
            },
            create: {
              ...customerContract
            },
          });
          if (dataValues) {
            this.setParentSource(dataValues);
            const customerContractId: number = dataValues.customerContractId;
            customerContactFinal = dataValues;
            customerContactFinal.entity = DELTA_SINK.ENTITY.CUSTOMER_CONTRACT;
            customerContactFinal.action = DELTA_SINK.ACTION.CUSTOMER_CONTRACT;
            customerContactFinal.status = DELTA_SINK.STATUS;
            if (customerContractItems && customerContractItems.length >= 1) {
                await Promise.all(customerContractItems.map(async (customerContractItem: CustomerContractItemAttributes) => {

                // remove unregistered fields
                customerContractItem = helper.stripPrisma(this.prisma.customerContractItem, customerContractItem);

                customerContractItem.customerContractId = customerContractId;
                customerContractItem = this.addAuditAttribute(customerContractItem);
                customerContractItem.uniqueKey = String(customerContractId)
                let cContractItemDataValue: CustomerContractItemAttributes = await tx.customerContractItem.upsert({
                  where: {
                    lineItemNumber_customerContractId: {
                      lineItemNumber: customerContractItem.lineItemNumber,
                      customerContractId: customerContractItem.customerContractId
                    }
                  },
                  update: {
                    ...customerContractItem
                  },
                  create: {
                    ...customerContractItem
                  },
                });
                cContractItemDataValue = _.omit(cContractItemDataValue, ["$action", "persistedDate"]) as CustomerContractItemAttributes;
                customerContactItemFinal = cContractItemDataValue;
                customerContactItemFinal.status = DELTA_SINK.STATUS;
                   customerContactItemFinalList.push(customerContactItemFinal);
              }));
            }
          }
          const customerEntityModelDto: CustomerContractEntityModelDto = {
            customerContract: customerContactFinal,
            customerContractItem: customerContactItemFinalList
          };
          return customerEntityModelDto;
        },
        {
          maxWait: this.maxWait, // default: 2000
          timeout: this.timeout, // default: 5000
        }
        ); // trasaction end

        return customerContactItemTransactionData;
      } catch (error: any) {
        // const err: any = prismaErrorHelper.getPrismaErrorInstance(error);
        throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
      } finally {
        // console.log("--customer contract finally called--")
        // await prisma.$disconnect()
      }
    }
}



