import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Partnership = sequelize.define('Partnerships', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    partnership: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
    {
        timestamps: true,
    }
)

export default Partnership