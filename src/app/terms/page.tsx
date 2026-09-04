import type { Metadata } from "next";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";

export const metadata: Metadata = {
  title: "Termos de Uso e Serviços — TANK Wallet",
  description: "Termos de Uso e Serviços da TANK Wallet — END ART Studios",
};

const CONTENT = {
  "pt-BR": {
    sections: [
      { h: "1. Aceitação", p: "Ao criar, importar ou desbloquear uma carteira na TANK Wallet, você declara que leu, compreendeu e concorda com estes Termos e com a Política de Privacidade. O aceite é obrigatório e registrado no momento do cadastro (checkbox + timestamp)." },
      { h: "2. Natureza do Serviço", p: "A TANK Wallet é uma hot wallet não custodial. As chaves privadas são geradas e armazenadas localmente no seu dispositivo, criptografadas com AES-256-GCM (PBKDF2 250k iterações). A END ART Studios não tem acesso às suas chaves, seed phrase ou fundos, e não pode recuperar sua carteira sem a sua seed phrase + senha." },
      { h: "3. Elegibilidade", p: "Você deve ter 18 anos ou mais e capacidade legal para contratar. É vedado o uso para atividades ilícitas, lavagem de dinheiro ou financiamento ao terrorismo." },
      { h: "4. Riscos", p: "Operações com criptoativos envolvem riscos elevados, incluindo volatilidade, falhas de rede, golpes (phishing, honeypot, drainer) e perda permanente de fundos por perda de seed/senha. A TANK Wallet oferece proteções ativas (scanner, DApp Shield, simulação, Risk Service), mas não garante a detecção de todos os riscos." },
      { h: "5. Responsabilidades do Usuário", p: "Guardar sua seed phrase (12 palavras) em local seguro, offline, sem foto ou nuvem. Manter sua senha de criptografia segura. Verificar endereços, contratos e DApps antes de assinar. Manter o dispositivo seguro." },
      { h: "6. Propriedade Intelectual", p: "Copyright © 2026 END ART Studios. Todos os direitos reservados. O software e código-fonte são proprietários e confidenciais. É proibida cópia, modificação, distribuição, sublicenciamento, publicação, engenharia reversa ou uso sem autorização escrita." },
      { h: "7. Disponibilidade e Suporte", p: 'O serviço é prestado "como está", sem garantias de disponibilidade contínua. Suporte via endart.studios@gmail.com.' },
      { h: "8. Alterações", p: "Podemos atualizar estes Termos. Alterações relevantes serão comunicadas no app. O uso continuado após alteração implica novo aceite." },
      { h: "9. Foro", p: "Comarca de Osasco/SP — Brasil." },
    ],
  },
  "en-US": {
    sections: [
      { h: "1. Acceptance", p: "By creating, importing, or unlocking a wallet in TANK Wallet, you declare that you have read, understood, and agreed to these Terms and the Privacy Policy. Acceptance is mandatory and recorded at signup (checkbox + timestamp)." },
      { h: "2. Nature of the Service", p: "TANK Wallet is a non-custodial hot wallet. Private keys are generated and stored locally on your device, encrypted with AES-256-GCM (PBKDF2 250k iterations). END ART Studios does not have access to your keys, seed phrase, or funds, and cannot recover your wallet without your seed phrase + password." },
      { h: "3. Eligibility", p: "You must be 18 years of age or older and have legal capacity to contract. Use for illicit activities, money laundering, or terrorist financing is prohibited." },
      { h: "4. Risks", p: "Crypto-asset operations involve high risks, including volatility, network failures, scams (phishing, honeypot, drainer), and permanent loss of funds from loss of seed/password. TANK Wallet offers active protections (scanner, DApp Shield, simulation, Risk Service) but does not guarantee detection of all risks." },
      { h: "5. User Responsibilities", p: "Store your seed phrase (12 words) in a safe offline location, no photos or cloud. Keep your encryption password secure. Verify addresses, contracts, and DApps before signing. Keep your device secure." },
      { h: "6. Intellectual Property", p: "Copyright © 2026 END ART Studios. All rights reserved. The software and source code are proprietary and confidential. Copying, modification, distribution, sublicensing, publication, reverse engineering, or use without written permission is prohibited." },
      { h: "7. Availability and Support", p: 'The service is provided "as is", without guarantees of continuous availability. Support via endart.studios@gmail.com.' },
      { h: "8. Changes", p: "We may update these Terms. Material changes will be communicated in the app. Continued use after changes implies new acceptance." },
      { h: "9. Jurisdiction", p: "Courts of Osasco/SP — Brazil." },
    ],
  },
  "es-ES": {
    sections: [
      { h: "1. Aceptación", p: "Al crear, importar o desbloquear una billetera en TANK Wallet, declaras que has leído, comprendido y aceptado estos Términos y la Política de Privacidad. La aceptación es obligatoria y se registra al registrarse (casilla + timestamp)." },
      { h: "2. Naturaleza del Servicio", p: "TANK Wallet es una hot wallet no custodial. Las claves privadas se generan y almacenan localmente en tu dispositivo, cifradas con AES-256-GCM (PBKDF2 con 250k iteraciones). END ART Studios no tiene acceso a tus claves, seed phrase ni fondos, y no puede recuperar tu billetera sin tu seed phrase + contraseña." },
      { h: "3. Elegibilidad", p: "Debes ser mayor de 18 años y tener capacidad legal para contratar. Está prohibido el uso para actividades ilícitas, lavado de dinero o financiación del terrorismo." },
      { h: "4. Riesgos", p: "Las operaciones con criptoactivos conllevan altos riesgos, incluyendo volatilidad, fallos de red, estafas (phishing, honeypot, drainer) y pérdida permanente de fondos por pérdida de seed/contraseña. TANK Wallet ofrece protecciones activas (scanner, DApp Shield, simulación, Risk Service) pero no garantiza la detección de todos los riesgos." },
      { h: "5. Responsabilidades del Usuario", p: "Guarda tu seed phrase (12 palabras) en un lugar seguro offline, sin fotos ni en la nube. Mantén tu contraseña de cifrado segura. Verifica direcciones, contratos y DApps antes de firmar. Mantén tu dispositivo seguro." },
      { h: "6. Propiedad Intelectual", p: "Copyright © 2026 END ART Studios. Todos los derechos reservados. El software y el código fuente son propietarios y confidenciales. Se prohíbe copiar, modificar, distribuir, sublicenciar, publicar, hacer ingeniería inversa o usar sin autorización escrita." },
      { h: "7. Disponibilidad y Soporte", p: 'El servicio se presta "tal cual", sin garantías de disponibilidad continua. Soporte vía endart.studios@gmail.com.' },
      { h: "8. Cambios", p: "Podemos actualizar estos Términos. Los cambios relevantes se comunicarán en la app. El uso continuado tras los cambios implica nueva aceptación." },
      { h: "9. Jurisdicción", p: "Comarca de Osasco/SP — Brasil." },
    ],
  },
} as const;

export default function TermsPage() {
  const { locale, t } = useI18n();
  const data = CONTENT[locale] ?? CONTENT["pt-BR"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-black uppercase tracking-tight">{t("legal.title")}</h1>
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

      <p className="mt-8 text-xs text-muted-foreground">{t("legal.accept_required")}</p>
      <div className="mt-4 flex gap-3 text-sm">
        <Link href="/" className="underline">{t("legal.back_to_app")}</Link>
        <Link href="/privacy" className="underline">{t("legal.privacy")}</Link>
      </div>
    </div>
  );
}
