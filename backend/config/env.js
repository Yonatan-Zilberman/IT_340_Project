/**
 * Environment Variable Validation
 * Validates required environment variables on startup
 */

function validateEnv() {
  const required = ['MONGO_URI'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease create a .env file with the required variables.');
    process.exit(1);
  }

  // Set defaults for optional variables
  if (!process.env.PORT) {
    process.env.PORT = '5001'; // Changed from 5000 to avoid AirPlay conflict on macOS
  }

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not set. Using default (insecure for production).');
    process.env.JWT_SECRET = 'your-secret-key-change-in-production';
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('⚠️  WARNING: JWT_REFRESH_SECRET not set. Using default (insecure for production).');
    process.env.JWT_REFRESH_SECRET = 'your-refresh-secret-key-change-in-production';
  }

  console.log('✅ Environment variables validated');
}

module.exports = { validateEnv };

