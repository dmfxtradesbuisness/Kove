import Link from 'next/link'
import { KoveWordmark } from '@/components/KoveLogo'

export const metadata = {
  title: 'Terms of Service — KoveFX',
  description: 'KoveFX Terms of Service. Please read before using our platform.',
}

export default function TermsPage() {
  const lastUpdated = 'April 16, 2025'

  return (
    <div style={{ background: '#000000', color: '#fff', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <KoveWordmark height={28} />
          </Link>
          <Link
            href="/signup"
            style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.15s' }}
          >
            ← Back
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
            Legal
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Terms of Service
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>

          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using KoveFX (&quot;the Service&quot;, &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service. By creating an account, you represent that you are at least 18 years of age and have the legal capacity to enter into a binding agreement.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              KoveFX is a trading journal and performance analytics platform that allows users to log, track, and analyze their trading activity. The Service includes trade logging, statistical analysis, AI-powered insights (Pro plan), community features, and supporting tools.
            </p>
            <p>
              KoveFX is a journaling and educational tool only. It is not a brokerage, investment advisor, or financial service provider. We do not execute trades, hold funds, or provide regulated financial services.
            </p>
          </Section>

          <Section title="3. No Financial Advice">
            <p>
              <strong style={{ color: '#fff' }}>KoveFX does not provide financial or investment advice.</strong> All content on the platform — including AI-generated insights, statistics, and community posts — is for informational and educational purposes only. Nothing on the platform constitutes a recommendation to buy, sell, or hold any financial instrument.
            </p>
            <p>
              Trading financial instruments carries significant risk of loss. Past performance does not guarantee future results. You are solely responsible for your trading decisions and any financial outcomes.
            </p>
          </Section>

          <Section title="4. User Accounts">
            <p>
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.
            </p>
            <p>
              You must notify us immediately of any unauthorized use of your account. KoveFX reserves the right to terminate accounts that violate these Terms or engage in fraudulent, abusive, or harmful behavior.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
              {[
                'Use the Service for any unlawful purpose or in violation of any applicable laws',
                'Post or share content that is defamatory, harassing, hateful, or misleading',
                'Attempt to reverse-engineer, scrape, or interfere with the Service',
                'Use the Service to distribute spam, malware, or unauthorized advertising',
                'Impersonate any person or entity, or misrepresent your affiliation',
                'Share fabricated trade data or false performance records to mislead others',
              ].map((item) => (
                <li key={item} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="6. User Content">
            <p>
              You retain ownership of trade data, notes, and other content you submit to the platform (&quot;User Content&quot;). By submitting User Content, you grant KoveFX a limited, non-exclusive license to store, display, and process your content solely to provide the Service to you.
            </p>
            <p>
              Community posts you choose to publish are visible to other users. You are solely responsible for content you post publicly. KoveFX may remove content that violates these Terms.
            </p>
          </Section>

          <Section title="7. Subscription and Billing">
            <p>
              KoveFX offers a free Starter plan and a paid Pro plan. Pro features require an active paid subscription. Subscription fees are charged monthly or annually as selected at checkout.
            </p>
            <p>
              All payments are processed securely by our payment provider. Subscriptions renew automatically unless cancelled. You may cancel at any time from your account settings. Upon cancellation, your Pro access remains active until the end of the current billing period.
            </p>
            <p>
              We offer a 7-day money-back guarantee on new Pro subscriptions. Refunds after 7 days are at our discretion. We reserve the right to change pricing with 30 days&apos; notice to existing subscribers.
            </p>
          </Section>

          <Section title="8. Data and Privacy">
            <p>
              Your privacy is important to us. Your trade data, journal entries, and account information are private by default and not shared with third parties without your consent, except as required to operate the Service (e.g., hosting providers, payment processors) or comply with applicable law.
            </p>
            <p>
              We use industry-standard security measures to protect your data. However, no system is 100% secure. You acknowledge that you use the Service at your own risk with respect to data security.
            </p>
            <p>
              We may collect anonymized, aggregated usage data to improve the platform. This data cannot be used to identify individual users.
            </p>
          </Section>

          <Section title="9. AI Features">
            <p>
              Pro subscribers have access to AI-powered analysis (&quot;KoveAI&quot;) that analyzes their logged trades to identify patterns and provide coaching insights. AI-generated content is based solely on data you have logged in the platform and is provided for educational purposes only.
            </p>
            <p>
              AI analysis may contain errors, omissions, or inaccuracies. KoveFX does not guarantee the accuracy, completeness, or fitness for any particular purpose of AI-generated insights. You should not rely on AI analysis as the sole basis for any trading decision.
            </p>
          </Section>

          <Section title="10. Intellectual Property">
            <p>
              The KoveFX name, logo, platform design, and underlying software are the intellectual property of KoveFX and its creators. You may not copy, reproduce, or use these assets without express written permission.
            </p>
            <p>
              You retain all rights to your own trade data and content. We do not claim ownership of data you input.
            </p>
          </Section>

          <Section title="11. Disclaimers and Limitation of Liability">
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranty of any kind. KoveFX disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              To the maximum extent permitted by law, KoveFX shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to trading losses, loss of data, or loss of profits, arising from your use of the Service.
            </p>
            <p>
              KoveFX&apos;s total liability to you for any claims arising from these Terms shall not exceed the amount you paid to KoveFX in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              You may delete your account at any time from your account settings. Upon deletion, your data will be removed in accordance with our data retention policy.
            </p>
            <p>
              KoveFX may suspend or terminate your account for violation of these Terms, non-payment, or other reasons at our discretion. We will provide notice where reasonably possible.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of the Service after changes take effect constitutes your acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with applicable law. Any disputes arising from these Terms shall be resolved through binding arbitration or in the courts of competent jurisdiction.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              If you have questions about these Terms, please contact us through the KoveFX platform or community channels.
            </p>
          </Section>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
              By creating an account or using KoveFX, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {children}
      </div>
    </div>
  )
}
