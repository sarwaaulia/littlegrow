## 🍼 Little Grow - Mini Baby Store 
Little Grow is a modern, full-stack E-commerce "Mini Store" specifically designed for baby essentials. This project focuses on a seamless user experience with real-time updates and a robust payment integration.

## 🚀 Key Features🛒 
1. Customer ExperienceAuth System: Secure Signup, Login, and Logout using Supabase Auth.
2. Browse & Search: Effortlessly find baby products with real-time search and category filtering.
3. Shopping Cart: Smooth cart management powered by Zustand.
4. Real-time Stock: Product stock updates instantly across all open browsers without refreshing.
5. Seamless Checkout: Integrated with Midtrans Payment Gateway (Sandbox) for various payment methods (VA, E-wallets, etc.).
6. Order Tracking: Users can view their order history and track status changes in real-time.
7. Email Notifications: Automated order confirmations sent via Resend.
8. 🛠 Admin DashboardProduct Management: Full CRUD (Create, Read, Update, Delete) capabilities for products.
9. Order Management: View and update customer order statuses.
10. Sales Analytics: Visual charts showing sales performance and product trends.
11. Data Export: Export sales and transaction reports directly to Excel files.
12. 📱 Technical HighlightsReal-time Sync: Powered by Supabase WebSockets.
13. Fully Responsive: Beautifully optimized for Desktop, Tablet, and Mobile.
14. Secure: Row Level Security (RLS) on database and protected API routes.

## 💻 Tech Stack
Layer	          Technology
Frontend	      Next.js (App Router), Tailwind CSS, shadcn/ui
State           Management	Zustand
Validation	    React Hook Form, Zod
Database & Auth	Supabase (PostgreSQL)
Real-time	      Supabase Realtime (WebSockets)
File Storage	  Supabase Storage (Product Images)
Payment Gateway	Midtrans (Sandbox)
Email Service	  Resend
Deployment	    Vercel

## 🛠 Installation & Setup 
Follow these steps to run Little Grow on your local machine:
1. Clone the RepositoryBashgit clone https://github.com/your-username/little-grow.git
2. cd little-grow
3. Install Dependencies npm install
# or
yarn install
3. Environment VariablesCreate a .env.local file in the root directory and fill in your credentials:
Code snippet

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Midtrans
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

4. Database Setup
5. Enable Realtime for your products and orders tables in the Supabase Dashboard (Database -> Replication).
6. Set up the necessary tables (Products, Orders, Categories, Profiles).
7. Configure Storage bucket named product-images with public access.
8. Run the Project Bash npm run dev
9. Open http://localhost:3000 in your browser.

## ⚓ Webhook Testing (Midtrans)
1. To test the payment notification locally, use Ngrok:Run ngrok http 3000.
2. Copy the Ngrok URL to Midtrans Dashboard -> Settings -> Configuration -> Payment Notification URL.
3. Path: https://your-ngrok-url.app/api/webhook/midtrans.

## 📄 LicenseThis project is for educational purposes. 
Feel free to use it as a reference for building e-commerce applications.
Developed with ❤️ by Sarwa Aulia
