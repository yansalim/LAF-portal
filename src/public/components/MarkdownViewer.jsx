import ReactMarkdown from 'react-markdown';

const MarkdownViewer = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
