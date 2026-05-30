import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../../store/useStore';

interface NoteEditorProps {
  cardId: string;
  initialNote: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ cardId, initialNote }) => {
  const { updateCard } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    updateCard(cardId, { note });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="min-h-[100px]">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={note}
          onChange={handleTextareaChange}
          onBlur={handleBlur}
          placeholder="Add a note... (Markdown supported)"
          className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 resize-none placeholder:text-border"
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="cursor-text min-h-[20px]"
        >
          {note ? (
            <div className="markdown-body">
              <ReactMarkdown>{note}</ReactMarkdown>
            </div>
          ) : (
            <span className="text-sm text-border italic">Add a note...</span>
          )}
        </div>
      )}
    </div>
  );
};
