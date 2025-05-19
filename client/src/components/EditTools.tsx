import { useState } from "react";
import { Bold, Italic, Link, AlignLeft, Type, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditToolsProps {
  text: string;
  onTextChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditTools({
  text,
  onTextChange,
  onSave,
  onCancel,
}: EditToolsProps) {
  const [localText, setLocalText] = useState(text);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    onTextChange(e.target.value);
  };

  const handleSave = () => {
    onSave();
  };

  // These style functions would apply formatting in a real implementation
  const applyBold = () => {
    setLocalText(`<strong>${localText}</strong>`);
    onTextChange(`<strong>${localText}</strong>`);
  };

  const applyItalic = () => {
    setLocalText(`<em>${localText}</em>`);
    onTextChange(`<em>${localText}</em>`);
  };

  const applyLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      setLocalText(`<a href="${url}">${localText}</a>`);
      onTextChange(`<a href="${url}">${localText}</a>`);
    }
  };

  return (
    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Edit Text</h3>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
      <Textarea
        value={localText}
        onChange={handleChange}
        className="w-full mt-2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={3}
      />
      <div className="flex mt-3 gap-2">
        <Button
          onClick={applyBold}
          variant="outline"
          size="icon"
          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={applyItalic}
          variant="outline"
          size="icon"
          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={applyLink}
          variant="outline"
          size="icon"
          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="p-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          <Type className="h-4 w-4" />
        </Button>
        <div className="flex-grow"></div>
        <Button
          onClick={handleSave}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 gap-1"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
