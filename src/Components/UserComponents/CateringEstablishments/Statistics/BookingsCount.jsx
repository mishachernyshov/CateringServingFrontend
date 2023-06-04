import {memo, useState} from "react";
import {useTranslation} from "react-i18next";

import Form from "react-bootstrap/Form";
import {parseIsoDate} from "../../../../utils/datetime";
import Button from "react-bootstrap/Button";
import {makeAuthenticatedRequest} from "../../../../utils/request";
import {useNavigate} from "react-router-dom";
import Table from "react-bootstrap/Table";

export default memo(() => {
  const [startDate, setStartDate] = useState(parseIsoDate(new Date().toISOString()));
  const [endDate, setEndDate] = useState(parseIsoDate(new Date().toISOString()));
  const [statistics, setStatistics] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const changeStartDate = event => {
    setStartDate(event.target.value);
  };

  const changeEndDate = event => {
    setEndDate(event.target.value);
  };

  const getQueryParams = () => {
    const endOfEndDate = new Date(endDate);
    endOfEndDate.setDate(endOfEndDate.getDate() + 1);
    return `start_date=${startDate}&end_date=${endOfEndDate.toISOString()}&`;
  };

  const getStatistics = () => {
    const queryParams = getQueryParams();

    makeAuthenticatedRequest(
      {
        url: `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BOOKINGS_STATISTICS_URL}?${queryParams}`
      },
      navigate,
    )
      .then(response => {
        setStatistics(response.data);
        setShowResults(true);
      });
  };

  return (
    <div className='statistics-item-wrapper bookings-count-statistics'>
      <div className='statistics-name'>{t('Establishments rating by bookings count')}</div>
      <div className='statistics-body'>
        <div className='statistics-filters-wrapper'>
          <div className='statistics-filter'>
            <div className='statistics-filter-name'>{t('Choose dates range')}</div>
            <div className='statistics-dates-range'>
              <div>
                <div>{t('From')}</div>
                <Form.Control type='date' value={startDate} onChange={changeStartDate} />
              </div>
              <div>
                <div>{t('To')}</div>
                <Form.Control type='date' value={endDate} onChange={changeEndDate} />
              </div>
            </div>
          </div>
        </div>
        <div className='action-btn-wrapper'>
          <Button onClick={getStatistics}>
            {t('Show results')}
          </Button>
        </div>
        {
          showResults
          ? statistics.length
            ? <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Name')}</th>
                    <th>{t('Bookings count')}</th>
                  </tr>
                </thead>
                <tbody>
                {
                  statistics.map((item, index) =>
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.bookings_count}</td>
                    </tr>
                  )
                }
                </tbody>
              </Table>
            : <div>{t('There were no bookings for the specified period.')}</div>
          : <></>
        }
      </div>
    </div>
  );
});

