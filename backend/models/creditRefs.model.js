import { DataTypes } from "sequelize";
import {sequelize} from "../db.js";

const CreditRef = sequelize.define('CreditRefs', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CreditRef: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 0,
    },
},
    {
        timestamps: true,
    }
)

export default CreditRef


