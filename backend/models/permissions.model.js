import { DataTypes } from "sequelize";
import {sequelize} from "../db.js";

const Permission = sequelize.define('Permissions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    permission: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
    {
        timestamps: true,
    }
)

export default Permission