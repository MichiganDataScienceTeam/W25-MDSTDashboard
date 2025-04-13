const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure .env file exists for build
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Creating placeholder .env file for build...');
  fs.writeFileSync(
    path.join(__dirname, '.env'),
    `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
NEXT_PUBLIC_GOOGLE_CLIENT_ID=placeholder.apps.googleusercontent.com`
  );
}

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Make sure SWC dependencies are installed
console.log('Installing SWC dependencies...');
execSync('npm install @next/swc-win32-x64-msvc @next/swc-linux-x64-gnu @next/swc-linux-x64-musl --no-save', { stdio: 'inherit' });

// Run build
console.log('Building the application...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}

console.log('Deployment preparation complete!'); 