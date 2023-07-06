const fetch = require("node-fetch");
const { getGenres, getPlataforms } = require("./handleDB");
let { API_KEY } = process.env;

if (!API_KEY) API_KEY = "d9cef787b93f45d993c8da3374f7b640";

function searchApi(name) {
  let p = new Promise(async (resolve, reject) => {
    try {
      console.time("Peticion a la Api");
      let i = await fetch(
        `https://api.rawg.io/api/games?key=${API_KEY}&search=${name.toLowerCase()}&page_size=50`
      );
      console.timeEnd("Peticion a la Api");

      //api.rawg.io/api/games?key=fd9e97581013433790aac899770e6d05&search=halo&page_size=26
      //requerimos toda la informacion que vayamos a necesitar;
      https: i = await i.json();
      let genres = await getGenres();
      let plataforms = await getPlataforms();

      //vamos a formatear el resultado para que sea unanime con la DB
      let results = i.results.map((x) => {
        //necesitamos solo los id´s de las plataformas y generos por que nosotros ya tenemos la informacion

        let plataformsID = [];
        let genresID = [];
        try {
          //algunos resultads son nulos
          plataformsID = x.platforms.map((x) => x.platform.id);
          genresID = x.genres.map((x) => x.id);
        } catch (error) {}

        return {
          id: x.id,
          name: x.name,
          image: x.short_screenshots.map((x) => x.image),
          rating: parseInt(x.rating),
          plataforms: plataforms.filter((x) => plataformsID.includes(x.id)), //inyectamos la informacion desde nuestra db
          genres: genres.filter((x) => genresID.includes(x.id)), //inyectamos la informacion desde nuestra db
        };
      });
      resolve(results);
    } catch (error) {
      reject({ err: error });
    }
  });
  return p;
}

function detailsAPI(id) {
  let p = new Promise(async (resolve, reject) => {
    try {
      console.time("Peticion a la Api");
      let i = await fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`);
      console.timeEnd("Peticion a la Api");
      //requerimos toda la informacion que vayamos a necesitar;
      i = await i.json();

      let genres = await getGenres();
      let plataforms = await getPlataforms();

      //necesitamos solo los id´s de las plataformas y generos por que nosotros ya tenemos la informacion
      let plataformsID = i.platforms.map((x) => x.platform.id);
      let genresID = i.genres.map((x) => x.id);

      //vamos a formatear el resultado para que sea unanime con la DB
      let result = {
        id: i.id,
        name: i.name,
        image: i.background_image,
        rating: i.rating,
        rating_count: i.ratings_count,
        launch: i.released,
        description: i.description,
        plataforms: plataforms.filter((x) => plataformsID.includes(x.id)),
        genres: genres.filter((x) => genresID.includes(x.id)),
      };
      //realizamos un pedido adicional para rescatar las imagenes
      let blockImage = await fetch(
        `https://api.rawg.io/api/games/${i.id}/screenshots?key=${API_KEY}`
      );
      blockImage = await blockImage.json();
      blockImage = blockImage.results.map((x) => x.image);
      result.image = blockImage;
      resolve(result);
    } catch (error) {
      reject({ err: error });
    }
  });
  return p;
}

function searchDefault() {
  let p = new Promise(async (resolve, reject) => {
    try {
      console.time("Peticion a la Api");
      let i = await fetch(
        `https://api.rawg.io/api/games?key=${API_KEY}&page_size=100`
      );
      console.timeEnd("Peticion a la Api");
      //requerimos toda la informacion que vayamos a necesitar;
      i = await i.json();
      let genres = await getGenres();
      let plataforms = await getPlataforms();

      //vamos a formatear el resultado para que sea unanime con la DB
      let results = i.results.map((x) => {
        //necesitamos solo los id´s de las plataformas y generos por que nosotros ya tenemos la informacion
        let plataformsID = x.platforms.map((x) => x.platform.id);
        let genresID = x.genres.map((x) => x.id);
        return {
          id: x.id,
          name: x.name,
          image: x.short_screenshots.map((x) => x.image),
          rating: parseInt(x.rating),
          plataforms: plataforms.filter((x) => plataformsID.includes(x.id)), //inyectamos la informacion desde nuestra db
          genres: genres.filter((x) => genresID.includes(x.id)), //inyectamos la informacion desde nuestra db
        };
      });
      results.sort((a, b) => a.name.localeCompare(b.name));
      resolve(results);
    } catch (error) {
      reject({ err: error });
    }
  });
  return p;
}

module.exports = {
  searchApi,
  detailsAPI,
  searchDefault,
};
