import React, {memo, useCallback, useContext, useEffect, useReducer, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {useTranslation} from "react-i18next";
import Button from "react-bootstrap/Button";
import {Dropdown, DropdownButton} from "react-bootstrap";
import TimeRange from "react-timeline-range-slider";

import TablesContext from "../CateringEstablishments/TablesContext";
import WorkHoursContext from "../CateringEstablishments/WorkHoursContext";
import timelineReducer from "../../data/reducers/timeline";
import {
  buildDateWithUpdatedComponents,
  getShiftedDate,
  getTodayAtSpecificTime,
  getWorkHoursInterval,
  parseIsoDate,
  parseTimeComponents,
  isToday,
} from "../../utils/datetime";
import {dummyFunction} from "../../utils/functools";
import {ALLOWED_ORDERING_DAYS_RANGE, TIME_LOCATE} from "../../data/constants/settings";
import {getObject} from "../../utils/array";
import TimelineChangeType from "../../data/enums/timelineChangeType";
import {isTimeRangeAllowed, combineDisabledTimelineIntervals} from "../../utils/timeline";
import {makeAuthenticatedRequest} from "../../utils/request";
import Spinner from "react-bootstrap/Spinner";
import {useNavigate} from "react-router-dom";
import UserBookingsContext, {UserBookingsSetContext} from "./UserBookingsContext";
import ComponentMode from "../../data/enums/componentMode";
import deepcopy from "deepcopy";

const workHoursInterval = getWorkHoursInterval();
const minDate = parseIsoDate(new Date().toISOString());
const maxDate = parseIsoDate(getShiftedDate(new Date(), ALLOWED_ORDERING_DAYS_RANGE).toISOString());


export default memo(({show, closeHandler, bookingId}) => {
  const mode = bookingId ? ComponentMode.Editing : ComponentMode.Creation;
  const tables = useContext(TablesContext);
  const workHours = useContext(WorkHoursContext);
  const userBookings = useContext(UserBookingsContext);
  const setUserBookings = useContext(UserBookingsSetContext);
  const booking = (
    mode === ComponentMode.Editing && userBookings ? getObject(userBookings, 'id', bookingId) : undefined
  );
  const [table, setTable] = useState(null);
  const [date, setDate] = useState(minDate);

  const getDisabledWorkHoursInterval = useCallback(() => {
    if (workHours) {
      const startTime = getTodayAtSpecificTime(parseTimeComponents(workHours['start_time']));
      const now = new Date();
      const disabledWorkHoursIntervals = [
        {
          start: getTodayAtSpecificTime({hours: 0}),
          end: (
            // now > startTime
            //   ? now
            //   :
            getTodayAtSpecificTime(parseTimeComponents(workHours['start_time']))
          ),
        },
        {
          start: getTodayAtSpecificTime(parseTimeComponents(workHours['end_time'])),
          end: getTodayAtSpecificTime({hours: 24}),
        },
      ];

      return disabledWorkHoursIntervals.filter(interval => interval.end - interval.start);
    }
    return [];
  }, [workHours]);

  const getDefaultTimeRange = () => {
    const startOfDefaultInterval = workHours
      ? getTodayAtSpecificTime(parseTimeComponents(workHours['start_time']))
      : getTodayAtSpecificTime({hours: 8});
    const endOfDefaultInterval = new Date(startOfDefaultInterval.getTime() + 30 * 60 * 1000);
    return [startOfDefaultInterval, endOfDefaultInterval];
  };

  const getInitialTimeline = () => {
    const disabledIntervals = getDisabledWorkHoursInterval();
    const timeRange = getDefaultTimeRange();
    return {
      disabledIntervals: disabledIntervals,
      error: isTimeRangeAllowed(timeRange, disabledIntervals),
      timeRange: timeRange,
    };
  };

  const [timeline, dispatchTimeline] = useReducer(
    timelineReducer,
    null,
    getInitialTimeline,
  );

  const {t} = useTranslation();
  const navigate = useNavigate();

  const updateWorkHours = useCallback(selectedInterval => {
    dispatchTimeline({type: TimelineChangeType.TIME_RANGE_CHANGED, payload: selectedInterval});
  }, []);

  const getTableRepresentation = table => {
    const serving_clients_number_phrase = t('for %d clients').replace('%d', table.serving_clients_number);
    return `№${table.number} (${serving_clients_number_phrase})`;
  };

  const updateDate = event => {
    setDate(event.target.value);
  }

  const showTimeline = table && date;

  const updateTable = tableId => {
    setTable(getObject(tables, 'id', parseInt(tableId)));
  };

  const getBookings = useCallback(() => {
    return makeAuthenticatedRequest(
      {
        url: (
          `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BOOKING_URL}?`
          + `date=${date}&catering_establishment_table=${table.id}&`
        ),
      },
      navigate,
    )
      .then(response => {
        const intervalsToCombine = [
          ...getDisabledWorkHoursInterval(),
          ...response.data.map(dataItem => {
            const startDateTime = new Date(dataItem.start_datetime);
            const endDateTime = new Date(dataItem.end_datetime);

            return {
              start: getTodayAtSpecificTime({
                hours: startDateTime.getHours(), minutes: startDateTime.getMinutes(),
              }),
              end: getTodayAtSpecificTime({
                hours: endDateTime.getHours(), minutes: endDateTime.getMinutes(),
              }),
            };
          }),
        ];

        if (isToday(new Date(date))) {
          intervalsToCombine.push({
            start: getTodayAtSpecificTime({hours: 0}),
            end: new Date(),
          });
        }
        if (mode === ComponentMode.Editing) {
          const intervalIndex = intervalsToCombine.findIndex(
            interval => (
              interval.start.toISOString() === booking.start_datetime
              && interval.end.toISOString() === booking.end_datetime
            )
          );
          intervalsToCombine.splice(intervalIndex, 1);
        }
        dispatchTimeline({
          type: TimelineChangeType.DISABLED_INTERVALS_CHANGED,
          payload: combineDisabledTimelineIntervals(intervalsToCombine),
        });
      })
  }, [date, table, navigate, getDisabledWorkHoursInterval]);

  useEffect(() => {
    if (date && table) {
      getBookings();
    }
  }, [date, getBookings, table]);

  const buildBookingData = () => {
    const startDateTime = buildDateWithUpdatedComponents(
      date,
      {hours: timeline.timeRange[0].getHours(), minutes: timeline.timeRange[0].getMinutes()},
    );
    const endDateTime = buildDateWithUpdatedComponents(
      date,
      {hours: timeline.timeRange[1].getHours(), minutes: timeline.timeRange[1].getMinutes()},
    );

    return {
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      catering_establishment_table: table.id,
    };
  };

  const resetAndClose = () => {
    setTable(null);
    dispatchTimeline({type: TimelineChangeType.TIME_RANGE_CHANGED, payload: getDefaultTimeRange()})
    closeHandler();
  }

  const createBooking = () => {
    makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BOOKING_URL}`,
        method: 'post',
        data: buildBookingData(),
      },
      navigate,
    )
      .then(response => {
        setUserBookings([...userBookings, response.data]);
        resetAndClose();
      })
  };

  const updateBooking = () => {
    makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BOOKING_URL}${booking.id}/`,
        method: 'patch',
        data: buildBookingData(),
      },
      navigate,
    )
      .then(response => {
        const data = response.data;
        const updatedUserBookings = deepcopy(userBookings);
        debugger;
        for (let i = 0; i < updatedUserBookings.length; ++i) {
          if (updatedUserBookings[i].id === booking.id) {
            updatedUserBookings[i] = {...updatedUserBookings[i], ...data};
            break;
          }
        }
        setUserBookings(updatedUserBookings);
        resetAndClose();
      });
  };

  useEffect(() => {
    if (mode === ComponentMode.Editing && tables) {
      const startDateTime = new Date(booking.start_datetime);
      const endDateTime = new Date(booking.end_datetime);
      const bookingTimeRange = [
        getTodayAtSpecificTime({
          hours: startDateTime.getHours(), minutes: startDateTime.getMinutes(),
        }),
        getTodayAtSpecificTime({
          hours: endDateTime.getHours(), minutes: endDateTime.getMinutes(),
        }),
      ];

      dispatchTimeline({type: TimelineChangeType.TIME_RANGE_CHANGED, payload: bookingTimeRange});
      setTable(getObject(tables, 'id', booking.catering_establishment_table));
      setDate(parseIsoDate(booking.start_datetime));
    }
  }, [booking, mode, tables]);

  return (
    <Modal
      show={show}
      onHide={resetAndClose}
      backdrop="static"
      keyboard={true}
      size='xl'
    >
      <Modal.Header closeButton>
        <Modal.Title>{mode === ComponentMode.Creation ? t('Booking creation') : t('Booking editing')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='booking-creation-form-wrapper'>
          <div>{t('Table')}</div>
          {
            tables
              ? <DropdownButton
                  title={table ? getTableRepresentation(table) : t('Choose a table')}
                  onSelect={updateTable}
                >
                  {
                    tables.map(currentTable =>
                      <Dropdown.Item
                        key={currentTable.id}
                        eventKey={currentTable.id}
                      >
                        {getTableRepresentation(currentTable)}
                      </Dropdown.Item>
                    )
                  }
                </DropdownButton>
              : <Spinner variant="primary" />
          }
          <div>{t('Date')}</div>
          <Form.Control
            type="date"
            min={minDate}
            max={maxDate}
            value={date}
            onChange={updateDate}
          />
          {
            showTimeline
              ? <>
                <div>{t('Time')}</div>
                <TimeRange
                  error={timeline.error}
                  mode={2}
                  selectedInterval={timeline.timeRange}
                  timelineInterval={workHoursInterval}
                  onChangeCallback={updateWorkHours}
                  onUpdateCallback={dummyFunction}
                  disabledIntervals={timeline.disabledIntervals}
                />
              </>
              : <></>
          }
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={resetAndClose}>
          {t('Close')}
        </Button>
        {
          mode === ComponentMode.Creation
            ? <Button
                className='action-btn' disabled={!showTimeline || timeline.error}
                onClick={createBooking}
              >
                {t('Add')}
              </Button>
            : <Button
                className='action-btn' disabled={!showTimeline || timeline.error}
                onClick={updateBooking}
              >
                {t('Save')}
              </Button>
        }
      </Modal.Footer>
    </Modal>
  )
});
