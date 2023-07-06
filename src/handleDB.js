const { Videogame, Plataform, Genre, User } = require("./db");
const { Op, HasOne } = require("sequelize");
const fetch = require("node-fetch");

//por si no funciona otra vez
let { API_KEY } = process.env;
if (!API_KEY) API_KEY = "fd9e97581013433790aac899770e6d05";

function searchDB(name) {
  //envolvemos todo en una promesa
  let p = new Promise((resolve, reject) => {
    //hacemos la busqueda
    Videogame.findAll({
      attributes: ["id", "name", "image", "rating"],
      where: {
        name: {
          [Op.like]: name.toLowerCase() + "%",
        },
      },
      include: [Plataform, Genre],
    })
      .then((r) => {
        //formateamos el resultado para que no hallan errores
        let formating = r.map((x) => {
          let properties = x.dataValues;
          properties.image = [properties.image];
          properties.id = "R" + properties.id;
          return properties;
        });
        resolve(formating);
      })
      .catch((e) => reject({ err: e }));
  });

  return p;
}

function detailsDB(id) {
  let p = new Promise((resolve, reject) => {
    try {
      Videogame.findAll({
        where: {
          id,
        },
        include: [Plataform, Genre],
      })
        .then((r) => {
          if (r.length > 0) {
            r[0].dataValues.image = [r[0].dataValues.image];
            r[0].dataValues.id = "R" + r[0].dataValues.id;
            resolve(r[0].dataValues);
          } else resolve(r);
        })
        .catch((e) => reject(e));
    } catch (error) {
      reject({ err: "error en la base de datos" });
    }
  });
  return p;
}

function createVideogame(
  name,
  image,
  launch,
  description,
  plataformsName,
  genresName
) {
  let p = new Promise(async (resolve, reject) => {
    //validamos que sean arrays plataform y genres
    if (typeof plataformsName != "object" || typeof genresName != "object")
      return reject({ err: "data invalid(platoforms or genres))" });
    try {
      //creamos videojuego y requerimos la lista de plaformas y genereos disponibles
      let videogame = await Videogame.create({
        name,
        image,
        launch: launch,
        description,
      });
      let plataforms = await Plataform.findAll();
      let genres = await Genre.findAll();
      // console.log(genres);

      //filtramos la lista para que solo queden las que se  van a asociar
      let plataformsSelected = plataforms.filter((plataform) => {
        let result = false;
        plataformsName.forEach((name) => {
          if (plataform.name.toLowerCase().includes(name)) result = true;
        });
        return result;
      });
      let genresSelected = genres.filter((x) => genresName.includes(x.name));

      //realizamos las respectivas relaciones
      await videogame.addPlataforms(plataformsSelected);
      await videogame.addGenres(genresSelected);
      let confimation = await Videogame.findAll({
        where: {
          id: videogame.dataValues.id,
        },
        include: [Plataform, Genre],
      });
      resolve(confimation);
    } catch (error) {
      console.log(error);
    }
  });
  return p;
}

function updatePlataforms() {
  let p = new Promise((resolve, reject) => {
    fetch(`https://api.rawg.io/api/platforms?key=${API_KEY}&page_size=100`)
      .then((x) => x.json())
      .then((x) => {
        if (x.results) {
          x.results.forEach((platform) => {
            let url = "https://www.google.com/search?q=" + platform.name;
            let match = platform.name.toLowerCase();
            if (match.includes("xbox"))
              url = "https://www.xbox.com/es-ES/games";
            else if (match.includes("playstation") || match.includes("ps"))
              url = "https://store.playstation.com/es-co/pages/latest";
            else if (match.includes("nintendo"))
              url = "http://store.nintendo.co/games/all-released-games";
            else if (match.includes("atari"))
              url = "https://www.amazon.com/s?k=atari+2600+console";
            else if (
              match.includes("pc") ||
              match.includes("apple") ||
              match.includes("mac") ||
              match.includes("linux")
            )
              url = "https://store.steampowered.com/";
            else if (match.includes("android"))
              url = "https://play.google.com/store/games";
            else if (match.includes("ios"))
              url = "https://www.apple.com/co/app-store/";

            Plataform.create({
              api: platform.id,
              name: platform.name,
              url,
            }).catch((e) => console.log({ err: e }));
          });
        }

        resolve({ msg: "the plataforms has updated" });
      })
      .catch((e) => reject({ err: e }));
  });

  return p;
}

