'use client';
import React from 'react';

const LabelForm: React.FC<{ title: string }> = ({ title }) => {
  return <label className="px-2 text-sm font-medium text-primary">{title}</label>;
};

export default LabelForm;
