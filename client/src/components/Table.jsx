import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table = ({ children, className }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className={twMerge(clsx('min-w-full text-left font-inter bg-white rounded-lg overflow-hidden', className))}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className }) => {
  return (
    <thead className={twMerge(clsx('bg-gray-50/80 text-raahx-slate text-xs uppercase tracking-wider border-b border-raahx-border', className))}>
      {children}
    </thead>
  );
};

export const TableRow = ({ children, className, hover = true }) => {
  return (
    <tr className={twMerge(clsx('border-b border-raahx-border last:border-0 transition-colors duration-200', { 'hover:bg-gray-50/50': hover }, className))}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className }) => {
  return (
    <th className={twMerge(clsx('px-6 py-4 font-semibold text-raahx-slate', className))}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className }) => {
  return (
    <td className={twMerge(clsx('px-6 py-4 whitespace-nowrap text-sm text-raahx-navy', className))}>
      {children}
    </td>
  );
};

export const TableBody = ({ children, className }) => {
  return (
    <tbody className={twMerge(clsx('bg-white', className))}>
      {children}
    </tbody>
  );
};
