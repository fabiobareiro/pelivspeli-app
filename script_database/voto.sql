USE `competencias`;

CREATE TABLE `voto` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `cantidad` INT UNSIGNED NOT NULL DEFAULT 0,
    `competencia_id` INT NOT NULL,
    `pelicula_id` INT UNSIGNED NOT NULL,

    PRIMARY KEY (`id`),
    FOREIGN KEY (`competencia_id`) REFERENCES `competencias_peliculas` (`id`),
    FOREIGN KEY (`pelicula_id`) REFERENCES `pelicula` (`id`)
);
