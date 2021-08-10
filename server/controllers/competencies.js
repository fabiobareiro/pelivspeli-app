const mysqlConnection = require("../database/connection");
const util = require("util");
const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);

/* Obteniendo las competencias */
async function getCompetencies(req, res) {
  /* query a la base de datos para que nos traiga todas las peliculas de la tabla que 
  contiene las competencias */
  const competenciesQuery = `SELECT * FROM competencias_peliculas;`;

  /* Ejecutamos la query a la base de datos para retornar todas las competencias */
  query(competenciesQuery, (err, competencies) => {
    /* Realiza el pedido: (err) --> maneja los errores */
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* (res.send) -->  retorna las competencias  */
    return res.send(JSON.stringify(competencies));
  });
}

/* Obteniendo dos películas aleatorias */
async function getRandomCompetencies(req, res) {
  /* (idCompetencie) --> Obtengo el id de params */
  const idCompetencie = req.params.id;
  /* (competencieQuery) --> Se construye query con el id obtenido */
  const competencieQuery = `SELECT nombre, genero_id, director_id, actor_id FROM competencias_peliculas WHERE id=${idCompetencie}`;
  /* (getRandomQuery) --> Se construye la primera parte de la query para obtener las peliculas aleatorias */
  let getRandomQuery = `SELECT p.id, p.titulo, p.poster FROM pelicula p 
                        JOIN director_pelicula dp on p.id=dp.pelicula_id
                        JOIN actor_pelicula ap on p.id=ap.pelicula_id
  `;
  /* Se ejecuta la query a la base de datos para validar que exista la competencia */
  query(competencieQuery, (err, competencie) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Si no existe retornamos 404 */
    if (competencie.length == 0) {
      return res.status(404).send(`El recurso solicitado no existe`);
    }

    /* Se comprueba que los campos genero_id, director_id y genero_id no sean nulos y si es así se realizan
       las modificaciones en la query */
    if (
      competencie[0].genero_id != null ||
      competencie[0].director_id != null ||
      competencie[0].actor_id != null
    ) {
      getRandomQuery += ` WHERE`;
      if (competencie[0].genero_id != null) {
        getRandomQuery += ` p.genero_id=${competencie[0].genero_id}`;
      }
      if (competencie[0].director_id != null) {
        if (competencie[0].genero_id != null) getRandomQuery += ` AND`;
        getRandomQuery += ` dp.director_id=${competencie[0].director_id}`;
      }
    }
    /* (getRandomQuery) --> Termina de construir la query para traer las dos películas aleatorias */
    getRandomQuery += ` ORDER BY rand() LIMIT 2;`;
    /* Se ejecuta la query getRandomQuery que finalmente nos traera las dos películas aleatorias */
    query(getRandomQuery, (err, movies) => {
      if (err) {
        return res
          .status(500)
          .send(
            `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
          );
      }
      /* (objRes) --> Objeto que contiene el nombre de la competencia y las dos películas alaeatorias 
         que finalmente retornamos */
      const objRes = {
        competencia: competencie[0].nombre,
        peliculas: movies,
      };
      return res.send(JSON.stringify(objRes));
    });
  });
}

/* Insertando un voto a una película en una competencia */
async function postVote(req, res) {
  /* (idCompetencie) --> Obtengo el id de params */
  const idCompetencie = req.params.id;
  /* (idMovie) --> Obtengo el id de la película del cuerpo de la solicitud */
  const idMovie = req.body;
  /* (competencieQuery) --> Se construye query con el id obtenido de params */
  const idCompetencieQuery = `SELECT nombre FROM competencias_peliculas WHERE id=${idCompetencie};`;
  /* (insertVoteQuery) --> Se construye query para insertar el voto en la película y en la competencia */
  const insertVoteQuery = `INSERT INTO voto (cantidad, competencia_id, pelicula_id) VALUES (1, ${idCompetencie}, ${idMovie.idPelicula});`;

  /* Se ejecuta la query a la base de datos para validar que exista la competencia */
  query(idCompetencieQuery, (err, competencie) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Si no existe retornamos 404 */
    if (competencie.length == 0) {
      return res.status(404).send(`El recurso solicitado no existe`);
    }

    /* Se ejecuta la query para insertar finalmente los votos */
    query(insertVoteQuery, (err, result) => {
      if (err) {
        return res
          .status(500)
          .send(
            `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
          );
      }
      /* Se retorna el JSON con las respuesta */
      return res.send(JSON.stringify(result));
    });
  });
}

