export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

export const formatShortDate = (input) => {
  if (!input) {
    return '';
  }

  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (input) => {
  if (!input) {
    return '';
  }

  const date = new Date(input);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export const formatMessageTime = (input) => {
  if (!input) {
    return '';
  }

  const date = new Date(input);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (input) => {
  if (!input) {
    return '';
  }

  const date = new Date(input).getTime();
  const now = Date.now();
  const diff = date - now;
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) {
    return 'Just now';
  }

  if (abs < hour) {
    const value = Math.round(abs / minute);
    return `${value}m ${diff < 0 ? 'ago' : 'left'}`;
  }

  if (abs < day) {
    const value = Math.round(abs / hour);
    return `${value}h ${diff < 0 ? 'ago' : 'left'}`;
  }

  const value = Math.round(abs / day);
  return `${value}d ${diff < 0 ? 'ago' : 'left'}`;
};

export const isExpired = (input) => {
  if (!input) {
    return false;
  }

  return new Date(input).getTime() <= Date.now();
};

export const sortByCreatedAtDesc = (items) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
