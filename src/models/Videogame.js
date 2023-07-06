const { DataTypes } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "videogame",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: DataTypes.TEXT,
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      rating_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      launch: {
        type: DataTypes.DATE,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
