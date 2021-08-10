USE `competencias`;

CREATE TABLE `competencias_peliculas` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `genero_id` INT(11) UNSIGNED DEFAULT NULL,
    `director_id` INT(11) UNSIGNED DEFAULT NULL,
    `actor_id` INT(11) UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`genero_id`) REFERENCES `genero` (`id`),
    FOREIGN KEY (`director_id`) REFERENCES `director` (`id`),
    FOREIGN KEY (`actor_id`) REFERENCES `actor` (`id`)
);

USE `competencias`

INSERT INTO `competencias_peliculas` (`nombre`) VALUES 
('¿Cuál es tú mejor película?'),('¿Que película tiene el mejor elenco?'),('¿Cuál es la película que más veces viste?'),('¿Cuál tiene la mejor historia narrativa?'),('¿Cuál tiene mejores efectos especiales?'),('¿Cuál es la más pochoclera?');