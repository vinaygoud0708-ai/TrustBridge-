const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('.env file not found. Creating a default one with mock configuration.');
  const defaultEnv = `# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="trustbridge-local-secret-key-321-654-987"
NEXTAUTH_URL="http://localhost:3000"

# Google Auth (Optional)
GOOGLE_CLIENT_ID="mock-google-client-id"
GOOGLE_CLIENT_SECRET="mock-google-client-secret"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_mock_key"
STRIPE_PUBLISHABLE_KEY="pk_test_mock_key"
STRIPE_WEBHOOK_SECRET="whsec_mock_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_mock_key"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="mock_cloud"
CLOUDINARY_API_KEY="mock_key"
CLOUDINARY_API_SECRET="mock_secret"

# Email Configuration
RESEND_API_KEY="re_mock_key"

# Pusher Realtime
PUSHER_APP_ID="mock_pusher_app_id"
PUSHER_KEY="mock_pusher_key"
PUSHER_SECRET="mock_pusher_secret"
PUSHER_CLUSTER="mock_pusher_cluster"
NEXT_PUBLIC_PUSHER_KEY="mock_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="mock_pusher_cluster"
`;
  fs.writeFileSync(envPath, defaultEnv);
} else {
  console.log('.env file already exists.');
}
