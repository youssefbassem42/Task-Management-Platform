import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateStr, formatString = 'MMM dd, yyyy') => {
  if (!dateStr) return '';
  return format(new Date(dateStr), formatString);
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
