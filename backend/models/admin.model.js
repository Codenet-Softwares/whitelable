import { DataTypes } from "sequelize";
import {sequelize} from "../db.js";
import bcrypt from "bcrypt";

const admins = sequelize.define(
  "admins",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    walletId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLoginTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdByUser: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    hyperActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    masterActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    superActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    whiteActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subHyperActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subAdminActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subMasterActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subSuperActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subWhiteActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    checkActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    loginStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exposure: {
      type: DataTypes.INTEGER,
      defaultValue: 0.0,
    },
    isReset: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    token: {
      type: DataTypes.TEXT,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPermanentDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

admins.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default admins;
