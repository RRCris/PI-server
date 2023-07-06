const {} = require("../handleAPI");
const { getUser, addUser, loginUser } = require("../handleDB");
const {} = require("../handleMAIN");

const { Router } = require("express");
const routerUser = Router();

routerUser.get("/:id", (req, res) => {
  getUser(req.params.id)
    .then((x) => res.status(200).send(x))
    .catch((e) => res.status(500).send(e));
});

routerUser.get("/", (req, res) => {
  if (!req.query.username || !req.query.password) {
    res.status(500).send({ err: "the parameters were incomplement" });
  } else {
    loginUser(req.query.username, req.query.password)
      .then((x) => res.status(200).send(x))
      .catch((e) => {
        console.log(e);
        res.status(500).send(e);
      });
  }
});
routerUser.post("/", (req, res) => {
  if (
    !req.body.name ||
    !req.body.username ||
    !req.body.password ||
    !req.body.email
  ) {
    res.status(500).send({ err: "the parameters were incomplement" });
  } else {
    addUser(req.body.name, req.body.username, req.body.password, req.body.email)
      .then((x) => res.status(200).send(x))
      .catch((e) => res.status(500).send(e));
  }
});

module.exports = routerUser;
