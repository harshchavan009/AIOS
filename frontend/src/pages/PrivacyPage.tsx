import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PrivacyPage: React.FC = () => {
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
          <span className="text-xs font-mono text-muted-foreground">Privacy Policy (v1.0)</span>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>Document Status: Official Policy</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AIOS Privacy Policy</h1>
          <p className="text-xs text-muted-foreground font-mono">
            Last updated: October 13, 2026. Version 1.0.
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-foreground/90 font-sans">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Overview and Scope</h2>
            <p>
              This Privacy Policy explains how [[FILL_ME_LEGAL_ENTITY]] (&quot;AIOS&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, stores, and protects personal and technical data when you use the AIOS web application, API services, and associated developer tools.
            </p>
            <p>
              AIOS provides a multi-agent orchestration runtime, GraphRAG knowledge indexing, and model routing. Because our software executes user-supplied code and queries external language models, this document outlines the exact boundary between your data, our platform, and third-party infrastructure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Data We Collect</h2>
            <p>We collect and process the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Account Identification:</strong> Email address, name, password hash, and OAuth identity identifiers provided through Google or GitHub sign-in.</li>
              <li><strong className="text-foreground">Workspace Content:</strong> Workflow graphs, prompt templates, agent definitions, and configuration files created within your workspace.</li>
              <li><strong className="text-foreground">Uploaded Documents:</strong> Files uploaded for GraphRAG indexing (PDF, Markdown, text, and source code repositories).</li>
              <li><strong className="text-foreground">Prompts and Model Outputs:</strong> Input queries sent to agent nodes and intermediate responses generated during LangGraph DAG execution.</li>
              <li><strong className="text-foreground">API Credentials:</strong> Third-party provider API keys (OpenAI, Anthropic, Google) supplied by you under Bring-Your-Own-Key (BYOK) configurations. All API keys are encrypted at rest using AES-256-GCM.</li>
              <li><strong className="text-foreground">Operational Logs and Telemetry:</strong> Request timestamps, token usage metrics, latency recordings, error tracebacks, and client IP addresses recorded in server access logs.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Purpose and Legal Basis for Processing</h2>
            <p>We process your data for the following specific purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>To provide, operate, and maintain the AIOS runtime and API endpoints.</li>
              <li>To execute LangGraph DAG workflows and compute GraphRAG entity extractions on your behalf.</li>
              <li>To enforce workspace security, authentication, and access controls.</li>
              <li>To monitor system health, detect malicious activity, and prevent platform abuse.</li>
            </ul>
            <p>
              Under the European Union General Data Protection Regulation (GDPR), processing is conducted under Article 6(1)(b) (performance of a contract) and Article 6(1)(f) (legitimate interests in securing the service). For users in India, processing adheres to the Digital Personal Data Protection Act, 2023 (DPDPA).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Third-Party Service Providers and Data Processors</h2>
            <p>
              AIOS integrates with external cloud and model service providers to deliver inference and hosting. These providers process data according to their respective privacy terms:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Model Providers:</strong> OpenAI, Anthropic, and Google AI receive prompts and input tokens when you invoke models through the AIOS Gateway. When you use your own API keys, your direct agreement with each provider governs their retention policies.</li>
              <li><strong className="text-foreground">Vector and Graph Storage:</strong> Managed Qdrant vector databases and Neo4j graph instances process embeddings and entity graphs for retrieval queries.</li>
              <li><strong className="text-foreground">Hosting Infrastructure:</strong> Cloud servers (Vercel for frontend hosting; Docker, Redis, and PostgreSQL for backend services) process HTTP traffic and persistent application data.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Cookies and Local Storage</h2>
            <p>
              AIOS uses only essential cookies and browser local storage strictly required for user authentication, session security, and theme preferences (<code className="text-foreground">aios_access_token</code>, <code className="text-foreground">aios_refresh_token</code>, <code className="text-foreground">theme-storage</code>). We do not load third-party advertising cookies or cross-site tracking scripts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Data Retention, Export, and Deletion</h2>
            <p>
              We retain workspace data, documents, and execution traces for as long as your account remains active. You may request a complete export of your workspace assets or initiate permanent deletion of your account and associated database records directly through Workspace Settings or by emailing [[FILL_ME_SUPPORT_EMAIL]]. Deletion requests are executed within 30 days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Security Measures</h2>
            <p>
              We maintain administrative, technical, and physical safeguards designed to protect personal and workspace data. Measures include TLS 1.3 transport encryption, AES-256 database column encryption for API keys, strict Cross-Origin Resource Sharing (CORS) allowlists, sandboxed Python MCP execution, and role-based access control.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">8. International Data Transfers</h2>
            <p>
              If you access AIOS from the European Union, the United Kingdom, or India, your data may be transferred to and processed on secure cloud servers located in regions where our hosting and model providers operate. Such transfers are governed by Standard Contractual Clauses (SCCs) and equivalent statutory transfer frameworks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">9. Children&#39;s Privacy</h2>
            <p>
              AIOS is a professional developer platform and is not directed to individuals under 18 years of age. We do not knowingly collect personal data from minors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">10. Contact Information</h2>
            <p>
              For privacy inquiries, data subject rights requests, or regulatory questions, please contact our data protection team:
            </p>
            <div className="p-3.5 rounded-md bg-secondary/50 border border-border font-mono text-[11px] space-y-1">
              <div>Entity: [[FILL_ME_LEGAL_ENTITY]]</div>
              <div>Contact Email: [[FILL_ME_SUPPORT_EMAIL]]</div>
              <div>Address: [[FILL_ME_LEGAL_ADDRESS]]</div>
              <div>Jurisdiction: [[FILL_ME_JURISDICTION]]</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