function updateGenres() {
  let p = new Promise((resolve, reject) => {
    fetch(`https://api.rawg.io/api/genres?key=${API_KEY}&page_size=100`)
      .then((x) => x.json())
      .then((x) => {
        if (x.results) {
          x.results.forEach((genre) => {
            Genre.create({
              api: genre.id,
              name: genre.name,
              games_count: genre.games_count,
              image: genre.image_background,
            }).catch((e) => console.log({ err: e }));
          });
        }
        resolve({ msg: "the genres has updated" });
      })
      .catch((e) => reject({ err: e }));
  });

  return p;
}

function getGenres() {
  let p = new Promise((resolve, reject) => {
    Genre.findAll()
      .then((r) => {
        let results = r.map((x) => {
          return x.dataValues;
        });
        resolve(results);
      })
      .catch((e) => reject(e));
  });
  return p;
}
function getPlataforms() {
  let p = new Promise((resolve, reject) => {
    Plataform.findAll()
      .then((r) => {
        let results = r.map((x) => {
          return x.dataValues;
        });
        resolve(results);
      })
      .catch((e) => reject(e));
  });
  return p;
}

function getUser(id) {
  let p = new Promise((resolve, reject) => {
    User.findByPk(parseInt(id))
      .then((r) => {
        if (!r) {
          reject({ err: "don´t exist the id in database" });
        }
        resolve(r);
      })
      .catch((e) => reject({ err: e.parent || e }));
  });

  return p;
}

function addUser(name, username, password, email) {
  let p = new Promise((resolve, reject) => {
    User.create({
      name,
      username,
      password,
      email,
    })
      .then((r) => resolve(r))
      .catch((e) => reject(e.parent || e));
  });

  return p;
}
function loginUser(username, password) {
  let p = new Promise((resolve, reject) => {
    User.findAll({
      where: {
        username: username,
        password: password,
      },
    })
      .then((r) => {
        if (r.length < 1) {
          reject({ err: "the password or username are incorrect" });
        }
        resolve(r[0]);
      })
      .catch((e) => reject({ err: e }));
  });

  return p;
}

function qualify(userId, videogameId, score) {
  let p = new Promise(async (resolve, reject) => {
    try {
      if (!score) return reject({ err: "don´t exists score for qualify" });

      let user = await getUser(userId);
      let videogame = await Videogame.findByPk(parseInt(videogameId));

      if (!user || !videogame)
        return reject({ err: "don´t exists the user or the videogame" });

      if (await videogame.hasUser(user)) {
        return reject({ err: "you had already qualify the videogame" });
      }
      videogame.addUser(user);

      let count = parseInt(videogame.dataValues.rating_count);
      let scoreOld = parseInt(videogame.dataValues.rating);

      let x = scoreOld * count;
      x += parseInt(score);
      x /= count + 1;
      videogame
        .update({
          rating: x,
          rating_count: count + 1,
        })
        .then((r) => resolve({ msg: "you have qualifily the videogame" }));
    } catch (error) {
      console.log(error);
      reject({ err: error });
    }
  });

  return p;
}

updateGenres();
updatePlataforms();
addUser("antonio", "ant", "1234", "correo@gmail.com");

module.exports = {
  searchDB,
  detailsDB,
  createVideogame,
  getGenres,
  getPlataforms,
  addUser,
  getUser,
  qualify,
  loginUser,
};
