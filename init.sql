CREATE TABLE IF NOT EXISTS airports (
    city TEXT,
    airport TEXT,
    code TEXT PRIMARY KEY,
    country TEXT
);

CREATE TABLE IF NOT EXISTS domestic_flights (
    id SERIAL PRIMARY KEY,
    origin TEXT,
    destination TEXT,
    depart_time TIME,
    depart_weekday INTEGER,
    duration INTEGER,
    arrival_time TIME,
    arrival_weekday INTEGER,
    flight_no TEXT,
    airline_code TEXT,
    airline TEXT,
    economy_fare NUMERIC(10,2),
    business_fare NUMERIC(10,2),
    first_fare NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS international_flights (
    index SERIAL PRIMARY KEY,
    origin TEXT,
    destination TEXT,
    depart_time TIME,
    depart_weekday INTEGER,
    duration INTEGER,
    arrival_time TIME,
    arrival_weekday INTEGER,
    flight_no TEXT,
    airline_code TEXT,
    airline TEXT,
    economy_fare NUMERIC(10,2),
    business_fare NUMERIC(10,2),
    first_fare NUMERIC(10,2)
);