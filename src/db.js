require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
let { DB_USER, DB_PASSWORD, DB_HOST } = process.env;
if (!DB_USER) {
  DB_USER = "postgres";
  DB_PASSWORD = "QVJjuzJy0yxwTE1KGaY6";
  DB_HOST = "containers-us-west-117.railway.app";
}
const sequelize = new Sequelize(
  `postgresql://postgres:QVJjuzJy0yxwTE1KGaY6@containers-us-west-117.railway.app:6151/railway`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Videogame, User, Plataform, Genre } = sequelize.models;

// // Aca vendrian las relaciones
// Videogame.belongsToMany(Plataform, { through: "VideogamePlataform" });
// Plataform.belongsToMany(Videogame, { through: "VideogamePlataform" });

// Videogame.belongsToMany(Genre, { through: "VideogameGenre" });
// Genre.belongsToMany(Videogame, { through: "VideogameGenre" });

// Videogame.belongsToMany(User, { through: "VideogameUser" });
// User.belongsToMany(Videogame, { through: "VideogameUser" });

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
