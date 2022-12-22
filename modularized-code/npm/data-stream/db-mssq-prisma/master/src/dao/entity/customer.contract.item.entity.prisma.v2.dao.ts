import * as stackTrace from "stack-trace";
import  { AuditClass } from "./etc/audit.class"
import { DELTA_SINK } from "../../constants/CONSTANTS.json"
import { CommonRequest } from "astrafms-common-dto-interface";
import { STATUS_CODE } from "../../constants/CONSTANTS.json";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CustomerContractEntityModelDto, CustomerContractItemEntityModelDto } from "../../dto/index";
import { CustomerContractAttributes, CustomerContractItemAttributes } from "../../models/interface/index";
import { DML, CustomerContractDeltaSink, CustomerContractItemDeltaSink  } from "../../interface/index"
import * as _ from "lodash";
import { PrismaClient } from "@prisma/client"
import { helper } from "../../utils/helper"

export class CustomerContractItemEntityPrismaV2Dao extends AuditClass<CustomerContractAttributes> implements DML<CommonRequest>  {
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
      console.log("[CustomerContractItem Entity DAO] Xsync...")
      try {
        const customerContract: CustomerContractAttributes = commonRequest.body?.customerContract;
        const customerContractItems: CustomerContractItemAttributes[] = commonRequest.body?.customerContractItem;
        let customerContactFinal: CustomerContractDeltaSink;
        let customerContactItemFinal: CustomerContractItemDeltaSink;
        const customerContactItemFinalList: CustomerContractItemDeltaSink[] = [];
        const validateCustomerContractId: any = await this.prisma.customerContract.findFirst({
          where: { customerContractId: customerContract.customerContractId },
        })

        if (!validateCustomerContractId) {
          throw new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `customerContractId Not Found ${customerContract.customerContractId}`,
            String(customerContract.transactionId)
          )
        }

        const customerContactItemTransactionData: CustomerContractItemEntityModelDto = await this.prisma.$transaction(async (tx: any) => {

            this.setParentSource(customerContract);
            const customerContractId: number = customerContract.customerContractId;
            customerContactFinal = customerContract;
            customerContactFinal.entity = DELTA_SINK.ENTITY.CUSTOMER_CONTRACT;
            customerContactFinal.action = DELTA_SINK.ACTION.CUSTOMER_CONTRACT;
            customerContactFinal.status = DELTA_SINK.STATUS;
            if (customerContractItems && customerContractItems.length >= 1) {
                await Promise.all(customerContractItems.map(async (customerContractItem: CustomerContractItemAttributes) => {
                customerContractItem.customerContractId = customerContractId;
                customerContractItem = this.addAuditAttribute(customerContractItem);
                customerContractItem.uniqueKey = String(customerContractId) + String(customerContractItem.lineItemNumber)

                // remove un registered fields
                customerContractItem = helper.stripPrisma(this.prisma.customerContractItem, customerContractItem);

                const cContractItemDataValue: CustomerContractItemAttributes = await tx.customerContractItem.upsert({
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
                customerContactItemFinal = cContractItemDataValue;
                customerContactItemFinal.status = DELTA_SINK.STATUS;
                customerContactItemFinalList.push(customerContactItemFinal);
              }));
            }
            const customerItemEntityModelDto: CustomerContractItemEntityModelDto = {
              action: DELTA_SINK.ACTION.CUSTOMER_CONTRACT_ITEM,
              // entity: DELTA_SINK.ENTITY.CUSTOMER_CONTRACT_ITEM,
              transactionId: customerContract.transactionId,
              customerContractItem: customerContactItemFinalList
            };
            return customerItemEntityModelDto;
          },
          {
            maxWait: this.maxWait, // default: 2000
            timeout: this.timeout, // default: 5000
          }); // trasaction end
        return customerContactItemTransactionData;
      } catch (error: any) {
        throw applicationInsightsService.errorModel(error, "sync", this.traceFileName);
      } finally {
        // console.log("--customer contract finally called--")
        // await prisma.$disconnect()
      }
    }
}



