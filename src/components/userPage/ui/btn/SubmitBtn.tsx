import { Button, ButtonProps } from 'react-daisyui';

interface SubmitBtnProps extends ButtonProps {
  value?: string;
}
export default function SubmitBtn({ value, className, ...props }: SubmitBtnProps) {
  return (
    <Button size="sm" color="success" type="submit" {...props} className={`rounded-md text-white hover:scale-105 ${className}`}>
      {value}
    </Button>
  );
}
