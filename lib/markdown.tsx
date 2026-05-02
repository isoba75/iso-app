import React from "react";

/**
 * Minimal markdown renderer for iso-life content.
 * Handles: H1/H2/H3, bullet lists (-, *), numbered lists (1. 2.),
 * blockquotes, paragraphs, inline bold/italic/code, links.
 * Strips YAML frontmatter if present.
 *
 * NOT a general-purpose lib — kept small for our content shapes.
 */

function inlineMd(text: string): React.ReactNode {
  // Strip remaining special markup (tags like > superseded, simple)
  // Apply: **bold**, *italic*, `code`, [text](url) — return as React children with keys.
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  // Simple sequential matcher with priority: link > bold > code > italic
  const patterns: Array<{ re: RegExp; render: (m: RegExpMatchArray) => React.ReactNode }> = [
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => <a key={key++} href={m[2]} target="_blank" rel="noreferrer" className="underline">{m[1]}</a>,
    },
    {
      re: /\*\*([^*]+)\*\*/,
      render: (m) => <strong key={key++}>{m[1]}</strong>,
    },
    {
      re: /`([^`]+)`/,
      render: (m) => <code key={key++} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{m[1]}</code>,
    },
    {
      re: /(?<!\*)\*([^*\n]+)\*(?!\*)/,
      render: (m) => <em key={key++}>{m[1]}</em>,
    },
  ];

  while (remaining.length > 0) {
    let earliest: { idx: number; match: RegExpMatchArray; render: (m: RegExpMatchArray) => React.ReactNode } | null = null;
    for (const { re, render } of patterns) {
      const m = remaining.match(re);
      if (m && m.index !== undefined) {
        if (earliest === null || m.index < earliest.idx) {
          earliest = { idx: m.index, match: m, render };
        }
      }
    }
    if (!earliest) {
      nodes.push(remaining);
      break;
    }
    if (earliest.idx > 0) {
      nodes.push(remaining.slice(0, earliest.idx));
    }
    nodes.push(earliest.render(earliest.match));
    remaining = remaining.slice(earliest.idx + earliest.match[0].length);
  }
  return nodes;
}

export function stripFrontmatter(md: string): { frontmatter: string; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { frontmatter: "", body: md };
  return { frontmatter: m[1], body: m[2] };
}

export function renderMarkdown(md: string, options?: { skipH1?: boolean }): React.ReactNode {
  const { body } = stripFrontmatter(md);
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // Quote callout (> ⚠ or > **... — common in our decisions.md)
    if (trimmed.startsWith("> ")) {
      const quoted: string[] = [trimmed.slice(2)];
      i++;
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoted.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="border-l-2 border-amber-500/60 bg-amber-500/5 pl-3 py-2 my-2 text-sm italic">
          {inlineMd(quoted.join(" "))}
        </blockquote>
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      if (!options?.skipH1) {
        blocks.push(
          <h2 key={key++} className="text-xl font-semibold mt-4 mb-2">{inlineMd(trimmed.slice(2))}</h2>
        );
      }
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h3 key={key++} className="text-base font-semibold mt-4 mb-1.5">{inlineMd(trimmed.slice(3))}</h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h4 key={key++} className="text-sm font-semibold mt-3 mb-1">{inlineMd(trimmed.slice(4))}</h4>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (trimmed === "---") { i++; continue; }

    // Bullet list (- or *)
    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
        // Consume continuation lines (indented further)
        while (i < lines.length && /^\s{2,}/.test(lines[i]) && lines[i].trim() !== "") {
          items[items.length - 1] += "\n" + lines[i].trim();
          i++;
        }
      }
      blocks.push(
        <ul key={key++} className="list-disc ml-5 space-y-1.5 text-sm my-2">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed whitespace-pre-wrap">{inlineMd(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal ml-5 space-y-1.5 text-sm my-2">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">{inlineMd(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph (collect consecutive non-empty non-special lines)
    const para: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^([-*]\s|\d+\.\s|#{1,6}\s|>\s|---)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="text-sm leading-relaxed mb-2">{inlineMd(para.join(" "))}</p>
    );
  }

  return blocks;
}
