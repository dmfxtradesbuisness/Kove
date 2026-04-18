import Link from 'next/link'
import { KoveWordmark } from '@/components/KoveLogo'

export const metadata = {
  title: 'Subscription Policy — KoveFX',
  description: 'KoveFX Subscription & Billing Policy. Details on plans, billing cycles, cancellations, and refunds.',
}

export default function SubscriptionPolicyPage() {
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
            Subscription Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>

          <Section title="1. Plans Overview">
            <p>
              KoveFX offers two tiers of service:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Starter — Free Forever</p>
                <p style={{ fontSize: 14 }}>Full trade journaling, P&amp;L tracking, statistics, gallery, community access, and goals tracking. No credit card required. No time limit.</p>
              </div>
              <div style={{ background: 'rgba(30,110,255,0.06)', border: '1px solid rgba(30,110,255,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#4D90FF', marginBottom: 6 }}>Pro — Paid Subscription</p>
                <p style={{ fontSize: 14 }}>Everything in Starter, plus AI Insights (KoveAI), advanced discipline analytics, and priority access to new features. Billed monthly or annually.</p>
              </div>
            </div>
          </Section>

          <Section title="2. Billing Cycles">
            <p>
              Pro subscriptions are available on two billing cycles:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Monthly:</strong> Charged once per month from the date you subscribed. Renews automatically each month.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Annual:</strong> Charged once per year. Renews automatically each year. Annual plans offer a discounted rate compared to monthly billing.</li>
            </ul>
            <p>
              Your billing date is set to the day you first subscribed to Pro. All prices are displayed and charged in USD.
            </p>
          </Section>

          <Section title="3. Payment Processing">
            <p>
              All payments are processed securely by <strong style={{ color: '#fff' }}>Stripe</strong>, a PCI-DSS compliant payment processor. KoveFX never stores your card details — only a Stripe customer ID is retained on our end.
            </p>
            <p>
              Accepted payment methods include major credit and debit cards (Visa, Mastercard, American Express) and any additional methods supported by Stripe in your region.
            </p>
          </Section>

          <Section title="4. Free Trial">
            <p>
              We may offer a free trial period on Pro from time to time. If a trial is active, you will not be charged until the trial period ends. You may cancel before the trial ends without being charged.
            </p>
            <p>
              Trial eligibility is limited to new Pro subscribers only. One trial per account.
            </p>
          </Section>

          <Section title="5. Automatic Renewal">
            <p>
              Your Pro subscription renews automatically at the end of each billing cycle unless you cancel. You will receive an email reminder before each renewal. By subscribing, you authorize KoveFX to charge your payment method on a recurring basis.
            </p>
            <p>
              If a renewal payment fails, we will attempt to retry the charge. If payment cannot be collected after multiple attempts, your Pro access may be downgraded to the Starter plan until payment is resolved.
            </p>
          </Section>

          <Section title="6. Cancellation">
            <p>
              You may cancel your Pro subscription at any time from your <Link href="/account" style={{ color: '#3B82F6', textDecoration: 'underline', textUnderlineOffset: 2 }}>Account Settings</Link> page under the Billing section. No cancellation fees apply.
            </p>
            <p>
              Upon cancellation, your Pro access remains fully active until the end of your current billing period. After that, your account reverts to the Starter plan. Your trade data, journal entries, and account are never deleted when you cancel — only Pro features become inaccessible.
            </p>
            <p>
              To cancel, go to <strong style={{ color: '#fff' }}>Account → Billing → Manage Subscription</strong>, which will open the Stripe billing portal.
            </p>
          </Section>

          <Section title="7. Refund Policy">
            <p>
              We offer a <strong style={{ color: '#fff' }}>7-day money-back guarantee</strong> on new Pro subscriptions. If you are not satisfied within the first 7 days, contact us and we will issue a full refund — no questions asked.
            </p>
            <p>
              After 7 days, refunds are considered on a case-by-case basis at our discretion. Refunds are generally not issued for partial billing periods after cancellation or for annual plans where significant usage has occurred.
            </p>
            <p>
              To request a refund, contact us through the platform within the eligible window.
            </p>
          </Section>

          <Section title="8. Price Changes">
            <p>
              KoveFX reserves the right to modify subscription pricing. Existing subscribers will receive at least <strong style={{ color: '#fff' }}>30 days&apos; notice</strong> via email before any price change takes effect. You may cancel before the new price applies if you do not wish to continue.
            </p>
          </Section>

          <Section title="9. Upgrading and Downgrading">
            <p>
              You may upgrade from monthly to annual billing at any time. When upgrading, unused days on your monthly plan will be prorated and applied toward your annual plan cost.
            </p>
            <p>
              Downgrading from annual to monthly takes effect at the end of your annual billing period.
            </p>
          </Section>

          <Section title="10. Account Suspension">
            <p>
              If your account is suspended or terminated for violation of our Terms of Service, no refund will be issued for any unused subscription period. Access to Pro features will be revoked immediately upon suspension.
            </p>
          </Section>

          <Section title="11. Taxes">
            <p>
              Subscription prices are listed exclusive of any applicable taxes. Depending on your location, VAT, GST, or other taxes may be added at checkout as required by local law. Tax amounts will be clearly shown before you complete your purchase.
            </p>
          </Section>

          <Section title="12. Contact and Support">
            <p>
              For billing questions, payment issues, or refund requests, please reach out through the KoveFX platform. We aim to respond to all billing inquiries within 1–2 business days.
            </p>
          </Section>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
              By subscribing to KoveFX Pro, you acknowledge that you have read and agree to this Subscription Policy and our{' '}
              <Link href="/terms" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Terms of Service
              </Link>.
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
