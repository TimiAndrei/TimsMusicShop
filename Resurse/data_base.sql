DROP TYPE IF EXISTS categ_muzician;
DROP TYPE IF EXISTS tipuri_instrument;
DROP TYPE IF EXISTS categ_instrument;

CREATE TYPE categ_instrument AS ENUM('instrument cu clape','instrument cu coarde','instrument de suflat');
CREATE TYPE tipuri_instrument AS ENUM( 'orga', 'acordeon', 'pian', 'pianina', 'chitara', 'mandolina', 'vioara', 'viola', 'contrabas', 'fluier', 'flaut', 'trompeta', 'trombon');
CREATE TYPE categ_muzician AS ENUM('incepator','mediu','avansat');

CREATE TABLE IF NOT EXISTS instrumente (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   tip_instrument tipuri_instrument,
   categorie categ_instrument,
   pentru categ_muzician,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT into instrumente (nume,descriere,pret, tip_instrument,categorie, pentru, imagine) VALUES 
('Acordeon Hohner Bravo III 96', 'Acordeon cu 96 de basuri, sunet puternic și design ergonomic.', 1599.00, 'acordeon', 'instrument cu clape', 'avansat', 'acordeon.jpg'),

('Vioara Yamaha V3SKA', 'Vioara cu sunet cald și proiectare de înaltă calitate, ideală pentru studenți.', 399.00, 'vioara', 'instrument cu coarde', 'incepator', 'vioara.jpg'),

('Orga Roland C-380', 'Orga digitală cu 61 de clape, sunet autentic de orgă de biserică și funcții avansate.', 3999.00, 'orga', 'instrument cu clape', 'avansat', 'orga.jpg'),

('Flaut Yamaha YFL-212', 'Flaut de studiu cu mecanism precis și sunet expresiv.', 599.00, 'flaut', 'instrument de suflat', 'incepator', 'flaut.jpg'),

('Chitară electrică Fender Stratocaster', 'Chitară electrică legendară cu sunet versatil și design iconic.', 999.00, 'chitara', 'instrument cu coarde', 'mediu', 'chitara-electrica.jpg'),

('Pianina Yamaha U1', 'Pianina verticală cu sunet puternic și clape de calitate superioară.', 4999.00, 'pianina', 'instrument cu clape', 'avansat', 'pianina.jpg'),

('Contrabas Stentor Graduate', 'Contrabas acustic de studiu cu sunet profund și făcut din lemn de artar.', 1999.00, 'contrabas', 'instrument cu coarde', 'mediu', 'contrabas.jpg'),

('Trompetă Jupiter JTR700', 'Trompetă de studiu cu sunet clar și valori precise, potrivită pentru începători.', 699.00, 'trompeta', 'instrument de suflat', 'incepator', 'trompeta.jpg'),

('Mandolină Epiphone MM-30S', 'Mandolină acustică cu sunet strălucitor și finisaj clasic.', 299.00, 'mandolina', 'instrument cu coarde', 'incepator', 'mandolina.jpg'),

('Trombon King 2B', 'Trombon profesionist cu sunet bogat și construcție durabilă.', 1699.00, 'trombon', 'instrument de suflat', 'mediu', 'trombon.jpg'),

('Pian Yamaha C3X', 'Pian cu coadă de concert cu sunet puternic și finisaj de lux.', 24999.00, 'pian', 'instrument cu clape', 'avansat', 'pian.jpg'),

('Chitară clasică Ramirez R1', 'Chitară clasică de înaltă calitate cu sunet bogat și construcție tradițională.', 1499.00, 'chitara', 'instrument cu coarde', 'mediu', 'chitara-clasica.jpg'),

('Flaut piccolo Gemeinhardt 4P', 'Flaut piccolo profesionist cu sunet strălucitor și mecanism precis.', 899.00, 'flaut', 'instrument de suflat', 'avansat', 'flaut.jpg'),

('Vioara Cremona SV-800', 'Vioara profesională cu sunet expresiv și lemn de calitate superioară.', 2999.00, 'vioara', 'instrument cu coarde', 'avansat', 'vioara.jpg'),

('Acordeon Pigini P30/3', 'Acordeon de înaltă calitate cu sunet puternic și design elegant.', 5499.00, 'acordeon', 'instrument cu clape', 'avansat', 'acordeon.jpg'),

('Trompetă Bach Stradivarius 180S37', 'Trompetă profesională cu sunet cald și răspuns excelent.', 2199.00, 'trompeta', 'instrument de suflat', 'avansat', 'trompeta.jpg'),

('Pian digital Casio Privia PX-S3000', 'Pian digital compact cu sunet autentic de pian și funcții avansate.', 999.00, 'pian', 'instrument cu clape', 'mediu', 'pian.jpg'),

('Chitară bas Ibanez SR500E', 'Chitară bas electrică cu sunet puternic și finisaj modern.', 899.00, 'chitara', 'instrument cu coarde', 'mediu', 'chitara-bas.jpg'),

('Flaut traversier Pearl Quantz PF-665', 'Flaut profesionist cu sunet expresiv și mecanism precis.', 1899.00, 'flaut', 'instrument de suflat', 'avansat', 'flaut.jpg'),

('Contrabas electric NS Design WAV4', 'Contrabas electric cu sunet versatil și design modern.', 1499.00, 'contrabas', 'instrument cu coarde', 'mediu', 'contrabas.jpg');

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timi;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timi;