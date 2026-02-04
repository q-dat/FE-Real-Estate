'use client';
import { Textarea, TextareaProps } from 'react-daisyui';

interface TextareaFormProps extends TextareaProps {
  placeholder?: string;
  classNameLabel?: string;
}

export default function TextareaForm({
  placeholder = '',
  className = '',
  classNameLabel = 'bg-white px-2 font-medium ',
  ...props
}: TextareaFormProps) {
  return (
    <div className="relative w-full">
      <Textarea {...props} placeholder=" " className={`peer textarea textarea-bordered min-h-[50px] w-full focus:outline-none ${className}`} />
      <label
        className={`pointer-events-none absolute -top-2 left-2 rounded-sm px-1 text-sm text-primary transition-all duration-500 ease-in-out peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-700 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-primary ${classNameLabel}`}
      >
        {placeholder}
      </label>
    </div>
  );
}
