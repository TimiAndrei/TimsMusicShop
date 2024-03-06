-- Database: musicshopdb

-- DROP DATABASE IF EXISTS musicshopdb;

CREATE DATABASE musicshopdb
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

GRANT TEMPORARY, CONNECT ON DATABASE musicshopdb TO PUBLIC;

GRANT ALL ON DATABASE musicshopdb TO postgres;

GRANT ALL ON DATABASE musicshopdb TO timi;

-- Table: public.accesari

-- DROP TABLE IF EXISTS public.accesari;

CREATE TABLE IF NOT EXISTS public.accesari
(
    id integer NOT NULL DEFAULT nextval('accesari_id_seq'::regclass),
    ip character varying(100) COLLATE pg_catalog."default" NOT NULL,
    user_id integer,
    pagina character varying(500) COLLATE pg_catalog."default" NOT NULL,
    data_accesare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT accesari_pkey PRIMARY KEY (id),
    CONSTRAINT accesari_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.utilizatori (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.accesari
    OWNER to postgres;

GRANT ALL ON TABLE public.accesari TO postgres;

GRANT ALL ON TABLE public.accesari TO timi;

-- Type: categ_instrument

-- DROP TYPE IF EXISTS public.categ_instrument;

CREATE TYPE public.categ_instrument AS ENUM
    ('instrument cu clape', 'instrument cu coarde', 'instrument de suflat');

ALTER TYPE public.categ_instrument
    OWNER TO postgres;

-- Type: categ_muzician

-- DROP TYPE IF EXISTS public.categ_muzician;

CREATE TYPE public.categ_muzician AS ENUM
    ('incepator', 'mediu', 'avansat');

ALTER TYPE public.categ_muzician
    OWNER TO postgres;

-- Type: roluri

-- DROP TYPE IF EXISTS public.roluri;

CREATE TYPE public.roluri AS ENUM
    ('admin', 'moderator', 'comun');

ALTER TYPE public.roluri
    OWNER TO postgres;

-- Type: tipuri_instrument

-- DROP TYPE IF EXISTS public.tipuri_instrument;

CREATE TYPE public.tipuri_instrument AS ENUM
    ('orga', 'acordeon', 'pian', 'pianina', 'chitara', 'mandolina', 'vioara', 'viola', 'contrabas', 'fluier', 'flaut', 'trompeta', 'trombon');

ALTER TYPE public.tipuri_instrument
    OWNER TO postgres;


-- Table: public.utilizatori

-- DROP TABLE IF EXISTS public.utilizatori;

CREATE TABLE IF NOT EXISTS public.utilizatori
(
    id integer NOT NULL DEFAULT nextval('utilizatori_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    nume character varying(100) COLLATE pg_catalog."default" NOT NULL,
    prenume character varying(100) COLLATE pg_catalog."default" NOT NULL,
    parola character varying(500) COLLATE pg_catalog."default" NOT NULL,
    rol roluri NOT NULL DEFAULT 'comun'::roluri,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    culoare_chat character varying(50) COLLATE pg_catalog."default" NOT NULL,
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cod character varying(200) COLLATE pg_catalog."default",
    confirmat_mail boolean DEFAULT false,
    poza character varying(200) COLLATE pg_catalog."default",
    CONSTRAINT utilizatori_pkey PRIMARY KEY (id),
    CONSTRAINT utilizatori_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.utilizatori
    OWNER to postgres;

GRANT ALL ON TABLE public.utilizatori TO postgres;

GRANT ALL ON TABLE public.utilizatori TO timi;