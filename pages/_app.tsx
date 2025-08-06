import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return React.createElement(React.Fragment, null,
    React.createElement(Head, null,
      React.createElement('meta', { name: "application-name", content: "MOSB Gate Agent" }),
      React.createElement('meta', { name: "apple-mobile-web-app-capable", content: "yes" }),
      React.createElement('meta', { name: "apple-mobile-web-app-status-bar-style", content: "default" }),
      React.createElement('meta', { name: "apple-mobile-web-app-title", content: "MOSB Gate" }),
      React.createElement('meta', { name: "description", content: "LPO 인바운드 매칭 및 QR 코드 관리 시스템" }),
      React.createElement('meta', { name: "format-detection", content: "telephone=no, date=no, email=no, address=no" }),
      React.createElement('meta', { name: "mobile-web-app-capable", content: "yes" }),
      React.createElement('meta', { name: "msapplication-config", content: "/icons/browserconfig.xml" }),
      React.createElement('meta', { name: "msapplication-TileColor", content: "#3b82f6" }),
      React.createElement('meta', { name: "msapplication-tap-highlight", content: "no" }),
      React.createElement('meta', { name: "theme-color", content: "#3b82f6" }),
      React.createElement('link', { rel: "apple-touch-icon", href: "/icons/icon-192x192.png" }),
      React.createElement('link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/icon-32x32.png" }),
      React.createElement('link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/icons/icon-16x16.png" }),
      React.createElement('link', { rel: "manifest", href: "/manifest.json" }),
      React.createElement('link', { rel: "mask-icon", href: "/icons/safari-pinned-tab.svg", color: "#3b82f6" }),
      React.createElement('link', { rel: "shortcut icon", href: "/favicon.ico" }),
      React.createElement('meta', { name: "twitter:card", content: "summary" }),
      React.createElement('meta', { name: "twitter:url", content: "https://mosb-gate-agent.vercel.app" }),
      React.createElement('meta', { name: "twitter:title", content: "MOSB Gate Agent" }),
      React.createElement('meta', { name: "twitter:description", content: "LPO 인바운드 매칭 및 QR 코드 관리 시스템" }),
      React.createElement('meta', { name: "twitter:image", content: "https://mosb-gate-agent.vercel.app/icons/icon-192x192.png" }),
      React.createElement('meta', { name: "twitter:creator", content: "@mosb" }),
      React.createElement('meta', { property: "og:type", content: "website" }),
      React.createElement('meta', { property: "og:title", content: "MOSB Gate Agent" }),
      React.createElement('meta', { property: "og:description", content: "LPO 인바운드 매칭 및 QR 코드 관리 시스템" }),
      React.createElement('meta', { property: "og:site_name", content: "MOSB Gate Agent" }),
      React.createElement('meta', { property: "og:url", content: "https://mosb-gate-agent.vercel.app" }),
      React.createElement('meta', { property: "og:image", content: "https://mosb-gate-agent.vercel.app/icons/icon-192x192.png" })
    ),
    React.createElement(Component, pageProps)
  );
} 