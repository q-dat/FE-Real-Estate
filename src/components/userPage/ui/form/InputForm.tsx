'use client';
import { Input, InputProps } from 'react-daisyui';

interface InputFormProps extends InputProps {
  label?: string;
  classNameLabel?: string;
}

export default function InputForm({ id, name, label, className = '', classNameLabel = '', required, ...props }: InputFormProps) {
  return (
    <div className="relative w-full">
      <Input id={id || name} name={name} placeholder=" " className={`peer w-full focus:outline-none ${className}`} {...props} />
      {label && (
        <label
          htmlFor={id || name}
          className={`pointer-events-none absolute -top-2 left-2 rounded-sm px-1 py-0 text-sm text-primary transition-all duration-500 ease-in-out peer-placeholder-shown:top-3 peer-placeholder-shown:w-full peer-placeholder-shown:rounded-sm peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#000000] peer-focus:-top-4 peer-focus:w-auto peer-focus:text-sm peer-focus:text-primary dark:peer-placeholder-shown:text-primary dark:peer-focus:text-primary ${classNameLabel}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
    </div>
  );
}