/* Obteniendo los tres mejores resultados de una competencia*/
async function getBetterResults(req, res) {
  /* (idCompetencie) --> Obtengo el id de params */
  const idCompetencie = req.params.id;
  /* (competencieQuery) --> Se construye query con el id obtenido para luego validar */
  const competencieQuery = `SELECT nombre FROM competencias_peliculas WHERE id=${idCompetencie};`;
  /* (getMoviesQuery) --> Se construye query con el id obtenido para obtener las películas
     más votadas de la competencia con limite 3*/
  const getMoviesQuery = `SELECT p.id as pelicula_id, p.poster, p.titulo, count(v.cantidad) as votos, cp.id as 
                    id_competencia from voto v join pelicula p on v.pelicula_id=p.id 
                    inner join competencias_peliculas cp on cp.id=v.competencia_id group by pelicula_id, p.poster, 
                    p.titulo, id_competencia having cp.id=${idCompetencie} order by votos desc limit 3;`;

  /* Se ejecuta la query a la base de datos para validar que exista la competencia */
  query(competencieQuery, (err, competencie) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Si no existe retornamos 404 */
    if (competencie.lenth == 0) {
      return res.status(404).send(`El recurso solicitado no existe`);
    }

    /* Se ejecuta la query a la base de datos para obtener las más votadas */
    query(getMoviesQuery, (err, result) => {
      if (err) {
        return res
          .status(500)
          .send(
            `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
          );
      }

      /* Si no existen resultados retornamos 404 */
      if (result.length == 0) {
        return res.status(404).send(`El recurso solicitado no existe`);
      }
      /* (objRes) --> Objeto que contiene el nombre de la competencia y los resultados con las 
         películas más votadas que finalmente retornamos */
      const objResp = {
        competencia: competencie[0].nombre,
        resultados: result,
      };
      return res.send(JSON.stringify(objResp));
    });
  });
}

/* Agregando una competencia nueva */
async function addCompetencie(req, res) {
  /* (nameCompetencie) --> Se obtiene el nombre del cuerpo de la solicitud */
  const nameCompetencie = req.body.nombre;
  /* (generoCompetencie) --> Se obtiene el genero del cuerpo de la solicitud */
  let generoCompetencie = req.body.genero;
  /* (directorCompetencie) --> Se obtiene el director del cuerpo de la solicitud */
  let directorCompetencie = req.body.director;
  /* (actorCompetencie) --> Se obtiene el actor del cuerpo de la solicitud */
  let actorCompetencie = req.body.actor;

  if (parseInt(generoCompetencie) == 0) {
    generoCompetencie = "null";
  }
  if (parseInt(directorCompetencie) == 0) {
    directorCompetencie = "null";
  }
  if (parseInt(actorCompetencie) == 0) {
    actorCompetencie = "null";
  }

  /* (moviesQuery) --> Se construye la query que utilizaremos para comprobar que existan películas con
                       los criterios seleccionados */
  let moviesQuery = `SELECT count(*) AS cantidad FROM pelicula p JOIN director_pelicula dp ON p.id=dp.pelicula_id 
                      JOIN actor_pelicula ap ON p.id=ap.pelicula_id`;

  /* (competencieQuery) --> query para validar que no exista una competencia con el mismo nombre */
  const competencieQuery = `SELECT count(*) as cantidad FROM competencias_peliculas WHERE nombre like '%${nameCompetencie}%';`;

  /* (addCompetencieQuery) --> query para insertar la competencia */
  const addCompetencieQuery = `INSERT INTO competencias_peliculas (nombre, genero_id, director_id, actor_id) VALUES ('${nameCompetencie}', 
                              ${generoCompetencie}, ${directorCompetencie}, ${actorCompetencie});`;

  /* validamos que genero, director y actor sean distinto de null y agregamos los valores en la query */
  if (
    generoCompetencie != "null" ||
    directorCompetencie != "null" ||
    actorCompetencie != "null"
  ) {
    moviesQuery += ` WHERE`;
    if (directorCompetencie != "null") {
      moviesQuery += ` dp.director_id=${directorCompetencie}`;
    }
    if (actorCompetencie != "null") {
      if (directorCompetencie != "null") moviesQuery += ` AND`;
      moviesQuery += ` ap.actor_id=${actorCompetencie}`;
    }
    if (generoCompetencie != "null") {
      if (directorCompetencie != "null" || actorCompetencie != "null") {
        moviesQuery += ` AND`;
      }
      moviesQuery += ` p.genero_id=${generoCompetencie}`;
    }
  }
  /* Se ejecuta la petición a la base de datos para validar que no exista la competencia con el mismo nombre */
  query(competencieQuery, (err, competencie) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Si existe (count(*)=1) => retorna 422 */
    if (competencie[0].cantidad) {
      return res
        .status(422)
        .send(`La competencia ya existe. Por favor, ingresar otro valor`);
    }

    /* Se ejecuta la petición a la base de datos para validar que existan al menos dos películas con los parametros 
    pedidos en genero, director y/o actor*/
    query(`${moviesQuery};`, (err, movies) => {
      if (err) {
        return res
          .status(500)
          .send(
            `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
          );
      }

      /* Si no existen al menos dos películas => retorna 422 */
      if (movies[0].cantidad < 2) {
        return res
          .status(422)
          .send(`No existen peliculas con los criterios solicitados.`);
      } else {
        /* Si existen al menos dos películas hacemos el insert de la competencia a la base de datos */
        query(addCompetencieQuery, (err, result) => {
          if (err) {
            return res
              .status(500)
              .send(
                `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
              );
          }
          /* Se retorna el JSON con el resultado satisfactorio */
          return res.send(JSON.stringify(result));
        });
      }
    });
  });
}

/* Eliminando los votos a una competencia */
async function deleteVoteCompetencie(req, res) {
  /* (idCompetencie) --> Obtengo el id de params */
  const idCompetencie = req.params.id;
  /* (deleteQuery) --> Se construye query delete con el id obtenido */
  const deleteQuery = `delete from voto where voto.competencia_id=${idCompetencie};`;

  /* Se ejecuta la query a la base de datos para eliminar los votos de una competencia */
  query(deleteQuery, (err, result) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un erro inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }

    /* Si no existen resultados se retorna 404 */
    if (result.length == 0) {
      return res.status(404).send(`El recurso solicitado no existe`);
    }
    /* Si no existen errores se retorna el JSON con el resultado satisfactorio */
    return res.send(JSON.stringify(result));
  });
}

/* Obteniendo todos los generos para mostrarlos en el front end (formulario) */
async function getGenres(req, res) {
  /* (getGenres) --> Se construye la query para obtener los generos de la base de datos */
  const getGenres = `SELECT id, nombre FROM genero`;

  /* Se ejecuta la solicitud a la base de datos */
  query(getGenres, (err, results) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Se retorna el JSON con los resultados para cargar los generos en el front end (formulario) */
    return res.send(JSON.stringify(results));
  });
}

/* Obteniendo todos los directores para mostrarlos en el front end (formulario) */
async function getDirectors(req, res) {
  /* (getDirectors) --> Se construye la query para obtener los directores de la base de datos */
  const getDirectors = "SELECT id, nombre FROM director;";

  /* Se ejecuta la solicitud a la base de datos */
  query(getDirectors, (err, directors) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un error inesperado en el servidor, vuelva a intertarlo luego. Error: ${err.message}`
        );
    }
    /* Se retorna el JSON con los resultados para cargar los directores en el front end (formulario) */
    return res.send(JSON.stringify(directors));
  });
}

/* Obteniendo todos los actores para mostrarlos en el front end (formulario) */
async function getActors(req, res) {
  /* (getDirectors) --> Se construye la query para obtener los actores de la base de datos */
  const getActors = `SELECT * FROM actor;`;

  /* Se ejecuta la solicitud a la base de datos */
  query(getActors, (err, actors) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Se retorna el JSON con los resultados para cargar los actores en el front end (formulario) */
    return res.send(JSON.stringify(actors));
  });
}

/* Eliminando una competencia */
async function deleteCompetencie(req, res) {
  /* (idCompetencie) --> Se obtiene el id de la competencia desde el query params */
  const idCompetencie = req.params.id;
  /* (competencieQuery) --> Se construye la query para validar la existencia de la competencia */
  const competencieQuery = `SELECT * FROM competencias_peliculas where id=${idCompetencie};`;
  /* (votesDelete) --> 1) Se construye la query para eliminar los votos de la competencia */
  const votesDelete = `DELETE FROM voto WHERE competencia_id=${idCompetencie}`;
  /* (competencieDelete) --> 2) Se construye la query para eliminar finalmente la competencia */
  const competencieDelete = `DELETE FROM competencias_peliculas WHERE id=${idCompetencie}`;

  /* Se ejecuta la query para validar la existencia de la competencia en la base de datos */
  query(competencieQuery, (err, competencie) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Si no existe retornamos 404 */
    if (competencie.length == 0) {
      res.status(404).send(`El recurso solicitado no existe`);
    }

    /* Si existe ejecutamos la eliminación de los votos de la competencia */
    query(votesDelete, (err, result) => {
      if (err) {
        return res
          .status(500)
          .send(
            `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
          );
      }

      /* Si no existen problemas ejecutamos la eliminación finalmente de la competencia en cascada */
      query(competencieDelete, (err, result) => {
        if (err) {
          return res
            .status(500)
            .send(
              `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
            );
        }
        /* Retornamos JSON con el resultado satisfactorio */
        return res.send(JSON.stringify(result));
      });
    });
  });
}

