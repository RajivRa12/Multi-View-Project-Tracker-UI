import React from 'react';

interface HighlightProps {
  text: string;
  query: string;
}

const Highlight: React.FC<HighlightProps> = ({ text, query }) => {
  if (!query) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-accent/40 text-white rounded-sm px-0.5 underline decoration-accent decoration-2 underline-offset-2">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default Highlight;
