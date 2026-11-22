import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Privacy Policy — Flamingo Market" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[820px] mx-auto px-5 py-14">
        <div className="mb-10">
          <div className="w-12 h-12 bg-cyan-light rounded-2xl flex items-center justify-center mb-4"><ShieldCheck className="w-5 h-5 text-cyan" /></div>
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-[13px]">Last updated: July 2026</p>
        </div>
        <div className="space-y-8 text-[14px] text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">1. Information We Collect</h2>
            <p>When you create an account, we collect your name, email address, and password (stored securely hashed, never in plain text). When you place an order, we collect your delivery address and phone number. If you sign in with Google, we receive your name, email, and profile image from Google's OAuth service.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to: process and fulfill orders, send order confirmations and status updates, verify your email address via one-time codes, prevent fraud, communicate with you about your account, and improve the Platform. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">3. Payment Information</h2>
            <p>Flamingo Market does not store your full payment card details. Card payments are processed by Stripe; Mobile Money payments are processed by MTN and Airtel's payment APIs. These providers have their own privacy policies governing how they handle payment data.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">4. Data Sharing</h2>
            <p>We share your delivery name, address, and phone number with the seller fulfilling your order, since this is necessary for delivery. We share order details with our payment processors to complete transactions. We do not share your data with advertisers.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">5. Cookies &amp; Local Storage</h2>
            <p>We use browser local storage to remember your shopping cart and wishlist between visits. We use session cookies to keep you signed in. We do not use third-party tracking or advertising cookies.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">6. Data Retention</h2>
            <p>We retain your account information for as long as your account is active. Order records are retained for accounting and legal compliance purposes even after account deletion, with personal identifiers minimized where possible.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">7. Your Rights</h2>
            <p>You can access, update, or delete your account information at any time from your dashboard. You can request a copy of your data or full account deletion by contacting our support team.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">8. Security</h2>
            <p>We use industry-standard encryption for data in transit (HTTPS/TLS) and store passwords using bcrypt hashing. While we take reasonable measures to protect your data, no system is completely secure, and we cannot guarantee absolute security.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">9. Children's Privacy</h2>
            <p>Flamingo Market is not intended for use by individuals under 18. We do not knowingly collect data from minors.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">10. Contact Us</h2>
            <p>For privacy-related questions or requests, please reach out via our <a href="/contact" className="text-pink font-semibold hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
