const { searchApi, detailsAPI } = require("./handleAPI");
const { searchDB, detailsDB } = require("./handleDB");

function search(name, filters) {
  let p = new Promise(async (resolve, reject) => {
    try {
      let resultsDB = await searchDB(name);
      let resultsAPI = await searchApi(name);
      let results = [...resultsDB, ...resultsAPI];

      results.sort((a, b) => a.name.localeCompare(b.name));

      //flitramos por origen
      if (filters.origin.length > 0) {
        if (
          filters.origin.includes("Api") &&
          filters.origin.includes("dataBase")
        ) {
          results = results;
        } else if (filters.origin.includes("dataBase")) {
          results = results.filter((x) => x.id.toString().includes("R"));
        } else if (filters.origin.includes("Api")) {
          results = results.filter((x) => !x.id.toString().includes("R"));
        }
      }
      //flitramos por generos
      if (filters.genres.length > 0) {
        results = results.filter((result) => {
          let finaly = false;
          result.genres.forEach((genre) => {
            if (filters.genres.includes(genre.api.toString())) finaly = true;
          });
          return finaly;
        });
      }

      //flitramos por plataformas
      if (filters.plataforms.length > 0) {
        results = results.filter((result) => {
          let finaly = false;
          result.plataforms.forEach((plataform) => {
            if (filters.plataforms.includes(plataform.api.toString()))
              finaly = true;
          });
          return finaly;
        });
      }
      resolve(results);
    } catch (e) {
      console.log(e);
      reject({ err: e });
    }
  });

  return p;
}

function details(id) {
  let p = new Promise(async (resolve, reject) => {
    try {
      let detail = { msg: "no se encontro id" };
      if (id.toString().includes("R")) {
        detail = await detailsDB(id.replace("R", ""));
      } else {
        detail = await detailsAPI(id);
      }
      return resolve(detail);
    } catch (e) {
      reject({ err: e.parent || e });
    }
  });

  return p;
}

let f = {
  origin: [],
  genres: [],
  plataforms: [],
};

module.exports = {
  search,
  details,
};
