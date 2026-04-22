import { Html, Head, Main, NextScript } from "next/document";
import type { DocumentProps } from "next/document";

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  const locale = __NEXT_DATA__.locale ?? "en";
  return (
    <Html lang={locale}>
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
