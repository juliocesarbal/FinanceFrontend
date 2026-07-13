/** Landing pública (estilo COMPUTE): la puerta de entrada al sistema.
 *  El dashboard interno vive en /dashboard; login/registro abren en un
 *  modal translúcido sobre esta página. */
import { AuthModal } from "@/components/landing/AuthModal";
import { Cta } from "@/components/landing/Cta";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { Metrics } from "@/components/landing/Metrics";
import { ModulesMarquee } from "@/components/landing/ModulesMarquee";
import { Process } from "@/components/landing/Process";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-surface-0">
      <LandingNav />
      <Hero />
      <Features />
      <Process />
      <Metrics />
      <ModulesMarquee />
      <Cta />
      <LandingFooter />
      <AuthModal />
    </main>
  );
}
