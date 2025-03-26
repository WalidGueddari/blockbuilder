'use client';

import {
  CtaSection,
  DemoSection,
  FaqSection,
  FeaturesSection,
  Footer,
  Header,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsSection,
  TrustedBySection,
  UseCasesSection,
} from '@/components/modules/home/index';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-center">
      <Header />
      <main className="relative z-10 flex-1">
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <DemoSection />
        <UseCasesSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
