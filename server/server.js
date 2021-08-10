const express = require("express");
const cors = require("cors");
const app = express();
const competenciesController = require("./controllers/competencies");

const port = "8080";
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.json());

//request get
app.get("/competencias", competenciesController.getCompetencies);
app.get("/generos", competenciesController.getGenres);
app.get("/directores", competenciesController.getDirectors);
app.get("/actores", competenciesController.getActors);
app.get("/competencias/:id", competenciesController.getCompetencieId);
app.get(
  "/competencias/:id/peliculas",
  competenciesController.getRandomCompetencies
);
app.get(
  "/competencias/:id/resultados",
  competenciesController.getBetterResults
);

//request post
app.post("/competencias/:id/voto", competenciesController.postVote);
app.post("/competencias", competenciesController.addCompetencie);

//request delete
app.delete("/competencias/:id", competenciesController.deleteCompetencie);
app.delete(
  "/competencias/:id/votos",
  competenciesController.deleteVoteCompetencie
);

//request put
app.put("/competencias/:id", competenciesController.editNameCompetencie);

app.listen(port, () => console.log(`listening at http://localhost:${port}`));
