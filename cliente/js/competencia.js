// Esta es la ip y puerto en que necesitamos que esté el backend disponible
var server = "http://0.0.0.0:8080";

function CompetenciasController() {
  // Esta método obtiene y carga todas las competencias existentes
  (this.obtenerCompetencias = function () {
    // Como luego se necesita usar "this" dentro de la función de callback, se guarda en self la referencia a CompetenciasController
    var self = this;

    // Se obtiene de la api el listado de competencias
    $.getJSON(server + "/competencias", function (data) {
      // Se carga la información obtenida en el DOM
      self.cargarCompetencias(data);
    });
  }),
    (this.cargarCompetencias = function (data) {
      // data es el listado de competencias que retornó la api (un objeto json)

      // Oculto la plantilla
      $(".competenciaPlantilla").hide();
      // Se recorren iterativamente, uno a uno, los resultados de competencias
      var cantidad = data.length;
      var idColor = 1;
      var idColorCrece = true;
      for (i = 0; i < cantidad; i++) {
        // Se clona la plantilla y la nueva copia ya no es una plantilla
        var divCompetencia = $(".competenciaPlantilla")
          .clone()
          .removeClass("competenciaPlantilla");
        // Se coloca el id correcto (data[i].id) de cada competencia en los links de acciones
        $(divCompetencia)
          .find(".link")
          .each(function () {
            $(this).attr("href", $(this).attr("href") + data[i].id);
          });
        // Se coloca el nombre de cada competencia
        $(divCompetencia).find(".titulo").text(data[i].nombre);
        $(divCompetencia)
          .find(".card")
          .addClass("color" + idColor);

        if (idColorCrece) {
          idColor++;
        } else {
          idColor--;
        }

        if (idColor > 4 || idColor < 1) {
          idColor = idColorCrece ? 4 : 1;
          idColorCrece = !idColorCrece;
        }
        // Se incorpora el nuevo div generado al DOM dentro del div con clase competencias
        $(".competencias").append(divCompetencia);
        // Se muestra el nuevo div con la competencia (la plantilla estaba oculta)
        $(divCompetencia).show();
      }
    }),
    // Esta método obtiene y carga los detalles de una competencia
    (this.obtenerCompetencia = function (id) {
      // Como luego se necesita usar "this" dentro de la función de callback, se guarda en self la referencia a CompetenciasController
      var self = this;

      // Se obtiene de la api el detalle de una competencia
      var opciones = $.getJSON(server + "/competencias/" + id, function (data) {
        // Se carga la información obtenida en el DOM
        self.cargarCompetencia(id, data);
      });
    }),
    (this.cargarCompetencia = function (id, data) {
      // data es el detalle de una competencia que retornó la api (un objeto json)
      // Se coloca en el elemento correspondiente el nombre de la competencia
      $(".nombre").text(data.nombre);
      $(".nombre").val(data.nombre);
      // Se coloca en el elemento correspondiente el género de películas de la competencia, si es que hay alguno
      $(".genero").text(data.genero_nombre);
      // Se coloca en el elemento correspondiente el actor/actriz de la competencia, si es que hay alguno/a
      $(".actor").text(data.actor_nombre);
      // Se coloca en el elemento correspondiente el director/a de la competencia, si es que hay alguno/a
      $(".director").text(data.director_nombre);
    }),
    // Esta método obtiene y carga las opciones de películas para votar
    (this.obtenerOpciones = function (id) {
      // Como luego se necesita usar "this" dentro de la función de callback, se guarda en self la referencia a CompetenciasController
      var self = this;
      // Se obtienen de la api las opciones de películas
      var opciones = $.getJSON(
        server + "/competencias/" + id + "/peliculas",
        function (data) {
          // Se cargan las opciones en el DOM
          self.cargarOpciones(id, data);
        }
      );
    }),
    (this.cargarOpciones = function (id, opciones) {
      // Se carga el nombre de la competencia en el título de la página
      $("#nombreCompetencia").text(opciones.competencia);
      // Se recorren las opciones de películas (opciones.peliculas es un array) para votar que retornó la api
      for (var i = 0; i < opciones.peliculas.length; i++) {
        // Se selecciona el div que contiene la opción a cargar
        var divOpcion = "#opcion" + (i + 1);
        // Se carga el valor del id de la película de la opción act
        $(divOpcion + " .idPelicula").val(opciones.peliculas[i].id);
        // Se carga la imagen del poster de la película de la opción actual
        $(divOpcion + " .poster").attr("src", opciones.peliculas[i].poster);
        // Se carga el título de la película de la opción actual
        $(divOpcion + " .titulo").text(opciones.peliculas[i].titulo);
      }
    }),
    // Este método envía el voto seleccionado (la elección de una película) en una competencia
    (this.votar = function (idCompetencia, idPelicula) {
      // Se arma el objeto data a enviar como body en el POST a la api
      var data = { idPelicula: idPelicula };
      // Se realiza el post a la api
      $.post(
        server + "/competencias/" + idCompetencia + "/voto",
        data,
        function (response) {
          // Se redirige al usuario a ver los resultados de la competencia en la que votó
          window.location.replace("resultados.html?id=" + idCompetencia);
        },
        "json"
      );
    }),
    // Este método obtiene los géneros existentes de películas del backend y los carga en un select en el DOM
    (this.cargarGeneros = function () {
      // Se obtienen los géneros existentes de películas del backend
      $.getJSON(server + "/generos", function (data) {
        // Se vacía el elemento que contiene los géneros
        $("#genero").empty();
        // Se carga la opción "sin seleccionar" que corresponde a todos los géneros
        $("#genero").append("<option value='0'>Todos</option>");
        // Se recorren y cargan uno a uno los géneros retornados por el backend (data es un array de objetos json)
        for (i = 0; i < data.length; i++) {
          $("#genero").append(
            "<option value='" + data[i].id + "'>" + data[i].nombre + "</option>"
          );
        }
      });
    }),
    // Este método obtiene los/as directores/as existentes del backend y los carga en un select en el DOM
    (this.cargarDirectores = function () {
      // Se obtienen los/as directores/as existentes del backend
      $.getJSON(server + "/directores", function (data) {
        // Se vacía el elemento que contiene los directores/as
        $("#director").empty();
        // Se carga la opción "sin seleccionar" que corresponde a todos/as los/as directores/as
        $("#director").append("<option value='0'>Todos/as</option>");
        // Se recorren y cargan uno/a a uno/a los/as directores/as retornados por el backend (data es un array de objetos json)
        for (i = 0; i < data.length; i++) {
          $("#director").append(
            "<option value='" + data[i].id + "'>" + data[i].nombre + "</option>"
          );
        }
      });
    }),
    // Este método obtiene los/as actores/actrices existentes del backend y los carga en un select en el DOM
    (this.cargarActores = function () {
      // Se obtienen los/as actores/actrices existentes del backend
      $.getJSON(server + "/actores", function (data) {
        // Se vacía el elemento que contiene los actores/actrices
        $("#actor").empty();
        // Se carga la opción "sin seleccionar" que corresponde a todos/as los/as actores/actrices
        $("#actor").append("<option value='0'>Todos/as</option>");
        for (i = 0; i < data.length; i++) {
          // Se recorren y cargan uno/a a uno/a los/as actores/actrices retornados por el backend (data es un array de objetos json)
          $("#actor").append(
            "<option value='" + data[i].id + "'>" + data[i].nombre + "</option>"
          );
        }
      });
    }),
    // Este método obtiene y carga en el DOM los resultados de una competencia (películas más votadas)
    (this.obtenerResultados = function (id) {
      // Como luego se necesita usar "this" dentro de la función de callback, se guarda en self la referencia a CompetenciasController
      var self = this;
      // Se obtienen del backend los resultados de las competencias
      var opciones = $.getJSON(
        server + "/competencias/" + id + "/resultados",
        function (data) {
          // Se cargan los resultados en el DOM
          self.cargarResultados(id, data);
        }
      );
    }),
    (this.cargarResultados = function (id, data) {
      // Se carga el nombre de la competencia en el contenedor del título
      $("#nombreCompetencia").text(data.competencia);
      // Se recorren los resultados (data es un array)
      for (var i = 0; i < data.resultados.length; i++) {
        // Se selecciona el div que contiene la estructura donde cargar el resultado actual
        var divResultado = "#puesto" + (i + 1);
        // Se carga el valor de pelicula_id obtenido de la opción actual en el objeto con clase idPelicula que se encuentra dentro del divResultado
        $(divResultado + " .idPelicula").val(data.resultados[i].pelicula_id);
        // Se carga el poster de la película
        $(divResultado + " .poster").attr("src", data.resultados[i].poster);
        // Se carga el título de la película
        $(divResultado + " .titulo").text(data.resultados[i].titulo);
        // Se carga la cantidad de votos recibidos por la película en esta competencia
        var votoOVotos = data.resultados[i].votos > 1 ? "VOTOS" : "VOTO";
        $(divResultado + " .votos").text(
          data.resultados[i].votos + " " + votoOVotos
        );
      }
      for (i; i < 3; i++) {
        var divResultado = "#puesto" + (i + 1);
        $(divResultado).hide();
      }
    });
}
