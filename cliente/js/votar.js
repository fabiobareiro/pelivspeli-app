// Al finalizarse de cargar el DOM:
$(function () {
  // Se obtiene el id en la URL usando la función en helpers.js
  var idCompetencia = getQueryParam("id");
  // Se obtienen del backend y cargan en el DOM las opciones para votar
  var competenciasController = new CompetenciasController();
  competenciasController.obtenerOpciones(idCompetencia);
  // Al hacer click en una película, se ejecuta el método "votar" del controller
  $(".pelicula").click(function () {
    var voto = $(this).find(".idPelicula").val();

    competenciasController.votar(idCompetencia, voto);
  });
});
