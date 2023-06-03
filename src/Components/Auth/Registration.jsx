import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { getLanguageHeader } from '../../utils/request';


export default function Registration () {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('1900-01-01');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    validatePasswordsIdentity();
  }, [password, passwordAgain]);

  const submitForm = event => {
    event.preventDefault();

    axios({
      method: 'post',
      url: process.env.REACT_APP_BACKEND_URL + process.env.REACT_APP_REGISTER_URL,
      data: {
        'first_name': firstName,
        'last_name': lastName,
        'username': username,
        'password': password,
        'birthday': birthday,
      },
      headers: getLanguageHeader(),
    })
      .then(_ => {
        debugger;
        navigate('/login');
      })
      .catch(error => {
        const updatedErrors = {...error.response.data};
        if ('password_again' in errors) {
          updatedErrors['password_again'] = errors['password_again'];
        }
        setErrors(updatedErrors);
      });
  }

  const deleteFieldError = (field) => {
    const updatedErrors = {...errors};
    delete updatedErrors[field];
    setErrors(updatedErrors);
  }

  const validatePasswordsIdentity = () => {
    if (password !== passwordAgain) {
      setErrors({
        ...errors,
        'password_again': t('Passwords are not the same.'),
      });
    } else if ('password_again' in errors) {
      const updated_errors = {...errors};
      delete updated_errors['password_again'];
      setErrors(updated_errors);
    }
  }

  return (
    <div className='encompassed-viewport'>
      <div className='auth-wrapper'>
        <div className='auth-container'>
          <h2>{t('Registration')}</h2>
          <div className='form-content'>
            <div>{t('First name')}</div>
            <div>
              <Form.Group>
                <Form.Control
                  type='text'
                  placeholder={t('e.g. Ivan')}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    deleteFieldError('first_name');
                  }}
                />
                <Form.Text className="field-error">{errors['first_name']}</Form.Text>
              </Form.Group>
            </div>
            <div>{t('Last name')}</div>
            <div>
              <Form.Group>
                <Form.Control
                  type='text'
                  placeholder={t('e.g. Shevchenko')}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    deleteFieldError('last_name');
                  }}
                />
                <Form.Text className="field-error">{errors['last_name']}</Form.Text>
              </Form.Group>
            </div>
            <div>{t('Username')}</div>
            <div>
              <Form.Group>
                <Form.Control
                  type='text'
                  placeholder={t('must be unique for each user')}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    deleteFieldError('username');
                  }}
                />
                <Form.Text className="field-error">{errors['username']}</Form.Text>
              </Form.Group>
            </div>
            <div>{t('Birthday')}</div>
            <div>
              <Form.Group>
                <Form.Control
                  type='date'
                  value={birthday}
                  onChange={(e) => {
                    setBirthday(e.target.value);
                    deleteFieldError('birthday');
                  }}
                />
                <Form.Text className="field-error">{errors['birthday']}</Form.Text>
              </Form.Group>
            </div>
            <div>{t('Password')}</div>
            <div>
              <Form.Group>
                <Form.Control
                  type='password'
                  placeholder={t('is used for logging in')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    deleteFieldError('password');
                  }}
                />
                <Form.Text className="field-error">{errors['password']}</Form.Text>
              </Form.Group>
            </div>
            <div>{t('Password (again)')}</div>
            <div>
              <Form.Group>
                <Form.Control
                  type='password'
                  placeholder={t('must be entered again to avoid typos')}
                  value={passwordAgain}
                  onChange={(e) => {
                    setPasswordAgain(e.target.value);
                  }}
                />
                <Form.Text className="field-error">{errors['password_again']}</Form.Text>
              </Form.Group>
            </div>
          </div>
          <div className='centered-form-item-wrapper'>
            <Button
              onClick={submitForm}
              disabled={!!Object.keys(errors).length}
            >
              {t('Register')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
