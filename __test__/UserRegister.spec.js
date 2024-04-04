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

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
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

  it.each`
    field         | value               | expectedMessage
    ${'username'} | ${null}             | ${'username cannot be null'}
    ${'username'} | ${'usr'}            | ${'username must min 4 and max 32 characters'}
    ${'username'} | ${'a'.repeat(33)}   | ${'username must min 4 and max 32 characters'}
    ${'email'}    | ${null}             | ${'E-mail cannot be null'}
    ${'email'}    | ${'mail.com'}       | ${'E-mail is not valid'}
    ${'email'}    | ${'user@gmail'}     | ${'E-mail is not valid'}
    ${'email'}    | ${'user.gmail.com'} | ${'E-mail is not valid'}
    ${'password'} | ${null}             | ${'password cannot be null'}
    ${'password'} | ${'P4ssw'}          | ${'password must be at least 6 characters'}
    ${'password'} | ${'alllowercase'}   | ${'password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'ALLUPPERCASE'}   | ${'password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'1234567'}        | ${'password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'lowerandUPPER'}  | ${'password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'lowerand123456'} | ${'password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'UPPERAND123456'} | ${'password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
  `('returns $expectedMessage when $field is $value', async ({ field, value, expectedMessage }) => {
    const user = Object.assign({}, validUser, { [field]: value });
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationError[field]).toBe(expectedMessage);
  });

  it('returns E-mail is in use when same E-mail already in use', async () => {
    await User.create(validUser);

    const response = await postUser();
    const body = response.body;
    expect(body.validationError.email).toBe('E-mail is in use');
  });
});
