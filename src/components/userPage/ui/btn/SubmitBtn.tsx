import React from 'react';
import { Button, ButtonProps } from 'react-daisyui';

interface SubmitBtnProps extends ButtonProps {
  value?: string;
}
export default function SubmitBtn({ value, className, ...props }: SubmitBtnProps) {
  return (
    <Button size="sm" color="success" {...props} className={`rounded-md text-white ${className}`}>
      {value}
    </Button>
  );
}
