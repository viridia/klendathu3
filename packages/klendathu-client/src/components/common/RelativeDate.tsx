import * as dateFormat from 'dateformat';
import * as React from 'react';

function humanAge(date: Date, brief = false): string {
  if (!date) {
    return 'a while ago';
  }
  const ms = Date.now() - date.getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds === 1) {
    if (brief) {
      return '1s';
    }
    return '1 second ago';
  }
  if (seconds < 60) {
    if (brief) {
      return `${seconds}s`;
    }
    return `${seconds} seconds ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes <= 1) {
    if (brief) {
      return '1m';
    }
    return '1 minute ago';
  }
  if (minutes < 60) {
    if (brief) {
      return `${minutes}m`;
    }
    return `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours <= 1) {
    if (brief) {
      return '1h';
    }
    return '1 hour ago';
  }
  if (hours < 24) {
    if (brief) {
      return `${hours}h`;
    }
    return `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  if (days <= 1) {
    if (brief) {
      return '1d';
    }
    return '1 day ago';
  }
  if (days < 30) {
    if (brief) {
      return `${days}d`;
    }
    return `${days} days ago`;
  }
  return dateFormat(date, 'isoDate');
}

export default function RelativeDate({ date, brief = false }: { date: Date, brief?: boolean }) {
  return (
    <span className="date" title={dateFormat(date, 'mmm dS, yyyy h:MM TT')}>
      {humanAge(date, brief)}
    </span>
  );
}
