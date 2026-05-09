# IT Asset & Subscription Management Portal

Secure admin-only web app for internal IT teams to manage:

- IT subscriptions
- Vendors
- Server inventory
- CSV import/export workflows
- Admin user access

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- MongoDB (local) + Mongoose
- NextAuth (credentials login)
- bcryptjs
- papaparse
- zod

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start local MongoDB.

3. Open MongoDB Compass and connect:

```text
mongodb://127.0.0.1:27017
```

4. Database:

```text
it_subscription_management
```

5. Create `.env`:

```env
MONGODB_URI="mongodb://127.0.0.1:27017/it_subscription_management"
NEXTAUTH_SECRET="change-this-secret"
NEXTAUTH_URL="http://localhost:3000"
```

6. Run seed admin:

```bash
npm run seed:admin
```

7. Start project:

```bash
npm run dev
```

8. Login:

```text
admin@example.com
Admin@12345
```

## Scripts

- `npm run dev` - start local server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - lint code
- `npm run seed:admin` - seed default SUPER_ADMIN

## Security Notes

- No public registration
- Passwords stored as bcrypt hashes
- All dashboard routes are protected
- API routes enforce authenticated admin access
- `SUPER_ADMIN` required for admin user creation/deletion
- Password hashes are never returned in API responses
