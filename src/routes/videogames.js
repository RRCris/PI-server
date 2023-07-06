const { searchDefault } = require("../handleAPI");
const { createVideogame } = require("../handleDB");
const { search, details } = require("../handleMAIN");

const { Router } = require("express");
const routerVideogames = Router();

routerVideogames.get("/", (req, res) => {
  if (!req.query.name) {
    searchDefault()
      .then((x) => res.status(200).send(x))
      .catch((e) => {
        res.status(500).send(e);
        console.log(e);
      });
  } else {
    let f = {
      origin: [],
      genres: [],
      plataforms: [],
    };
    if (req.query.origin) f.origin = req.query.origin.split(",");
    if (req.query.genres) f.genres = req.query.genres.split(",");
    if (req.query.plataforms) f.plataforms = req.query.plataforms.split(",");
    console.log("filtros usados:", f);
    search(req.query.name, f)
      .then((x) => res.status(200).send(x))
      .catch((e) => res.status(500).send(e));
  }
});

routerVideogames.get("/:id", (req, res) => {
  details(req.params.id)
    .then((x) => res.status(200).send(x))
    .catch((e) => {
      res.status(500).send(e);
    });
});

routerVideogames.post("/", (req, res) => {
  if (
    !req.body.name ||
    !req.body.image ||
    !req.body.launch ||
    !req.body.description ||
    !req.body.plataforms ||
    !req.body.genres
  ) {
    return res.status(500).send({ err: "no estan completos los datos" });
  } else {
    let plataforms = req.body.plataforms.split(",");
    let genres = req.body.genres.split(",");
    let launch = new Date(parseInt(req.body.launch));
    createVideogame(
      req.body.name,
      req.body.image,
      launch,
      req.body.description,
      plataforms,
      genres
    )
      .then((x) => res.status(200).send(x))
      .catch((e) => res.status(500).send(e));
  }
});
module.exports = routerVideogames;
