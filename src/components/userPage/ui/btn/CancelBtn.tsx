'use client';
import { Button, ButtonProps } from 'react-daisyui';

interface CancelBtnProps extends ButtonProps {
  value?: string;
}

export default function CancelBtn({ value, className, ...props }: CancelBtnProps) {
  return (
    <Button size="sm" color="error" {...props} className={`rounded-md text-white hover:scale-105 hover:border hover:border-black ${className}`}>
      {value}
    </Button>
  );
}
