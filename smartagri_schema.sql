
-- Users table: stores farmer/app user information
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    preferred_language VARCHAR(50),
    location_lat DECIMAL(9,6),
    location_lon DECIMAL(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table: villages, mandis, regions
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    state VARCHAR(100),
    district VARCHAR(100),
    city_or_market VARCHAR(100),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

-- Crops table: reference info about crops
CREATE TABLE crops (
    crop_id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    ideal_ph_min DECIMAL(4,2),
    ideal_ph_max DECIMAL(4,2),
    ideal_rainfall_min DECIMAL(6,2),
    ideal_rainfall_max DECIMAL(6,2),
    ideal_temp_min DECIMAL(5,2),
    ideal_temp_max DECIMAL(5,2),
    soil_type_suitability VARCHAR(100)
);

-- Soil data table: stores SoilGrids API results
CREATE TABLE soil_data (
    soil_id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(location_id) ON DELETE CASCADE,
    ph DECIMAL(4,2),
    organic_carbon DECIMAL(5,2),
    sand_percent DECIMAL(5,2),
    clay_percent DECIMAL(5,2),
    silt_percent DECIMAL(5,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather data table: stores weather info from API
CREATE TABLE weather_data (
    weather_id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(location_id) ON DELETE CASCADE,
    temperature DECIMAL(5,2),
    rainfall DECIMAL(6,2),
    humidity DECIMAL(5,2),
    forecast_json JSONB,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market prices table: Agmarknet API data
CREATE TABLE market_prices (
    market_price_id SERIAL PRIMARY KEY,
    crop_id INT REFERENCES crops(crop_id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(location_id) ON DELETE CASCADE,
    price DECIMAL(10,2),
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    volume DECIMAL(12,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suitability scores table: AI-calculated recommendations
CREATE TABLE suitability_scores (
    score_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    crop_id INT REFERENCES crops(crop_id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(location_id) ON DELETE CASCADE,
    suitability_score INT CHECK (suitability_score BETWEEN 0 AND 100),
    recommendation_reason TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat history table: logs user-AI interactions
CREATE TABLE chat_history (
    chat_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
