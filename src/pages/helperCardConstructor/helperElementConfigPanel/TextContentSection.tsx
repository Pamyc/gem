import React from 'react';
import { labelClass, inputClass } from './styles';

interface TextContentSectionProps {
  content?: string;
  onUpdate: (content: string) => void;
}

const TextContentSection: React.FC<TextContentSectionProps> = ({ content, onUpdate }) => {
  return (
    <div>
      <span className={labelClass}>Текст</span>
      <input
        type="text"
        value={content || ''}
        onChange={(e) => onUpdate(e.target.value)}
        className={inputClass}
      />
    </div>
  );
};

export default TextContentSection;