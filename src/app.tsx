import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";
import "./app.css";
import { inject } from "@vercel/analytics";

export default function App() {
  inject();
  return (
    <MetaProvider>
      <Title>WolfCanCode OS – Liquid Glass Portfolio</Title>
      <Meta
        name="description"
        content="WolfCanCode OS: a luminous liquid-glass macOS-style portfolio with draggable windows, dock, and desktop icons by Tommy Le."
      />
      <Meta name="theme-color" content="#0a0a0a" />
      <Meta name="apple-mobile-web-app-capable" content="yes" />
      <Meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <Link rel="apple-touch-icon" href="/images/icon-192.png" />
      <Link rel="manifest" href="/manifest.json" />
      {/* Open Graph / Facebook */}
      <Meta
        property="og:title"
        content="WolfCanCode OS – Liquid Glass Portfolio"
      />
      <Meta
        property="og:description"
        content="WolfCanCode OS: a luminous liquid-glass macOS-style portfolio with draggable windows, dock, and desktop icons by Tommy Le."
      />
      <Meta property="og:type" content="website" />
      <Meta property="og:image" content="/images/icon-512.png" />
      <Meta property="og:url" content="https://tommy-le.vercel.app/" />
      {/* Twitter */}
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta
        name="twitter:title"
        content="WolfCanCode OS – Liquid Glass Portfolio"
      />
      <Meta
        name="twitter:description"
        content="WolfCanCode OS: a luminous liquid-glass macOS-style portfolio with draggable windows, dock, and desktop icons by Tommy Le."
      />
      <Meta name="twitter:image" content="/images/icon-512.png" />
      {/* Favicons */}
      <Link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/images/favicon-16x16.png"
      />
      <Link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/images/favicon-32x32.png"
      />
      <Link
        rel="icon"
        type="image/png"
        sizes="48x48"
        href="/images/favicon-48x48.png"
      />
      <Link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/images/apple-touch-icon.png"
      />
      <Router
        root={(props) => (
          <>
            <Suspense>{props.children}</Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </MetaProvider>
  );
}
