'use client';
import React from 'react';

const LabelForm: React.FC<{ title: string; className?: string }> = ({ title, className }) => {
  return <label className={`px-2 py-0.5 text-sm font-medium text-primary ${className}`}>{title}</label>;
};

export default LabelForm;
