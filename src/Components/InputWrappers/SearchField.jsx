import {InputGroup} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {useTranslation} from "react-i18next";
import React from "react";


export default React.memo(function SearchField (
  {searchParameter, setSearchParameter, searchApplyHandler, placeholder}
) {
  const {t} = useTranslation();

  const changeSearchParameter = event => {
    setSearchParameter(event.target.value);
  }

  return (
    <InputGroup className='catalog-search'>
      <Form.Control
        value={searchParameter}
        onChange={changeSearchParameter}
        placeholder={placeholder}
      />
      <Button variant="outline-primary" onClick={searchApplyHandler}>
        {t('Search')}
      </Button>
    </InputGroup>
  );
});
