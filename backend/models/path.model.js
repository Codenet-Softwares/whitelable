import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Path = sequelize.define('Paths', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    UserName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
    {
        timestamps: true,
    }
)

export default Path