#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

// Define the expected schema
const EXPECTED_SCHEMA = {
  profiles: [
    'user_id', 'auth_user_id', 'name', 'phone_number', 'email', 
    'preferred_language', 'location_lat', 'location_lon', 'created_at',
    'farming_experience_years', 'farm_size', 'crop_preferences'
  ],
  locations: [
    'location_id', 'state', 'district', 'city_or_market', 'latitude', 'longitude',
    'soil_zone', 'climate_zone'
  ],
  crops: [
    'crop_id', 'crop_name', 'ideal_ph_min', 'ideal_ph_max', 'ideal_rainfall_min', 
    'ideal_rainfall_max', 'ideal_temp_min', 'ideal_temp_max', 'soil_type_suitability',
    'water_requirement', 'growing_season', 'malayalam_name'
  ],
  soil_data: [
    'soil_id', 'location_id', 'ph', 'organic_carbon', 'sand_percent', 'clay_percent', 
    'silt_percent', 'last_updated', 'nitrogen', 'phosphorus', 'potassium', 'moisture_level'
  ],
  weather_data: [
    'weather_id', 'location_id', 'temperature', 'rainfall', 'humidity', 'forecast_json', 
    'last_updated', 'wind_speed', 'solar_radiation', 'weather_condition'
  ],
  market_prices: [
    'market_price_id', 'crop_id', 'location_id', 'price', 'price_range_min', 
    'price_range_max', 'volume', 'date', 'last_updated', 'unit', 'demand_level'
  ],
  suitability_scores: [
    'score_id', 'user_id', 'crop_id', 'location_id', 'suitability_score', 
    'recommendation_reason', 'generated_at', 'ai_model', 'confidence'
  ],
  chat_history: [
    'chat_id', 'user_id', 'query', 'response', 'timestamp', 'language_code', 'context_used'
  ]
};

class SchemaChecker {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    this.client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('✅ Connected to Supabase database');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.client.end();
    console.log('✅ Disconnected from database');
  }

  async checkTables() {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const result = await this.client.query(query);
    return new Set(result.rows.map(row => row.table_name));
  }

  async checkColumns(tableName) {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
    `;
    
    const result = await this.client.query(query, [tableName]);
    return new Set(result.rows.map(row => row.column_name));
  }

  async verifySchema() {
    console.log('🔍 Checking database schema...\n');

    // Get all existing tables
    const existingTables = await this.checkTables();
    console.log(`Found ${existingTables.size} tables in public schema\n`);

    let totalTables = 0;
    let validTables = 0;
    let totalColumns = 0;
    let missingColumns = 0;

    // Check each expected table
    for (const [tableName, expectedColumns] of Object.entries(EXPECTED_SCHEMA)) {
      totalTables++;
      console.log(`📋 Checking table: ${tableName}`);

      if (!existingTables.has(tableName)) {
        console.log(`❌ Table: ${tableName} → does not exist\n`);
        continue;
      }

      // Get existing columns for this table
      const existingColumns = await this.checkColumns(tableName);
      totalColumns += expectedColumns.length;

      // Check each expected column
      const missingCols = [];
      for (const columnName of expectedColumns) {
        if (!existingColumns.has(columnName)) {
          missingCols.push(columnName);
          missingColumns++;
        }
      }

      if (missingCols.length === 0) {
        console.log(`✅ Table: ${tableName} → all ${expectedColumns.length} columns exist\n`);
        validTables++;
      } else {
        console.log(`❌ Table: ${tableName} → missing columns: ${missingCols.join(', ')}\n`);
      }
    }

    // Summary
    console.log('📊 SCHEMA VERIFICATION SUMMARY');
    console.log('='.repeat(40));
    console.log(`Tables checked: ${totalTables}`);
    console.log(`Valid tables: ${validTables}`);
    console.log(`Missing tables: ${totalTables - validTables}`);
    console.log(`Total columns expected: ${totalColumns}`);
    console.log(`Missing columns: ${missingColumns}`);
    console.log(`Schema completeness: ${Math.round(((totalColumns - missingColumns) / totalColumns) * 100)}%`);

    if (missingColumns === 0) {
      console.log('\n🎉 All tables and columns are present! Schema is complete.');
    } else {
      console.log('\n⚠️  Some tables or columns are missing. Please check the output above.');
    }
  }

  async getTableDetails(tableName) {
    console.log(`\n📋 Detailed info for table: ${tableName}`);
    
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `;
    
    const result = await this.client.query(query, [tableName]);
    
    if (result.rows.length === 0) {
      console.log('❌ Table does not exist');
      return;
    }

    console.log('Columns:');
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
      console.log(`  - ${row.column_name}: ${row.data_type}${length} ${nullable}${defaultVal}`);
    });
  }
}

async function main() {
  const checker = new SchemaChecker();
  
  try {
    await checker.connect();
    await checker.verifySchema();
    
    // Optional: Show detailed info for a specific table
    const showDetails = process.argv[2];
    if (showDetails) {
      await checker.getTableDetails(showDetails);
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
    process.exit(1);
  } finally {
    await checker.disconnect();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SchemaChecker };
