'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function ImpressumPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Top Left Home Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed left-6 top-6 z-50"
      >
        <Link
          href="/"
          className="border-input bg-background hover:bg-muted inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </motion.div>

      {/* Impressum Content */}
      <section className="relative w-full py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-14"
          >
            <div className="text-center">
              <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">Impressum</h1>
              <p className="text-muted-foreground text-lg">Rechtliche Angaben gemäß § 5 TMG</p>
            </div>

            {/* Content */}
            <article className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-base leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
                <p>
                  PeakSoft GmbH
                  <br />
                  Dahler Str. 54
                  <br />
                  42389 Wuppertal
                  <br />
                  Deutschland
                </p>
                <p>
                  Handelsregister: HRB 30080
                  <br />
                  Registergericht: Amtsgericht Wuppertal
                </p>
                <p>
                  Vertreten durch:
                  <br />
                  Oussama Benmahmoud
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">Kontakt</h2>
                <p>
                  Telefon: +49 202 38487705
                  <br />
                  Telefax: +49 (0) 123 44 55 99
                  <br />
                  E-Mail: contact@peak-soft.de
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">Umsatzsteuer-ID</h2>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:
                  <br />
                  DE325978063
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">
                  Verbraucherstreitbeilegung / Universalschlichtungsstelle
                </h2>
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">Haftung für Inhalte</h2>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
                  Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
                  als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
                  fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                  rechtswidrige Tätigkeit hinweisen.
                </p>
                <p>
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach
                  den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung
                  ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
                  möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
                  Inhalte umgehend entfernen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">Haftung für Links</h2>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                  keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                  Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                  Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
                <p>
                  Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
                  Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung
                  nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
                  jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
                  Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
                  entfernen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">Urheberrecht</h2>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                  unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                  Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                  bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
                  Gebrauch gestattet.
                </p>
                <p>
                  Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden
                  die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
                  gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam
                  werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
                  Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                </p>
              </section>
            </article>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
