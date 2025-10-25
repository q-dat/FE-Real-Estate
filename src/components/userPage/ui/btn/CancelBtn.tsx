'use client';
import React from 'react';
import { Button, ButtonProps } from 'react-daisyui';

interface CancelBtnProps extends ButtonProps {
  value?: string;
}

export default function CancelBtn({ value, className, ...props }: CancelBtnProps) {
  return (
    <Button size="sm" color="error" {...props} className={`rounded-md text-white ${className}`}>
      {value}
    </Button>
  );
}
