import { DataTypes } from 'sequelize';
import {sequelize} from '../db.js';

const announcementSchema = sequelize.define(
  'announcement',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    announceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    announcement: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'announcements',
    tableName: 'announcements',
    timestamps: true,
  },
);

export default announcementSchema;
