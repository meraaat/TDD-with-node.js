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
    field         | expectedMessage
    ${'username'} | ${'username cannot be null'}
    ${'email'}    | ${'email cannot be null'}
    ${'password'} | ${'password cannot be null'}
  `('returns $expectedMessage when $field is null', async ({ field, expectedMessage }) => {
    const user = Object.assign({}, validUser, { [field]: null });
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationError[field]).toBe(expectedMessage);
  });

  it('returns validation size error when username length is less than 4 characters', async () => {
    const user = Object.assign({}, validUser, { username: 'usr' });
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationError.username).toBe('username must min 4 and max 32 characters');
  });
});
