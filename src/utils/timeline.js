const isTimeRangeInDisabledInterval = (timeRange, disabledInterval) => {
  debugger;
  return (
    (timeRange[0] > disabledInterval.start && timeRange[0] < disabledInterval.end)
    || (timeRange[1] > disabledInterval.start && timeRange[1] < disabledInterval.end)
    || (timeRange[0] < disabledInterval.start && timeRange[1] > disabledInterval.start)
    || (timeRange[0] < disabledInterval.end && timeRange[1] > disabledInterval.end)
  );
};

export const isTimeRangeAllowed = (timeRange, disabledIntervals) => {
  return disabledIntervals.some(interval => isTimeRangeInDisabledInterval(timeRange, interval));
};
