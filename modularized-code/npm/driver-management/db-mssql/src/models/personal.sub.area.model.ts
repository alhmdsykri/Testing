import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalSubAreaAttribute } from "./interfaces/";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalSubAreaAttributes = PersonalSubAreaAttribute;
const tableName: string = "PersonalSubArea";
export const ModelName: string = tableName;
export const PersonalSubArea: ModelDefined<
  PersonalSubAreaAttribute,
  PersonalSubAreaAttributes
> = sequelize.define(
  tableName,
  {
    personalSubAreaId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    personalSubAreaCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    personalSubAreaName: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    modifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    modifiedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
  },
  {
    tableName: "PersonalSubArea",
    schema: "dbo",
    timestamps: false,
    indexes: [
      {
        name: "PK_PersonalSubAreaId",
        unique: true,
        fields: [{ name: "personalSubAreaId" }],
      },
    ],
  }
);
