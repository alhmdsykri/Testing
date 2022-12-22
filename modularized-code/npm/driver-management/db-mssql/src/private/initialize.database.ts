import { applicationInsightsService } from "astrafms-services-error-logging";
import * as stackTrace from "stack-trace";
import { PersonalData } from "../models/personal.data.model";
import { PersonalContract } from "../models/personal.contract.model";
import { PersonalCicoPool } from "../models/personal.cico.pool.model";
import { PersonalMCU } from "../models/personal.mcu.model";
import { MCUTypeResult } from "../models/mcu.result.type.model";
import { IdentityType } from "../models/identity.type.model";
import { ContractType } from "../models/contract.type.model";
import { Bank } from "../models/bank.model";
import { PersonalWorkingExperience } from "../models/personal.working.experience.model";
import { sequelize } from "./database";
import { PersonalIdentity } from "../models/personal.identity.model";
import { Gender } from "../models/gender.model";
import { Nationality } from "../models/nationality.model";
import { Religion } from "../models/religion.model";
import { City } from "../models/city.model";
import { Province } from "../models/province.model";
import { Country } from "../models/country.model";
import { AddressType } from "../models/address.type.model";
import { PersonalEducation } from "../models/personal.education.model";
import { EducationType } from "../models/education.type.model";
import { RelationType } from "../models/relation.type.model";
import { PersonalFamily } from "../models/personal.family";
import { PersonalAddress } from "../models/personal.address";
import { MaritalStatus } from "../models/marital.status.model";
import { PersonalAbility } from "../models/personal.ability.model";
import { Ability } from "../models/ability.model";
import { AbilityType } from "../models/ability.type.model";




class Sequelizer {
  private trace: any;
  private traceFileName: any;

  constructor() {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
  }

  public async sync() {
    try {
      // Associate Tables and create Foreign key
      if (Object.keys(PersonalData.associations).length === 0 && Object.keys(PersonalContract.associations).length === 0 && Object.keys(PersonalIdentity.associations).length === 0 && Object.keys(PersonalMCU.associations).length === 0
        && Object.keys(PersonalAddress.associations).length === 0 && Object.keys(PersonalEducation.associations).length === 0 && Object.keys(PersonalFamily.associations).length === 0 && Object.keys(PersonalCicoPool.associations).length === 0
        && Object.keys(Province.associations).length === 0 && Object.keys(PersonalAbility.associations).length === 0 && Object.keys(Ability.associations).length === 0) {
        PersonalData.hasMany(PersonalContract, {
          foreignKey: "personalDataId",
          sourceKey: "personalDataId",
        });
        PersonalData.hasMany(PersonalCicoPool, {
          foreignKey: "personalDataId",
          sourceKey: "personalDataId",
        });
        PersonalData.hasMany(PersonalWorkingExperience, {
          foreignKey: "personalDataId",
          sourceKey: "personalDataId",
        });
        PersonalData.hasMany(PersonalIdentity, {
          foreignKey: "personalDataId",
          sourceKey: "personalDataId",
        });
        PersonalData.hasMany(PersonalMCU, {
          foreignKey: "personalDataId",
          sourceKey: "personalDataId",
        });
        PersonalContract.belongsTo(ContractType, {
          foreignKey: "contractTypeCode",
          targetKey: "contractTypeCode",
        });
        PersonalIdentity.belongsTo(IdentityType, {
          foreignKey: "identityTypeId",
          targetKey: "identityTypeId",
        });
        PersonalMCU.belongsTo(MCUTypeResult, {
          foreignKey: "mcuTypeResultId",
          targetKey: "mcuTypeResultId",
        });
        PersonalData.belongsTo(Bank, {
          foreignKey: "bankId",
          targetKey: "bankId",
        });
        PersonalData.belongsTo(Gender, { foreignKey: "genderId" });
        PersonalData.belongsTo(Nationality, { foreignKey: "nationalityId" });
        PersonalData.belongsTo(Religion, { foreignKey: "religionId" });
        PersonalAddress.belongsTo(City, { foreignKey: "cityId" });
        City.belongsTo(Province, { foreignKey: "provinceId" });
        PersonalAddress.belongsTo(AddressType, { foreignKey: "addressTypeCode" });
        PersonalData.belongsTo(MaritalStatus, { foreignKey: "maritalStatusId" });
        PersonalEducation.belongsTo(EducationType, {
          foreignKey: "educationTypeId",
        });
        PersonalFamily.belongsTo(Gender, { foreignKey: "genderId" });
        PersonalFamily.belongsTo(RelationType, {
          foreignKey: "relationTypeCode",
        });
        PersonalCicoPool.belongsTo(PersonalData, {
          foreignKey: "personalDataId",
        });
        Province.belongsTo(Nationality, {
          foreignKey: "countryId",
          targetKey: "nationalityId",
        });
        //ability
        PersonalAbility.belongsTo(Ability, { foreignKey: "abilityId" });
        Ability.belongsTo(AbilityType, { foreignKey: "abilityTypeId" });

      }



      // Create the table
      const db = await sequelize.sync();
      console.log("Sequelize READY");
    } catch (error) {
      console.log("@@ error => ", error);
      throw applicationInsightsService.errorModel(
        error,
        "sequelizeSync",
        this.traceFileName
      );
    }
  }
}

export const sequelizer = new Sequelizer();