/* Obteniendo los detalles completos de una competencia */
async function getCompetencieId(req, res) {
  /* (idCompetencie) --> Se obtiene el id de la competencia desde el query params */
  const idCompetencie = req.params.id;
  /* (competencieQuery) --> Se construye la query de la competencia para validar que exista */
  const competencieQuery = `SELECT * FROM competencias_peliculas cp where cp.id=${idCompetencie};`;
  /* (competencieQuery) --> Se construyen las variables que armaran la query final */
  let dataCompetencie = ``;
  let columnsQuery = ``;
  let joins = ``;

  /* Se ejecuta la query para validar la existencia de la competencia */
  query(competencieQuery, (err, competencie) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }
    /* Si no existe retornamos 404 */
    if (competencie.length == 0) {
      res.status(404).send(`El recurso solicitado no existe`);
    }

    /* validamos que director_id, actor_id y genero_id haya llegado distinto a el valor null para insertar 
    esos valores en la query final */
    if (competencie[0].director_id != null) {
      columnsQuery += `, d.nombre as director_nombre`;
      joins += ` JOIN director d on cp.director_id=d.id`;
    }
    if (competencie[0].actor_id != null) {
      columnsQuery += `, a.nombre as actor_nombre`;
      joins += ` JOIN actor a on cp.actor_id=a.id`;
    }
    if (competencie[0].genero_id != null) {
      columnsQuery += `, g.nombre as genero_nombre`;
      joins += ` JOIN genero g on cp.genero_id=g.id`;
    }

    /* Se termina de construir la query con toda la información de la competencia */
    dataCompetencie += `SELECT cp.nombre${columnsQuery} FROM competencias_peliculas cp${joins} where cp.id=${idCompetencie};`;

    /* Se ejecuta la query final */
    query(dataCompetencie, (err, data) => {
      if (err) {
        return res
          .status(500)
          .send(
            `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
          );
      }

      /* Si no existen problemas construimos el objeto respuesta y retornamos el JSON */
      objData = {
        nombre: data[0].nombre,
        genero_nombre: data[0].genero_nombre,
        actor_nombre: data[0].actor_nombre,
        director_nombre: data[0].director_nombre,
      };
      res.send(JSON.stringify(objData));
    });
  });
}

/* Editando el nombre de una competencia */
async function editNameCompetencie(req, res) {
  /* (idCompetencie) --> Se obtiene el id de la competencia desde el query params */
  const idCompetencie = req.params.id;
  /* (newNameInput) --> Se obtiene el nuevo nombre de la competencia desde el cuerpo de la request que viene desde
  el formulario */
  const newNameInput = req.body.nombre;
  /* (competencieQuery) --> Se construye la query con el id obtenido para luego validar su existencia */
  const competencieQuery = `SELECT count(*) FROM competencias_peliculas where id=${idCompetencie};`;
  /* (idCompeditQueryetencie) --> Se construye la query con el nuevo nombre y el id de la competencia 
  para luego poder enviarlo a la base de datos */
  const editQuery = `UPDATE competencias_peliculas SET nombre='${newNameInput}' where id=${idCompetencie};`;
  /* Se valida que la regla de negocio se cumple, el nombre no debe ser menor a 10 caracteres, si es así
  se retorna 422 */
  if (newNameInput.length < 10) {
    return res
      .status(422)
      .send(`El nombre debe contener, al menos, 5 caracteres`);
  }

  /* Se ejecuta la query a la base de datos para validar que exista la competencia */
  query(competencieQuery, (err, competencie) => {
    if (err) {
      return res
        .status(500)
        .send(
          `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
        );
    }

    /* Si no existe retornamos 404 */
    if (competencie.length == 0) {
      return res.status(404).json(`El recurso solicitado no existe`);
    }

    /* Se ejecuta la query a la base de datos para editar el nombre de la competencia */
    query(editQuery, (err, result) => {
      if (err) {
        return res
          .status(500)
          .send(
            `Ocurrio un error inesperado en el servidor, vuelva a intentarlo luego. Error: ${err.message}`
          );
      }
      /* Se retorna el JSON con el resultado satisfactorio */
      return res.send(JSON.stringify(result));
    });
  });
}

/* Exportamos las funciones para que sean accesibles desde server.js */
module.exports = {
  getCompetencies: getCompetencies,
  getRandomCompetencies: getRandomCompetencies,
  postVote: postVote,
  getBetterResults: getBetterResults,
  addCompetencie: addCompetencie,
  deleteVoteCompetencie: deleteVoteCompetencie,
  getGenres: getGenres,
  getDirectors: getDirectors,
  getActors: getActors,
  deleteCompetencie: deleteCompetencie,
  getCompetencieId: getCompetencieId,
  editNameCompetencie: editNameCompetencie,
};
