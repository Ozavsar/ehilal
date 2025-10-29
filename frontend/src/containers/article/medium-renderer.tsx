"use client";

import React from "react";

export default function MediumRenderer({ paragraphs }: { paragraphs: any[] }) {
  return (
    <div className="prose mx-auto max-w-4xl">
      {paragraphs.map((p) => {
        switch (p.type) {
          case "H3":
            return <h3 key={p.name}>{p.text}</h3>;
          case "P":
            return <p key={p.name}>{p.text}</p>;
          case "IMG":
            return (
              <img
                key={p.name}
                src={`https://miro.medium.com/v2/resize:fit:700/${p.metadata.id}`}
                alt=""
              />
            );
          case "ULI":
            return <li key={p.name}>{p.text}</li>;
          case "PRE":
            return <pre key={p.name}>{p.text}</pre>;
          case "BQ":
          case "PQ":
            return <blockquote key={p.name}>{p.text}</blockquote>;
          case "IFRAME":
            return (
              <iframe
                key={p.name}
                src={p.iframe.mediaResource.iframeSrc}
                title={p.iframe.mediaResource.title}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
