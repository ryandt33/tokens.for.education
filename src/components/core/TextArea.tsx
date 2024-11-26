import React, { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  title?: string;
  content: string;
}
const TextArea: React.FC<TextAreaProps> = ({
  title,
  content,
  className,
  ...props
}) => {
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.target.style.height = "auto"; // Reset the height
    event.target.style.height = `${event.target.scrollHeight}px`; // Set the height to the scroll height
  };

  return (
    <div className={className}>
      {title && (
        <label
          htmlFor="comment"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {title}
        </label>
      )}
      <div className="mt-2">
        <textarea
          id="comment"
          name="comment"
          onInput={handleInput}
          rows={4}
          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-fe-blue-500 sm:text-sm sm:leading-6 p-5`}
          {...props}
          value={content}
        />
      </div>
    </div>
  );
};

export default TextArea;
