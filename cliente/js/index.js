// Al finalizarse de cargar el DOM:
$(function() {
	// Se obtienen del backend y cargan en el DOM las competencias existentes
	var competenciasController = new CompetenciasController();
 	competenciasController.obtenerCompetencias();
});
