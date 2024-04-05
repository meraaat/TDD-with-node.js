const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  // delete all user table data before run each test
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@gmail.com',
  password: 'P4ssword',
};

const postUser = (user = validUser, options = {}) => {
  const agent = request(app).post('/api/1.0/users');
  if (options.language) agent.set('Accept-Language', options.language);
  return agent.send(user);
};

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created');
  });

  it('saves a user to database', async () => {
    await postUser();

    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('saves a username and email to database', async () => {
    await postUser();

    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@gmail.com');
  });

  it('hashes the user password in database', async () => {
    await postUser();

    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });

  it('returns 400 when username is null', async () => {
    const user = Object.assign({}, validUser, { username: null });
    const response = await postUser(user);

    expect(response.status).toBe(400);
  });

  it('returns validationError field in response when validation error occurs', async () => {
    const user = Object.assign({}, validUser, { username: null });
    const response = await postUser(user);

    const body = response.body;
    expect(body.validationError).not.toBeUndefined();
  });

  it('returns error when username and email are both null.', async () => {
    const user = Object.assign({}, validUser, { username: null, email: null });
    const response = await postUser(user);

    const body = response.body;
    expect(Object.keys(body.validationError)).toEqual(['username', 'email']);
  });

  const username_null = 'username cannot be null';
  const username_size = 'username must min 4 and max 32 characters';
  const email_null = 'E-mail cannot be null';
  const email_invalid = 'E-mail is not valid';
  const password_null = 'password cannot be null';
  const password_size = 'password must be at least 6 characters';
  const password_pattern = 'password must have at least 1 uppercase, 1 lowercase letter and 1 number';
  const email_inuse = 'E-mail is in use';
  it.each`
    field         | value               | expectedMessage
    ${'username'} | ${null}             | ${username_null}
    ${'username'} | ${'usr'}            | ${username_size}
    ${'username'} | ${'a'.repeat(33)}   | ${username_size}
    ${'email'}    | ${null}             | ${email_null}
    ${'email'}    | ${'mail.com'}       | ${email_invalid}
    ${'email'}    | ${'user@gmail'}     | ${email_invalid}
    ${'email'}    | ${'user.gmail.com'} | ${email_invalid}
    ${'password'} | ${null}             | ${password_null}
    ${'password'} | ${'P4ssw'}          | ${password_size}
    ${'password'} | ${'alllowercase'}   | ${password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}   | ${password_pattern}
    ${'password'} | ${'1234567'}        | ${password_pattern}
    ${'password'} | ${'lowerandUPPER'}  | ${password_pattern}
    ${'password'} | ${'lowerand123456'} | ${password_pattern}
    ${'password'} | ${'UPPERAND123456'} | ${password_pattern}
  `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
    const user = Object.assign({}, validUser, { [field]: value });
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationError[field]).toBe(expectedMessage);
  });

  it(`returns ${email_inuse} when same E-mail already in use`, async () => {
    await User.create(validUser);

    const response = await postUser();
    const body = response.body;
    expect(body.validationError.email).toBe(email_inuse);
  });

  it('returns errors for both username is null and E-mail is in use ', async () => {
    await User.create(validUser);

    const user = Object.assign({}, validUser, { username: null });

    const response = await postUser(user);
    const body = response.body;
    expect(Object.keys(body.validationError)).toEqual(['username', 'email']);
  });
});

describe('Internationalization', () => {
  const username_null = 'gebruikersnaam mag niet nul zijn';
  const username_size = 'username must min 4 and max 32 characters';
  const email_null = 'gebruikersnaam moet minimaal 4 en maximaal 32 tekens bevatten';
  const email_invalid = 'E-mail is niet geldig';
  const password_null = 'wachtwoord mag niet nul zijn';
  const password_size = 'Wachtwoord moet tenminste 6 tekens bevatten';
  const password_pattern = 'Het wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten';
  const email_inuse = 'E-mail is in use';
  it.each`
    field         | value               | expectedMessage
    ${'username'} | ${null}             | ${username_null}
    ${'username'} | ${'usr'}            | ${username_size}
    ${'username'} | ${'a'.repeat(33)}   | ${username_size}
    ${'email'}    | ${null}             | ${email_null}
    ${'email'}    | ${'mail.com'}       | ${email_invalid}
    ${'email'}    | ${'user@gmail'}     | ${email_invalid}
    ${'email'}    | ${'user.gmail.com'} | ${email_invalid}
    ${'password'} | ${null}             | ${password_null}
    ${'password'} | ${'P4ssw'}          | ${password_size}
    ${'password'} | ${'alllowercase'}   | ${password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}   | ${password_pattern}
    ${'password'} | ${'1234567'}        | ${password_pattern}
    ${'password'} | ${'lowerandUPPER'}  | ${password_pattern}
    ${'password'} | ${'lowerand123456'} | ${password_pattern}
    ${'password'} | ${'UPPERAND123456'} | ${password_pattern}
  `('returns $expectedMessage when $field is $value when language set as Dutch', async ({ field, value, expectedMessage }) => {
    const user = Object.assign({}, validUser, { [field]: value });
    const response = await postUser(user, { language: 'nl' });
    const body = response.body;
    expect(body.validationError[field]).toBe(expectedMessage);
  });

  it(`returns ${email_inuse} when same E-mail already in use when language set as Dutch`, async () => {
    await User.create(validUser);

    const response = await postUser(validUser, { language: 'nl' });
    const body = response.body;
    expect(body.validationError.email).toBe(email_inuse);
  });
});
