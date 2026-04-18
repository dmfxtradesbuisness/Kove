import Link from 'next/link'
import { KoveWordmark } from '@/components/KoveLogo'

export const metadata = {
  title: 'Privacy Policy — KoveFX',
  description: 'KoveFX Privacy Policy. Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>

          <Section title="1. Introduction">
            <p>
              KoveFX (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our trading journal platform at kovefx.com (&quot;the Service&quot;).
            </p>
            <p>
              By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong style={{ color: '#fff' }}>Account Information:</strong> When you register, we collect your email address and a hashed password. If you sign up via Google OAuth, we receive your name and email from Google.</p>
            <p><strong style={{ color: '#fff' }}>Trade Data:</strong> All trade entries, notes, screenshots, P&amp;L figures, and journal content you log into the platform.</p>
            <p><strong style={{ color: '#fff' }}>Profile Information:</strong> Display name, bio, and avatar image you optionally provide.</p>
            <p><strong style={{ color: '#fff' }}>Usage Data:</strong> Pages visited, features used, and general interaction patterns — collected in anonymized, aggregated form.</p>
            <p><strong style={{ color: '#fff' }}>Payment Information:</strong> Subscription and billing data is processed by Stripe. We do not store your card details — only a Stripe customer ID and subscription status.</p>
            <p><strong style={{ color: '#fff' }}>Community Content:</strong> Posts, comments, and reactions you choose to publish publicly.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
              {[
                'Provide, operate, and maintain the Service',
                'Process your trades, generate statistics, and power AI insights (Pro)',
                'Manage your account, subscription, and billing',
                'Send account-related emails (confirmation, password reset, billing alerts)',
                'Moderate community content and enforce our Terms of Service',
                'Improve the platform through anonymized usage analytics',
                'Respond to support requests',
              ].map((item) => (
                <li key={item} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
            <p>
              We do <strong style={{ color: '#fff' }}>not</strong> sell your personal data. We do not use your trade data for advertising or share it with third parties for marketing purposes.
            </p>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Your data is stored securely using Supabase (PostgreSQL), hosted on infrastructure with industry-standard encryption in transit (TLS) and at rest. We use Row Level Security (RLS) to ensure your data is only accessible to you.
            </p>
            <p>
              No system is 100% secure. While we implement strong safeguards, we cannot guarantee absolute security. You are responsible for keeping your account credentials confidential.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>We share your information only with:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
              {[
                'Supabase — database hosting and authentication',
                'Stripe — payment processing (they receive billing info only)',
                'OpenAI — trade data is sent to GPT-4o mini for AI analysis (Pro users only, anonymized per request)',
                'Vercel — application hosting and edge functions',
              ].map((item) => (
                <li key={item} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
            <p>
              We may disclose your information if required by law, regulation, or a valid legal request. We will notify you of such requests where legally permitted.
            </p>
          </Section>

          <Section title="6. AI Features and Your Trade Data">
            <p>
              Pro subscribers may use KoveAI, which sends relevant trade data to OpenAI&apos;s API for analysis. Requests are not permanently stored by OpenAI under their API data usage policies. We recommend reviewing OpenAI&apos;s privacy policy for their data handling practices.
            </p>
            <p>
              You can opt out of AI features at any time by simply not using the AI Insights section. No trade data is sent to AI services unless you actively initiate a chat or analysis.
            </p>
          </Section>

          <Section title="7. Community and Public Content">
            <p>
              Content you post to the Community feed (posts, comments, reactions) is visible to other registered users. Do not post sensitive financial details, personal identification information, or confidential trade strategies you wish to keep private in the community section.
            </p>
            <p>
              You may delete your community posts at any time from the Community section.
            </p>
          </Section>

          <Section title="8. Cookies and Tracking">
            <p>
              We use session cookies and browser local storage to maintain your authentication state and preferences (such as your active journal). We do not use third-party advertising cookies or tracking pixels.
            </p>
            <p>
              You can disable cookies in your browser settings, but this may affect your ability to log in and use the Service.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
              {[
                'Access — request a copy of the personal data we hold about you',
                'Correction — request that we correct inaccurate data',
                'Deletion — delete your account and all associated data from your account settings',
                'Portability — your trade data is yours; you may export it at any time',
                'Objection — object to processing of your data in certain circumstances',
              ].map((item) => (
                <li key={item} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
            <p>
              To exercise any of these rights, you can use the account settings page or contact us through the platform.
            </p>
          </Section>

          <Section title="10. Data Retention">
            <p>
              We retain your account data for as long as your account is active. When you delete your account, we remove your personal data within 30 days. Anonymized aggregated statistics may be retained indefinitely.
            </p>
            <p>
              Billing records may be retained longer as required by applicable financial regulations.
            </p>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has created an account, we will delete it promptly.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of the Service after changes take effect constitutes your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us through the KoveFX platform or community channels.
            </p>
          </Section>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
              By using KoveFX, you acknowledge that you have read and understood this Privacy Policy.
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
