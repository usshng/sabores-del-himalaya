import { ArrowRight } from "lucide-react";

// P0: welcome page. Login and registration are reached from the menu (P1), as in the screen flow (ESQ).
// The background photo lives in public/images/hero.jpg.
export default function WelcomePage() {
  return (
    <main
      className="relative flex min-h-svh flex-col bg-neutral-900 bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/hero.jpg')" }}
    >
      {/* Darkens the photo so the white text is always readable. */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

      <section className="relative z-10 flex flex-1 flex-col justify-center px-6 py-24 md:px-16">
        {/* Same transition name as the header title, so the name travels from here to the menu. */}
        <h1
          className="text-6xl font-black uppercase leading-[0.9] tracking-tight md:text-8xl lg:text-9xl"
          style={{ viewTransitionName: "brand" }}
        >
          Sabor del
          <br />
          Himalaya.
        </h1>
        <p className="mt-6 max-w-md text-xl font-semibold md:text-2xl">
          Cocina nepalí e india, directa a tu casa.
        </p>
        <a
          href="/carta"
          className="mt-10 inline-flex w-fit items-center gap-6 rounded-full bg-white py-2 pl-7 pr-2 text-lg font-semibold text-black transition hover:bg-neutral-200"
        >
          Ver la carta
          <span className="flex size-11 items-center justify-center rounded-full bg-black text-white">
            <ArrowRight className="size-5" />
          </span>
        </a>
      </section>
    </main>
  );
}
