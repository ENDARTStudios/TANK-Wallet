"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";

const CONTENT = {
  "pt-BR": {
    title: "Política de Privacidade",
    sections: [
      { h: "1. Controlador", p: "END ART Studios, CNPJ 45.370.930/0001-75, Osasco/SP — Brasil, é a controladora dos dados pessoais tratados na TANK Wallet." },
      { h: "2. Dados Coletados", p: "Dados de conta (se criar login): e-mail, workspace, role — armazenados com criptografia e isolamento por workspaceId (RLS). Dados de uso anonimizado (opcional): métricas via Sentry/OTel, sem conteúdo sensível, com redactSecrets. NÃO coletamos seed phrase, chaves privadas, senhas em texto claro — ficam só no seu dispositivo, criptografadas com AES-256-GCM." },
      { h: "3. Finalidades", p: "Autenticação, autorização (RBAC), isolamento de dados (RLS), prevenção a fraude (Risk Service, bot/rate limit), suporte e melhoria do produto." },
      { h: "4. Compartilhamento", p: "Não vendemos dados. Compartilhamos apenas com processadores necessários: provedores de infraestrutura (Vercel/Render, Postgres), observabilidade (Sentry, OTel), e quando exigido por lei." },
      { h: "5. Retenção", p: "Dados de conta enquanto a conta existir; logs de auditoria por 12 meses; backups com retenção de 30 dias e cifra." },
      { h: "6. Direitos (LGPD)", p: "Você pode solicitar acesso, correção, exclusão, portabilidade, oposição e revogação de consentimento via endart.studios@gmail.com. Resposta em até 15 dias." },
      { h: "7. Segurança", p: "Criptografia em repouso (AES-256-GCM + PBKDF2 250k), em trânsito (TLS/HSTS), controle de acesso (RBAC/RLS), WAF/bot, rate limit, e auditoria." },
      { h: "8. Cookies e Tecnologias", p: "Usamos apenas cookies essenciais de sessão/autenticação. Não usamos cookies de rastreamento publicitário." },
      { h: "9. Aceite Obrigatório", p: "O cadastro exige aceite explícito destes Termos e desta Política (checkbox obrigatório). O aceite é registrado com timestamp e versão." },
      { h: "10. Alterações", p: "Atualizações serão comunicadas no app. Uso continuado implica novo aceite." },
      { h: "11. Contato", p: "Dúvidas: endart.studios@gmail.com · Telegram https://t.me/TANKWallet2026." },
      { h: "12. Foro", p: "Comarca de Osasco/SP — Brasil. LGPD Lei 13.709/2018." },
    ],
  },
  "en-US": {
    title: "Privacy Policy",
    sections: [
      { h: "1. Controller", p: "END ART Studios, CNPJ 45.370.930/0001-75, Osasco/SP — Brazil, is the controller of personal data processed in TANK Wallet." },
      { h: "2. Data Collected", p: "Account data (if you sign up): email, workspace, role — stored encrypted with workspaceId isolation (RLS). Anonymized usage data (optional): performance and error metrics via Sentry/OTel, with redactSecrets. We do NOT collect seed phrase, private keys, plaintext passwords — they remain on your device, encrypted with AES-256-GCM." },
      { h: "3. Purposes", p: "Authentication, authorization (RBAC), data isolation (RLS), fraud prevention (Risk Service, bot/rate limit), support and product improvement." },
      { h: "4. Sharing", p: "We do not sell data. We share only with necessary processors: infrastructure providers (Vercel/Render, Postgres), observability (Sentry, OTel), and when required by law." },
      { h: "5. Retention", p: "Account data while the account exists; audit logs for 12 months; backups with 30-day retention and encryption." },
      { h: "6. Rights (LGPD/GDPR)", p: "You may request access, correction, deletion, portability, opposition, and revocation of consent via endart.studios@gmail.com. Reply within 15 days." },
      { h: "7. Security", p: "Encryption at rest (AES-256-GCM + PBKDF2 250k), in transit (TLS/HSTS), access control (RBAC/RLS), WAF/bot, rate limit, and auditing." },
      { h: "8. Cookies and Technologies", p: "We use only essential session/authentication cookies. We do not use advertising tracking cookies." },
      { h: "9. Mandatory Acceptance", p: "Sign-up requires explicit acceptance of these Terms and this Policy (mandatory checkbox). Acceptance is recorded with timestamp and version." },
      { h: "10. Changes", p: "Updates will be communicated in the app. Continued use implies new acceptance." },
      { h: "11. Contact", p: "Questions: endart.studios@gmail.com · Telegram https://t.me/TANKWallet2026." },
      { h: "12. Jurisdiction", p: "Courts of Osasco/SP — Brazil. LGPD Law 13.709/2018." },
    ],
  },
  "es-ES": {
    title: "Política de Privacidad",
    sections: [
      { h: "1. Responsable", p: "END ART Studios, CNPJ 45.370.930/0001-75, Osasco/SP — Brasil, es la responsable del tratamiento de datos personales en TANK Wallet." },
      { h: "2. Datos Recopilados", p: "Datos de cuenta (si te registras): correo, workspace, rol — almacenados cifrados y aislados por workspaceId (RLS). Datos de uso anonimizados (opcional): métricas de rendimiento y errores vía Sentry/OTel, sin contenido sensible, con redactSecrets. NO recopilamos seed phrase, claves privadas, contraseñas en texto plano — quedan solo en tu dispositivo, cifradas con AES-256-GCM." },
      { h: "3. Finalidades", p: "Autenticación, autorización (RBAC), aislamiento de datos (RLS), prevención de fraude (Risk Service, bot/rate limit), soporte y mejora del producto." },
      { h: "4. Compartición", p: "No vendemos datos. Compartimos solo con procesadores necesarios: proveedores de infraestructura (Vercel/Render, Postgres), observabilidad (Sentry, OTel), y cuando lo exija la ley." },
      { h: "5. Retención", p: "Datos de cuenta mientras la cuenta exista; registros de auditoría por 12 meses; copias de seguridad con retención de 30 días y cifrado." },
      { h: "6. Derechos (LGPD/RGPD)", p: "Puedes solicitar acceso, rectificación, supresión, portabilidad, oposición y revocación del consentimiento vía endart.studios@gmail.com. Respuesta en 15 días." },
      { h: "7. Seguridad", p: "Cifrado en reposo (AES-256-GCM + PBKDF2 250k), en tránsito (TLS/HSTS), control de acceso (RBAC/RLS), WAF/bot, rate limit, y auditoría." },
      { h: "8. Cookies y Tecnologías", p: "Solo usamos cookies esenciales de sesión/autenticación. No usamos cookies de rastreo publicitario." },
      { h: "9. Aceptación Obligatoria", p: "El registro requiere la aceptación explícita de estos Términos y de esta Política (casilla obligatoria). La aceptación se registra con timestamp y versión." },
      { h: "10. Cambios", p: "Las actualizaciones se comunicarán en la app. El uso continuado implica nueva aceptación." },
      { h: "11. Contacto", p: "Dudas: endart.studios@gmail.com · Telegram https://t.me/TANKWallet2026." },
      { h: "12. Jurisdicción", p: "Comarca de Osasco/SP — Brasil. LGPD Ley 13.709/2018." },
    ],
  },
} as const;

export default function PrivacyPage() {
  const { locale, t } = useI18n();
  const data = CONTENT[locale] ?? CONTENT["pt-BR"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-black uppercase tracking-tight">{data.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("legal.last_updated")}: 30 de agosto de 2026 · END ART Studios · CNPJ 45.370.930/0001-75 · Osasco/SP — Brasil
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("legal.contact")}: <a href="mailto:endart.studios@gmail.com" className="underline">endart.studios@gmail.com</a> · Telegram:{" "}
        <a href="https://t.me/TANKWallet2026" target="_blank" rel="noopener noreferrer" className="underline">https://t.me/TANKWallet2026</a>
      </p>

      <div className="prose prose-sm dark:prose-invert mt-6 max-w-none">
        {data.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">LGPD Lei 13.709/2018.</p>
      <div className="mt-4 flex gap-3 text-sm">
        <Link href="/" className="underline">{t("legal.back_to_app")}</Link>
        <Link href="/terms" className="underline">{t("legal.terms")}</Link>
      </div>
    </div>
  );
}
