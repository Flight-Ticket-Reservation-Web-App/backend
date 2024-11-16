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
-- Name: airports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.airports (
    city text,
    airport text,
    code text,
    country text
);


ALTER TABLE public.airports OWNER TO postgres;

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
-- Data for Name: airports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.airports (city, airport, code, country) FROM stdin;
Atlanta	Hartsfield–Jackson Atlanta International Airport	ATL	United States
Beijing	Beijing Capital International Airport	PEK	China
Dubai	Dubai International Airport	DXB	United Arab Emirates
Los Angeles	Los Angeles International Airport	LAX	United States
Chicago	O'Hare International Airport	ORD	United States
London	Heathrow Airport	LHR	United Kingdom
Tokyo	Haneda Airport	HND	Japan
Hong Kong	Hong Kong International Airport	HKG	Hong Kong
Shanghai	Shanghai Pudong International Airport	PVG	China
Paris	Charles de Gaulle International Airport	CDG	France
Amsterdam	Amsterdam Airport Schiphol	AMS	Netherlands
Dallas	Dallas-Fort Worth International Airport	DFW	United States
Guangzhou	Guangzhou Baiyun International Airport	CAN	China
Frankfurt	Frankfurt am Main International Airport	FRA	Germany
Istanbul	Istanbul Atatürk Airport	IST	Turkey
Delhi	Indira Gandhi International Airport	DEL	India
Jakarta	Soekarno-Hatta International Airport	CGK	Indonesia
Singapore	Singapore Changi Airport	SIN	Singapore
Seoul	Incheon International Airport	ICN	South Korea
Denver	Denver International Airport	DEN	United States
Bangkok	Suvarnabhumi Airport	BKK	Thailand
New York	John F. Kennedy International Airport	JFK	United States
Kuala Lumpur	Kuala Lumpur International Airport	KUL	Malaysia
San Francisco	San Francisco International Airport	SFO	United States
Madrid	Adolfo Suárez Madrid–Barajas Airport	MAD	Spain
Chengdu	Chengdu Shuangliu International Airport	CTU	China
Las Vegas	McCarran International Airport	LAS	United States
Barcelona	Barcelona–El Prat Airport	BCN	Spain
Mumbai	Chhatrapati Shivaji International Airport	BOM	India
Toronto	Toronto Pearson International Airport	YYZ	Canada
Seattle	Seattle–Tacoma International Airport	SEA	United States
Charlotte	Charlotte Douglas International Airport	CLT	United States
London	Gatwick Airport	LGW	United Kingdom
Shenzhen	Shenzhen Bao'an International Airport	SZX	China
Taipei	Taiwan Taoyuan International Airport	TPE	Taiwan
Mexico City	Mexico City International Airport	MEX	Mexico
Kunming	Kunming Changshui International Airport	KMG	China
Munich	Munich Airport	MUC	Germany
Orlando	Orlando International Airport	MCO	United States
Miami	Miami International Airport	MIA	United States
Phoenix	Phoenix Sky Harbor International Airport	PHX	United States
Sydney	Sydney Airport	SYD	Australia
Newark	Newark Liberty International Airport	EWR	United States
Manila	Ninoy Aquino International Airport	MNL	Philippines
Shanghai	Shanghai Hongqiao International Airport	SHA	China
Xi'an	Xi'an Xianyang International Airport	XIY	China
Rome	Leonardo da Vinci–Fiumicino Airport	FCO	Italy
Houston	George Bush Intercontinental Houston Airport	IAH	United States
Tokyo	Narita International Airport	NRT	Japan
Moscow	Sheremetyevo International Airport	SVO	Russia
Chongqing	Chongqing Jiangbei International Airport	CKG	China
Bangkok	Don Mueang International Airport	DMK	Thailand
Minneapolis	Minneapolis-St Paul International/Wold-Chamberlain Airport	MSP	United States
Sao Paulo	São Paulo–Guarulhos International Airport	GRU	Brazil
Boston	Logan International Airport	BOS	United States
Ho Chi Minh City	Tan Son Nhat International Airport	SGN	Vietnam
Doha	Hamad International Airport	DOH	Qatar
Hangzhou	Hangzhou Xiaoshan International Airport	HGH	China
Detroit	Detroit Metropolitan Wayne County Airport	DTW	United States
Jeddah	King Abdulaziz International Airport	JED	Saudi Arabia
Melbourne	Melbourne Airport	MEL	Australia
Fort Lauderdale	Fort Lauderdale Hollywood International Airport	FLL	United States
Orlando	Orlando Executive Airport	ORL	United States
Istanbul	Sabiha Gökçen International Airport	SAW	Turkey
Bogota	El Dorado International Airport	BOG	Colombia
Moscow	Moscow Domodedovo Airport	DME	Russia
Cheju	Jeju International Airport	CJU	South Korea
New York	LaGuardia Airport	LGA	United States
Philadelphia	Philadelphia International Airport	PHL	United States
Dublin	Dublin Airport	DUB	Ireland
Zurich	Zürich Airport	ZRH	Switzerland
Copenhagen	Copenhagen Airport	CPH	Denmark
Osaka	Kansai International Airport	KIX	Japan
Palma de Mallorca	Palma De Mallorca Airport	PMI	Spain
Manchester	Manchester Airport	MAN	United Kingdom
Oslo	Oslo Airport, Gardermoen	OSL	Norway
Lisbon	Lisbon Portela Airport	LIS	Portugal
Stockholm	Stockholm Arlanda Airport	ARN	Sweden
Baltimore	Baltimore/Washington International Thurgood Marshall Airport	BWI	United States
Antalya	Antalya Airport	AYT	Turkey
London	London Stansted Airport	STN	United Kingdom
Nanjing	Nanjing Lukou International Airport	NKG	China
Seoul	Gimpo International Airport	GMP	South Korea
Bangalore	Kempegowda International Airport	BLR	India
Riyadh	King Khaled International Airport	RUH	Saudi Arabia
Brussels	Brussels Airport	BRU	Belgium
Duesseldorf	Düsseldorf International Airport	DUS	Germany
Xiamen	Xiamen Gaoqi International Airport	XMN	China
Vienna	Vienna International Airport	VIE	Austria
Zhengzhou	Zhengzhou Xinzheng International Airport	CGO	China
Salt Lake City	Salt Lake City International Airport	SLC	United States
Vancouver	Vancouver International Airport	YVR	Canada
Washington	Ronald Reagan Washington National Airport	DCA	United States
Changcha	Changsha Huanghua International Airport	CSX	China
Abu Dhabi	Abu Dhabi International Airport	AUH	United Arab Emirates
Cancun	Cancún International Airport	CUN	Mexico
Fukuoka	Fukuoka Airport	FUK	Japan
Qingdao	Liuting Airport	TAO	China
Brisbane	Brisbane International Airport	BNE	Australia
Wuhan	Wuhan Tianhe International Airport	WUH	China
Chennai	Chennai International Airport	MAA	India
Kochi	Cochin International Airport	COK	India
Hyderabad	Rajiv Gandhi International Airport	HYD	India
Thiruvananthapuram	Trivandrum International Airport	TRV	India
Kolkata	Netaji Subhash Chandra Bose International Airport	CCU	India
Ahmedabad	Sardar Vallabhbhai Patel International Airport	AMD	India
Calicut	Calicut International Airport	CCJ	India
Jaipur	Jaipur International Airport	JAI	India
Vasco da Gama	Dabolim Airport	GOI	India
Lucknow	Chaudhary Charan Singh International Airport	LKO	India
Coimbatore	Coimbatore International Airport	CJB	India
Tiruchirappally	Tiruchirapally Civil Airport Airport	TRZ	India
Pune	Pune Airport	PNQ	India
Siliguri	Bagdogra Airport	IXB	India
Guwahati	Lokpriya Gopinath Bordoloi International Airport	GAU	India
Visakhapatnam	Vishakhapatnam Airport	VTZ	India
Amritsar	Sri Guru Ram Dass Jee International Airport	ATQ	India
Madurai	Madurai Airport	IXM	India
Naqpur	Dr. Babasaheb Ambedkar International Airport	NAG	India
Chandigarh	Chandigarh Airport	IXC	India
Jammu	Jammu Airport	IXJ	India
Srinagar	Sheikh ul Alam Airport	SXR	India
Mangalore	Mangalore International Airport	IXE	India
Port Blair	Vir Savarkar International Airport	IXZ	India
Indore	Devi Ahilyabai Holkar Airport	IDR	India
Agartala	Agartala Airport	IXA	India
Patna	Lok Nayak Jayaprakash Airport	PAT	India
\.


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

