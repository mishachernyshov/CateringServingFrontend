import {endOfToday, set, startOfToday} from "date-fns";


const now = new Date();

export const getTodayAtSpecificTime = ({hours = 12, minutes = 0, seconds = 0, milliseconds = 0}) => {
  return set(now, { hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds });
};

export const parseTimeComponents = input => {
  const match = input.match(/(?<hours>\d{1,2}):(?<minutes>\d{1,2})(:(?<seconds>\d{1,2}))?/);
  if (match) {
    const timeComponents = match.groups;
    for (const [key, value] of Object.entries(timeComponents)) {
      timeComponents[key] = parseInt(value);
    }
    return timeComponents;
  }
  return undefined;
};

export const isToday = date => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export const extractTime = input => {
    const timeComponents = parseTimeComponents(input);
    if (timeComponents) {
      return set(now, timeComponents);
    }
    return undefined;
};

export const parseIsoDate = input => {
  return input.split('T')[0];
};

export const updateDate = (date, updatingDateComponents) => {
  const updatingMethods = {
    hours: 'setHours',
    minutes: 'setMinutes',
    seconds: 'setSeconds',
  };

  for (const [name, value] of Object.entries(updatingDateComponents)) {
    if (name in updatingMethods) {
      date[updatingMethods[name]](value);
    }
  }
};

export const buildDateWithUpdatedComponents = (dateImage, updatingComponents) => {
  const date = new Date(dateImage);
  updateDate(date, updatingComponents);
  return date;
};

export const getShiftedDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getWorkHoursInterval = () => [startOfToday(), endOfToday()];
