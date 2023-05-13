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
   imagine VARCHAR(300),
   tip_instrument tipuri_instrument,
   categorie categ_instrument,
   pret NUMERIC(8,2) NOT NULL,
   greutate NUMERIC(5,2) CHECK (greutate>0),
   data_adaugare TIMESTAMP DEFAULT current_timestamp,
   pentru categ_muzician, 
   material VARCHAR[],
   are_cutie_transport BOOLEAN
);

INSERT into instrumente (nume, descriere, imagine, tip_instrument, categorie, pret, greutate, pentru, material, are_cutie_transport) VALUES 

('Acordeon Hohner Bravo III 96', 'Acordeon cu 96 de basuri, sunet puternic și design ergonomic.','acordeon.jpg', 'acordeon','instrument cu clape', 1599.00, 10, 'avansat', '{"carbon", "metal", "plastic"}', true),

('Acordeon Hohner Bravo III 72', 'Acordeon cu 72 de basuri, sunet puternic și design ergonomic.','acordeon.jpg', 'acordeon','instrument cu clape', 1299.00, 9.5, 'mediu', '{"lemn", "metal", "plastic"}', true),

('Vioara 4/4 Stentor Student', 'Vioara cu sunet clar și calitate, perfectă pentru studenți.','vioara.jpg', 'vioara','instrument cu coarde', 599.00, 2.3, 'incepator', '{"lemn", "carbon", "fildeș"}', true),

('Orga Roland C-330', 'Orga cu 36 de clape, sunete și funcții avansate.','orga.jpg', 'orga','instrument cu clape', 4599.00, 66, 'avansat', '{"lemn", "metal", "plastic"}', true),

('Flaut Yamaha YFL-212', 'Flaut pentru începători, cu sunet clar și intonație precisă.','flaut.jpg', 'flaut','instrument de suflat', 499.00, 0.4, 'incepator', '{"lemn", "metal"}', false),

('Chitară electrică Fender Stratocaster', 'Chitară electrică iconică, cu sunet puternic și ușor de cântat.','chitara.jpg', 'chitara','instrument cu coarde', 1999.00, 4.5, 'mediu', '{"lemn", "metal"}', true),

('Pianină Yamaha P-45', 'Pianină compactă, cu sunet de înaltă calitate și tastatură cu sensibilitate la atingere.','pianina.jpg', 'pianina','instrument cu clape', 749.00, 11.5, 'incepator', '{"lemn", "metal", "plastic"}', false),

('Contrabas Stagg EDB-3/4', 'Contrabas electric cu sunet profund și potențiometru de volum.','contrabas.jpg', 'contrabas','instrument cu coarde', 999.00, 4.8, 'avansat', '{"lemn", "metal", "carbon"}', false),

('Trompetă Yamaha YTR-2330', 'Trompetă pentru începători, cu sunet cald și intonație precisă.','trompeta.jpg', 'trompeta','instrument de suflat', 899.00, 1.1, 'incepator', '{"metal"}', true),

('Mandolină Stagg M20', 'Mandolină cu sunet puternic și calitate, potrivită pentru diverse genuri muzicale.','mandolina.jpg', 'mandolina','instrument cu coarde', 199.00, 1.4, 'mediu', '{"lemn"}', true),

('Trombon Jupiter JTB700', 'Trombon de calitate, cu sunet puternic și intonație precisă.','trombon.jpg', 'trombon','instrument de suflat', 999.00, 2.7, 'avansat', '{"metal"}', false),

('Pian Yamaha YDP-144', 'Pian digital cu 88 de clape și 10 sunete de pian, inclusiv Yamaha CFX Grand și Bösendorfer Imperial. Are funcții de înregistrare, playback și conectivitate Bluetooth.', 'pian.jpg', 'pian', 'instrument cu clape', 1250.00, 38.0, 'mediu', '{"lemn", "metal"}', true),

('Chitara clasica Valencia CG160', 'Chitara clasica cu corp din lemn de artar, finisaj lucios, tastiera din lemn de trandafir și corzi de nylon. Are sunet cald și clar.', 'chitara_clasica.jpg', 'chitara', 'instrument cu coarde', 250.00, 2.1, 'incepator', '{"lemn"}', false),

('Flaut Yamaha YFL-222', 'Flaut de nivel începător cu picior deschis și mecanisme plate pentru un răspuns precis și ușor de jucat. Are corp din alamă și cap argintat pentru un sunet cald și clar.', 'flaut.jpg', 'flaut', 'instrument de suflat', 500.00, 0.4, 'incepator', '{"alama", "argint"}', true),

('Vioara Stentor Student II', 'Vioară pentru studenți, cu corp din lemn de artar, finisaj lucios, tastieră din lemn de ebonită și corzi Pirastro. Vine cu husă și arc.', 'vioara.jpg', 'vioara', 'instrument cu coarde', 300.00, 0.5, 'incepator', '{"lemn"}', true),

('Acordeon Weltmeister Rubin', 'Acordeon cu sunet puternic, corp din lemn de fag și clapete din aluminiu. Are 34 de clape și 72 de basuri. Vine cu curea și husă.', 'acordeon.jpg', 'acordeon', 'instrument cu clape', 2100.00, 8.5, 'avansat', '{"lemn", "metal"}', true),

('Trompeta Yamaha YTR-2330', 'Trompetă de nivel începător cu campană din alamă și pistonii din alamă nichelată. Are un sunet clar și puternic și vine cu un rucsac pentru transport.', 'trompeta.jpg', 'trompeta', 'instrument de suflat', 750.00, 1.0, 'incepator', '{"alama", "nickel"}', true),

('Pian digital Roland FP-30X', 'Pian digital portabil cu 88 de clape și tehnologie SuperNATURAL de generare a sunetului. Are funcții de conectivitate Bluetooth, înregistrare și playback. Vine cu o pedală și un suport opțional.', 'pian.jpg', 'pian', 'instrument cu clape', 999.00, 14.1, 'mediu', '{"lemn", "metal"}', false),

('Chitară bas Fender Player Series Precision Bass', 'Bas electric cu 4 corzi, două split single coil pickups, buton de ton și două de volum.','chitara_bas.jpg', 'chitara','instrument cu coarde', 999.00, 4.50, 'mediu', '{"lemn", "metal"}', true),

('Flaut Roland GCC-400', 'Flaut din alamă cu 16 găuri închise, mecanism de mișcare offset G și teava dreaptă.','flaut.jpg', 'flaut','instrument de suflat', 699.00, 0.65, 'incepator', '{"metal"}', true),

('Contrabas Yamaha SVC-210', 'Contrabas electric portabil, cu corzi din nailon și efecte digitale integrate.','contrabas.jpg', 'contrabas','instrument cu coarde', 2799.00, 8.50, 'avansat', '{"lemn", "metal", "plastic"}', false);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timi;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timi;