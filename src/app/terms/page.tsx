import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export const metadata = { title: "Terms of Service — Flamingo Market" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[820px] mx-auto px-5 py-14">
        <div className="mb-10">
          <div className="w-12 h-12 bg-pink-pale rounded-2xl flex items-center justify-center mb-4"><FileText className="w-5 h-5 text-pink" /></div>
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Terms of Service</h1>
          <p className="text-gray-400 text-[13px]">Last updated: July 2026</p>
        </div>

        <div className="prose-legal space-y-8 text-[14px] text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Flamingo Market (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. Flamingo Market Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) reserves the right to update these terms at any time; continued use of the Platform after changes constitutes acceptance.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">2. Account Registration</h2>
            <p>To buy or sell on Flamingo Market, you must register an account and verify your email address. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">3. Seller Obligations</h2>
            <p>Sellers are independent third parties responsible for the accuracy of their product listings, the quality and legality of goods sold, and fulfillment of orders. Flamingo Market does not manufacture, inspect, or warehouse products listed by sellers unless explicitly stated. Sellers agree to a platform commission on completed sales, currently set at 10%, deducted automatically from proceeds.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">4. Buyer Conduct</h2>
            <p>Buyers agree to provide accurate delivery information and to pay for orders placed through approved payment methods (MTN Mobile Money, Airtel Money, card payment, or cash on delivery where available). Fraudulent orders, chargebacks made in bad faith, or abuse of the returns process may result in account suspension.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">5. Prohibited Items &amp; Conduct</h2>
            <p>The following are strictly prohibited on Flamingo Market: counterfeit goods, stolen property, weapons, illegal drugs or substances, hazardous materials without proper licensing, and any content or product that violates Rwandan law. Flamingo Market reserves the right to remove listings and suspend accounts that violate this policy without prior notice.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">6. Payments &amp; Refunds</h2>
            <p>All payments are processed through our integrated payment partners. Funds from completed, delivered orders are released to sellers according to the schedule described in our Fees page. Refunds for cancelled or disputed orders follow the process outlined in our Returns &amp; Refunds policy.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">7. Limitation of Liability</h2>
            <p>Flamingo Market acts as a marketplace connecting independent buyers and sellers. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from transactions between users. Our total liability in any matter arising from these terms is limited to the fees we received in connection with the relevant transaction.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">8. Termination</h2>
            <p>We may suspend or terminate your account at our discretion for violations of these terms, fraudulent activity, or behavior that harms other users or the Platform. You may close your account at any time by contacting support.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the Republic of Rwanda. Any disputes arising from use of the Platform will be subject to the exclusive jurisdiction of the courts of Rwanda.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">10. Contact</h2>
            <p>Questions about these Terms can be directed to our support team via the <a href="/contact" className="text-pink font-semibold hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
