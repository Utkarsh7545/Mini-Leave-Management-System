// Date utility functions

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const calculateWorkingDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // If it's not Saturday (6) or Sunday (0), count it as working day
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

export const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getMinDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};