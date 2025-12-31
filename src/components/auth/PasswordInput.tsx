'use client';
import { useState } from 'react';
import { Input, Button } from 'react-daisyui';

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PasswordInput = ({ value, onChange, placeholder = "••••••••", disabled }: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pr-12 focus:ring-2 focus:ring-primary transition-all duration-300"
      />
      <Button
        size="sm"
        shape="square"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70 hover:opacity-100"
        onClick={() => setShow(!show)}
        type="button"
      >
        {show ? 'HIDE' : 'SHOW'}
      </Button>
    </div>
  );
};