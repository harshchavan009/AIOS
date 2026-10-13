import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-mono text-muted-foreground">Terms and Conditions (v1.0)</span>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
            <FileText className="w-3.5 h-3.5" />
            <span>Document Status: Official Terms</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AIOS Terms and Conditions</h1>
          <p className="text-xs text-muted-foreground font-mono">
            Last updated: October 13, 2026. Version 1.0.
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-foreground/90 font-sans">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions constitute a legally binding agreement between you (&quot;User&quot; or &quot;Customer&quot;) and [[FILL_ME_LEGAL_ENTITY]] (&quot;AIOS&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) regarding your access to and use of the AIOS platform, APIs, SDKs, and associated services.
            </p>
            <p>
              By creating an account, generating an API key, or accessing any AIOS service, you agree to be bound by these Terms. If you represent an organization, you warrant that you possess the authority to bind that entity to these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Account Registration and Security</h2>
            <p>
              You must provide accurate, current, and complete information during registration. You are solely responsible for maintaining the confidentiality of your login credentials and API keys. Any action performed under your credentials will be deemed to have been authorized by you. You must immediately notify AIOS of any unauthorized access or security breach.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Acceptable Use Policy</h2>
            <p>You agree not to use AIOS to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Violate applicable local, national, or international laws or regulations.</li>
              <li>Attempt to escape, bypass, or compromise the Python tool execution sandbox, network firewalls, or container isolation barriers.</li>
              <li>Perform denial-of-service attacks, rate limit evasion, or automated scanning without prior written authorization.</li>
              <li>Process, transmit, or store unlawful content, malicious software, or materials that violate third-party intellectual property rights.</li>
              <li>Reverse-engineer or decompile platform binaries, except where statutory interoperability rights explicitly permit it.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. User Content and Intellectual Property</h2>
            <p>
              You retain full ownership and intellectual property rights in all data, workflows, documents, code, and prompts you upload or configure in AIOS (&quot;User Content&quot;). AIOS claims no ownership rights over your User Content. You grant AIOS a non-exclusive, worldwide license to process User Content solely to the extent necessary to provide the platform services and execute your workflows.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Artificial Intelligence Output Disclaimer</h2>
            <p>
              AIOS coordinates and displays outputs generated by third-party large language models and autonomous agents. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Outputs generated by language models may contain factual inaccuracies, hallucinations, or unexpected variations.</li>
              <li>You are solely responsible for reviewing, testing, and verifying all agent outputs and generated code before deploying them to production environments or relying on them for critical operations.</li>
              <li>AIOS does not guarantee that model responses are error-free or suitable for any specific regulatory or commercial purpose.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Bring-Your-Own-Key (BYOK) Responsibility</h2>
            <p>
              When you configure your own third-party API keys (including OpenAI, Anthropic, Google, and Groq credentials), you maintain a direct commercial relationship with those providers. You are solely responsible for all API consumption fees, usage tier compliance, and terms of service imposed by those providers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Service Availability and Modifications</h2>
            <p>
              We strive for continuous platform availability but do not guarantee uninterrupted or error-free operation. We reserve the right to deploy updates, modify features, or perform planned maintenance with reasonable advance notice where practicable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. Termination</h2>
            <p>
              You may terminate your account at any time via Workspace Settings. AIOS reserves the right to suspend or terminate access immediately upon written notice if you materially breach these Terms or engage in conduct that jeopardizes platform integrity or security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall AIOS or its affiliates, directors, or employees be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or operational downtime, arising from your use of or inability to use the platform. Our aggregate liability under these Terms shall not exceed the greater of the fees paid by you to AIOS in the twelve (12) months preceding the incident, or fifty United States dollars ($50 USD).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">10. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [[FILL_ME_JURISDICTION]], without regard to conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms shall be instituted exclusively in the competent courts of [[FILL_ME_JURISDICTION]].
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">11. Contact Information</h2>
            <p>
              For legal questions, notices, or inquiries regarding these Terms, contact:
            </p>
            <div className="p-3.5 rounded-md bg-secondary/50 border border-border font-mono text-[11px] space-y-1">
              <div>Entity: [[FILL_ME_LEGAL_ENTITY]]</div>
              <div>Legal Contact: [[FILL_ME_SUPPORT_EMAIL]]</div>
              <div>Address: [[FILL_ME_LEGAL_ADDRESS]]</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
