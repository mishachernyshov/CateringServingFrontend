import {memo, useState} from "react";
import {useTranslation} from "react-i18next";
import {parseIsoDate} from "../../../../utils/datetime";
import {useNavigate} from "react-router-dom";
import Form from "react-bootstrap/Form";
import {DropdownButton} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import {getObject} from "../../../../utils/array";
import Button from "react-bootstrap/Button";
import {makeAuthenticatedRequest} from "../../../../utils/request";
import Table from "react-bootstrap/Table";
import {CSVLink} from "react-csv";


export default memo(({cateringEstablishments}) => {
  const [startDate, setStartDate] = useState(parseIsoDate(new Date().toISOString()));
  const [endDate, setEndDate] = useState(parseIsoDate(new Date().toISOString()));
  const [statistics, setStatistics] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [chosenEstablishment, chooseEstablishment] = useState(null);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const changeStartDate = event => {
    setStartDate(event.target.value);
  };

  const changeEndDate = event => {
    setEndDate(event.target.value);
  };

  const selectCateringEstablishment = establishmentId => {
    const newEstablishmentValue = establishmentId === '-1'
      ? null
      : getObject(cateringEstablishments, 'id', parseInt(establishmentId));
    chooseEstablishment(newEstablishmentValue);
  };

  const getQueryParams = () => {
    const endOfEndDate = new Date(endDate);
    endOfEndDate.setDate(endOfEndDate.getDate() + 1);

    let queryParams = `start_date=${startDate}&end_date=${parseIsoDate(endOfEndDate.toISOString())}&`;
    if (chosenEstablishment) {
      queryParams += `catering_establishment=${chosenEstablishment.id}&`;
    }

    return queryParams;
  };

  const getStatistics = () => {
    const queryParams = getQueryParams();

    makeAuthenticatedRequest(
      {
        url: (
          `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_DISHES_ORDERING_STATISTICS_URL}?${queryParams}`
        ),
      },
      navigate,
    ).then(response => {
      setStatistics(response.data);
      setShowResults(true);
    });
  };

  const buildStatisticsRepresentation = () => {
    return statistics.map((item, index) => [index + 1, item.name, item.orders_count]);
  };

  const headers = ['#', t('Name'), t('Order count')];

  return (
    <div className='statistics-item-wrapper dishes-ordering-count-statistics'>
      <div className='statistics-name'>{t('Dishes rating by ordering count')}</div>
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
          <div className='statistics-filter'>
            <div className='statistics-filter-name'>{t('Select an establishment')}</div>
            <div>
              <DropdownButton
                title={chosenEstablishment ? chosenEstablishment.name : t('All')}
                onSelect={selectCateringEstablishment}
              >
                <Dropdown.Item active={chosenEstablishment === null} eventKey="-1">{t('All')}</Dropdown.Item>
                {
                  cateringEstablishments.map(establishment =>
                    <Dropdown.Item
                      eventKey={establishment.id}
                      key={establishment.id}
                      active={chosenEstablishment && chosenEstablishment.id === establishment.id}
                    >
                      {establishment.name}
                    </Dropdown.Item>
                  )
                }
              </DropdownButton>
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
            ? <>
                <Table striped bordered hover>
                  <thead>
                    <tr>{headers.map(header => <th>{header}</th>)}</tr>
                  </thead>
                  <tbody>
                  {
                    statistics.map((item, index) =>
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.orders_count}</td>
                      </tr>
                    )
                  }
                  </tbody>
                </Table>
                <CSVLink data={buildStatisticsRepresentation()} headers={headers}>{t('Download a report')}</CSVLink>
              </>
            : <div>{t('There were no orders for the specified period.')}</div>
          : <></>
        }
      </div>
    </div>
  )
});
