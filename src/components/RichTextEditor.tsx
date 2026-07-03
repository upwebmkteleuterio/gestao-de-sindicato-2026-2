import React, { useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, ListOrdered, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Update contentEditable when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if the value is different to prevent cursor jumping
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      // Use innerHTML to get the rich text content
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleFormat = useCallback((command: string, value: string | null = null) => {
    // Focus the editor before executing command
    if (editorRef.current) {
      editorRef.current.focus();
    }
    // Execute the formatting command
    document.execCommand(command, false, value || undefined);
    // Manually trigger change event to update React state
    handleInput();
  }, [handleInput]);

  const Toolbar = () => (
    <div className="flex items-center gap-1 p-1 border-b border-gray-200 bg-gray-50 rounded-t-md">
      <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('bold')} title="Negrito">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('italic')} title="Itálico">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('underline')} title="Sublinhado">
        <Underline className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('insertUnorderedList')} title="Lista Não Ordenada">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('insertOrderedList')} title="Lista Ordenada">
        <ListOrdered className="h-4 w-4" />
      </Button>
      {/* <Button type="button" variant="ghost" size="icon" onClick={() => handleFormat('formatBlock', 'pre')} title="Código/Pré-formatado">
        <Code className="h-4 w-4" />
      </Button> */}
    </div>
  );

  return (
    <div className={cn("border rounded-md", className)}>
      <Toolbar />
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
        // The placeholder attribute is not supported on contentEditable, but we can use a CSS trick or a data attribute.
        // For simplicity, I'll rely on the user seeing the initial content.
      />
    </div>
  );
};

export default RichTextEditor;