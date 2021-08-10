// Al finalizarse de cargar el DOM:
$(function() {
	// Se obtiene el id en la URL usando la función en helpers.js
	var idCompetencia = getQueryParam("id");
	// Se obtiene del backend el detalle de la competencia actual
	var competenciasController = new CompetenciasController();
		competenciasController.obtenerCompetencia(idCompetencia)
	// Al enviarse el formulario, se debe ejecutar un DELETE al servidor
	$("#formCompetencia").ajaxForm({url: server + '/competencias/'+idCompetencia, type: 'delete', 
		// En caso de éxito, se redirige a index.html
		success: function(res) {
			window.location.replace("./index.html?exito=True");
		},
		// En caso de error, se muestra el mensaje de error en el contenedor para tal fin
		error: function(response, status, xhr) {
			$("#mensajeDeError").text(response.responseText);
		}
	});

	// Si el usuario cancela, se redirige a index.html
	$(".cancelar").click(function(){
		window.location.replace("./index.html");
	});
});
