import { applicationInsightsService } from "astrafms-services-error-logging";
import * as stackTrace from "stack-trace";
import { Customer, CustomerBusinessUnit, CustomerContact, 
         Vendor, VendorBusinessUnit,
         CustomerContract, CustomerContractItem,
         Material, MaterialItem } from "../models/index";
import { sequelize } from "./database";

class Sequelizer {

  private trace: any;
  private traceFileName: any;

  constructor() {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
  }

  public async sync() {
    try {

      // initialize models
      // const models = {
      //   role: CustomerContract,
      // };

      // Associate Tables and create Foreign key
      // onDelete: "CASCADE" - when the vehicle was deleted, the child fk will set to null
      if (Object.keys(Customer.associations).length === 0 && Object.keys(Vendor.associations).length === 0
            && Object.keys(CustomerContract.associations).length === 0
      ) {

        console.log("-=-= table sync start -=-=-")

        Customer.hasMany(CustomerBusinessUnit,
          { foreignKey: "customerId", sourceKey: "customerId", as: "cb" },
        );
        Customer.hasMany(CustomerContact,
          { foreignKey: "customerId", sourceKey: "customerId", as: "cc" },
        );
        CustomerBusinessUnit.belongsTo(Customer,
          {
            foreignKey: "customerId", targetKey: "customerId" as "uru"
          }
        );
        CustomerContact.belongsTo(Customer,
          {
            foreignKey: "customerId", targetKey: "customerId" as "ccc"
          }
        );

        Customer.hasMany(CustomerContract,
          { foreignKey: "customerId", sourceKey: "customerId", as: "cmcct" },
        );
        CustomerContract.belongsTo(CustomerContract,
          {
            foreignKey: "parentContractId", targetKey: "parentContractId" as "ccIid"
          }
        );
        CustomerContract.hasMany(CustomerContractItem,
          { foreignKey: "customerContractId", sourceKey: "customerContractId", as: "cctItm" },
        );
        CustomerContractItem.belongsTo(CustomerContract,
          {
            foreignKey: "customerContractId", targetKey: "customerContractId" as "itmcc"
          }
        );


        Vendor.hasMany(VendorBusinessUnit,
          { foreignKey: "vendorId", sourceKey: "vendorId", as: "vbu" },
        );
        VendorBusinessUnit.belongsTo(Vendor,
          {
            foreignKey: "vendorId", targetKey: "vendorId" as "buv"
          }
        );

        Material.hasMany(MaterialItem,
          { foreignKey: "materialId", sourceKey: "materialId", as: "mmi" },
        );
        MaterialItem.belongsTo(Material,
          {
            foreignKey: "materialId", targetKey: "materialId" as "mim"
          }
        );


        // Create the table
        const db = await sequelize.sync();
        // Alter the table
        // await sequelize.sync({alter: true});
      }
    } catch (error) {
      console.log("@@ table sync start error => ", error)
      // applicationInsightsService.errorModel(error, "sequelizeSync", this.traceFileName);
    }
  }
}

export const sequelizer = new Sequelizer();