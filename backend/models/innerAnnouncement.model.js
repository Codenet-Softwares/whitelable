import { DataTypes } from 'sequelize';
import sequelize from '../db.js';


const innerAnnouncementSchema = sequelize.define(
  'innerAnnouncement',
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
    modelName: 'innerAnnouncement',
    tableName: 'innerAnnouncement',
    timestamps: true,
  },
);

export default innerAnnouncementSchema;
