--
-- PostgreSQL database dump
--

-- Dumped from database version 17.1 (Debian 17.1-1.pgdg120+1)
-- Dumped by pg_dump version 17.1 (Debian 17.1-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: domestic_flights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domestic_flights (
    id integer NOT NULL,
    origin text NOT NULL,
    destination text NOT NULL,
    depart_time time without time zone NOT NULL,
    depart_weekday integer NOT NULL,
    duration integer NOT NULL,
    arrival_time time without time zone NOT NULL,
    arrival_weekday integer NOT NULL,
    flight_no text NOT NULL,
    airline_code text NOT NULL,
    airline text NOT NULL,
    economy_fare numeric(10,2) NOT NULL,
    business_fare numeric(10,2) NOT NULL,
    first_fare numeric(10,2) NOT NULL
);


ALTER TABLE public.domestic_flights OWNER TO postgres;

--
-- Name: domestic_flights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.domestic_flights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.domestic_flights_id_seq OWNER TO postgres;

--
-- Name: domestic_flights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.domestic_flights_id_seq OWNED BY public.domestic_flights.id;


--
-- Name: international_flights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.international_flights (
    index integer NOT NULL,
    origin text NOT NULL,
    destination text NOT NULL,
    depart_time time without time zone NOT NULL,
    depart_weekday integer NOT NULL,
    duration integer NOT NULL,
    arrival_time time without time zone NOT NULL,
    arrival_weekday integer NOT NULL,
    flight_no text NOT NULL,
    airline_code text NOT NULL,
    airline text NOT NULL,
    economy_fare numeric(10,2) NOT NULL,
    business_fare numeric(10,2) NOT NULL,
    first_fare numeric(10,2) NOT NULL
);


ALTER TABLE public.international_flights OWNER TO postgres;

--
-- Name: international_flights_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.international_flights_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.international_flights_index_seq OWNER TO postgres;

--
-- Name: international_flights_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.international_flights_index_seq OWNED BY public.international_flights.index;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "firstName" character varying,
    "lastName" character varying,
    role character varying DEFAULT 'user'::character varying NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: domestic_flights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domestic_flights ALTER COLUMN id SET DEFAULT nextval('public.domestic_flights_id_seq'::regclass);


--
-- Name: international_flights index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.international_flights ALTER COLUMN index SET DEFAULT nextval('public.international_flights_index_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: domestic_flights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domestic_flights (id, origin, destination, depart_time, depart_weekday, duration, arrival_time, arrival_weekday, flight_no, airline_code, airline, economy_fare, business_fare, first_fare) FROM stdin;
\.


--
-- Data for Name: international_flights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.international_flights (index, origin, destination, depart_time, depart_weekday, duration, arrival_time, arrival_weekday, flight_no, airline_code, airline, economy_fare, business_fare, first_fare) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, password, "firstName", "lastName", role) FROM stdin;
\.


--
-- Name: domestic_flights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.domestic_flights_id_seq', 1, false);


--
-- Name: international_flights_index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.international_flights_index_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 1, false);


--
-- Name: domestic_flights PK_59bfb67131598b2636f801d47bb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domestic_flights
    ADD CONSTRAINT "PK_59bfb67131598b2636f801d47bb" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: international_flights PK_e5243c5e47f4a5d34145a59f647; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.international_flights
    ADD CONSTRAINT "PK_e5243c5e47f4a5d34145a59f647" PRIMARY KEY (index);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- PostgreSQL database dump complete
--

