$(function() {
	var idCompetencia = getQueryParam("id");
	var competenciasController = new CompetenciasController();
	competenciasController.obtenerResultados(idCompetencia);
});