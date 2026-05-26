import React from 'react';
import { Card } from '@/components/atoms/Card';

interface StatCardProps {
  title: string;
  value: string;
  valueColor?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  valueColor = 'text-vault-white',
  subtitle,
}) => {
  return (
    <Card title={title}>
      <p className={`text-4xl font-bold ${valueColor}`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </Card>
  );
};
