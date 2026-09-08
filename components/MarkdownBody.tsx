import ReactMarkdown from "react-markdown";

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export function ScaffoldNote({ text }: { text: string }) {
  return (
    <p className="mb-8 border-l-2 border-signal/70 pl-4 font-mono text-xs leading-5 text-mute">
      {text}
    </p>
  );
}
