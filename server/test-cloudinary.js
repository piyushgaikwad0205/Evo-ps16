require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('\n=== Cloudinary Diagnostic Test ===\n');

// Check if dotenv loaded the variables
console.log('Environment Variables:');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT LOADED');
console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ LOADED' : '❌ NOT LOADED');
console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ LOADED' : '❌ NOT LOADED');

const config = cloudinary.config();

console.log('\nCloudinary Config:');
console.log('  Cloud Name:', config.cloud_name || '❌ NOT SET');
console.log('  API Key:', config.api_key ? '✅ SET (***' + config.api_key.slice(-4) + ')' : '❌ NOT SET');
console.log('  API Secret:', config.api_secret ? '✅ SET (***' + config.api_secret.slice(-4) + ')' : '❌ NOT SET');

if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.log('\n⚠️  Configuration incomplete!');
    process.exit(1);
}

console.log('\n✅ Configuration loaded successfully!');
console.log('\nTesting Cloudinary connection...\n');

// Test the connection
cloudinary.api.ping()
    .then(result => {
        console.log('✅ Connection successful!');
        console.log('   Status:', result.status);
        console.log('\n🎉 Cloudinary is working perfectly!\n');
        console.log('📸 You can now upload images to Cloudinary!');
        console.log('   - Profile photos will be stored in: campus-connects/avatars/');
        console.log('   - Story media will be stored in: campus-connects/stories/\n');
    })
    .catch(err => {
        console.log('❌ Connection failed!');
        console.log('\nError Details:');
        console.log('  Message:', err.message || 'Unknown error');
        console.log('  Error:', err.error?.message || err.toString());

        console.log('\n⚠️  Possible issues:');
        console.log('  1. Cloud name might be incorrect');
        console.log('  2. API credentials might be wrong');
        console.log('  3. Internet connection issue');
        console.log('\n💡 Tip: Your cloud name should look like "dxxxxx" or a custom name');
        console.log('   Check your Cloudinary dashboard: https://cloudinary.com/console\n');
        process.exit(1);
    });
