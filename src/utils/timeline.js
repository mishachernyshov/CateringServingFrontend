const isTimeRangeInDisabledInterval = (timeRange, disabledInterval) => {
  return (
    (timeRange[0] > disabledInterval.start && timeRange[0] < disabledInterval.end)
    || (timeRange[1] > disabledInterval.start && timeRange[1] < disabledInterval.end)
    || (timeRange[0] < disabledInterval.start && timeRange[1] > disabledInterval.start)
    || (timeRange[0] < disabledInterval.end && timeRange[1] > disabledInterval.end)
    || (
      timeRange[0].getTime() === disabledInterval.start.getTime()
      && timeRange[1].getTime() === disabledInterval.end.getTime()
    )
  );
};

export const isTimeRangeAllowed = (timeRange, disabledIntervals) => {
  return disabledIntervals.some(interval => isTimeRangeInDisabledInterval(timeRange, interval));
};

export const canIntervalsBeCombined = (firstInterval, secondInterval) => {
  return (
    (firstInterval.start >= secondInterval.start && firstInterval.start <= secondInterval.end)
    || (firstInterval.end >= secondInterval.start && firstInterval.end <= secondInterval.end)
    || (secondInterval.start >= firstInterval.start && secondInterval.start <= firstInterval.end)
    || (secondInterval.end >= firstInterval.start && secondInterval.end <= firstInterval.end)
  );
};

export const combineDisabledTimelineIntervals = intervals => {
  const combinedIntervals = [];

  intervals.sort((firstInterval, secondInterval) => firstInterval.start.getTime() - secondInterval.start.getTime());
  for (const interval of intervals) {
    if (combinedIntervals.length && canIntervalsBeCombined(interval, combinedIntervals[combinedIntervals.length - 1])) {
      const lastSavedInterval = combinedIntervals[combinedIntervals.length - 1];
      const minStart = interval.start < lastSavedInterval.start ? interval.start : lastSavedInterval.start;
      const maxEnd = interval.end > lastSavedInterval.end ? interval.end : lastSavedInterval.end;
      combinedIntervals.pop();
      combinedIntervals.push({start: minStart, end: maxEnd});
    } else {
      combinedIntervals.push(interval);
    }
  }

  return combinedIntervals;
};
