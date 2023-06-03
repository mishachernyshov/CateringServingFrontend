import {useTranslation} from "react-i18next";
import Form from "react-bootstrap/Form";
import {useState} from "react";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { getLanguageHeader } from '../../utils/request';


export default function Login () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const navigate = useNavigate();

  const submitForm = event => {
    event.preventDefault();

    axios({
      method: 'post',
      url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_LOGIN_URL,
      data: {
        username: username,
        password: password,
      },
      headers: getLanguageHeader(),
    })
      .then(response => {
        localStorage.setItem(process.env.REACT_APP_LOCAL_STORAGE_ACCESS_TOKEN_KEY, response.data.access);
        localStorage.setItem(process.env.REACT_APP_LOCAL_STORAGE_REFRESH_TOKEN_KEY, response.data.refresh);
        navigate('/user_catering_establishments/list');
      })
      .catch(error => {
        setErrors(error.response.data);
      });
  }

  return (
    <div className='encompassed-viewport'>
      <div className='auth-wrapper'>
        <div className='auth-container'>
          <h2>{t('Logging in')}</h2>
          <div className='form-content'>
            <div>{t('Username')}</div>
            <Form.Group>
              <Form.Control
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Form.Text className="field-error">{errors['username']}</Form.Text>
            </Form.Group>
            <div>{t('Password')}</div>
            <Form.Group>
              <Form.Control
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Form.Text className="field-error">{errors['password']}</Form.Text>
            </Form.Group>
          </div>
          {
            errors['detail'] &&
            <div className='centered-form-item-wrapper'>
              <div className='field-error'>{errors['detail']}</div>
            </div>
          }
          <div className='centered-form-item-wrapper'>
            <Button onClick={submitForm}>
              {t('Log in')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
