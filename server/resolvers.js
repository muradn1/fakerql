const cuid = require('cuid');
const { generateAuthToken } = require('./utils');

const DEFAULT_COUNT = 25;

module.exports = {
  Query: {
    allUsers(parent, { count = DEFAULT_COUNT }, { faker }) {
      return new Array(count).fill(0).map(_ => ({
        id: cuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar()
      }));
    },

    User: (parent, { id }, { faker }) => ({
      id,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar()
    }),

    allProducts: (parent, { count = DEFAULT_COUNT }, { faker }) => {
      return new Array(count).fill(0).map(_ => ({
        id: cuid(),
        price: faker.commerce.price(),
        name: faker.commerce.productName()
      }));
    },

    Product: (parent, { id }, { faker }) => ({
      id,
      price: faker.commerce.price(),
      name: faker.commerce.productName()
    }),

    Todo: (parent, { id }, { faker }) => ({
      id,
      title: faker.random.words(),
      completed: faker.random.boolean()
    }),

    allTodos: (parent, { count = DEFAULT_COUNT }, { faker }) => {
      return new Array(count).fill(0).map(_ => ({
        id: cuid(),
        title: faker.random.words(),
        completed: faker.random.boolean()
      }));
    },

    // refactor user relation into Class
    Post: (parent, { id }, { faker }) => ({
      id,
      title: faker.random.words(),
      body: faker.lorem.paragraphs(),
      published: faker.random.boolean(),
      createdAt: faker.date.past(),
      author: {
        id: cuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar()
      }
    }),

    // refactor user relation into Class
    allPosts: (parent, { count }, { faker }) => {
      return new Array(count).fill(0).map(_ => ({
        id: cuid(),
        title: faker.random.words(),
        body: faker.lorem.sentences(),
        published: faker.random.boolean(),
        createdAt: faker.date.past(),
        author: {
          id: cuid(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          avatar: faker.image.avatar()
        }
      }));
    }
  },

  Mutation: {
    register: async (
      parent,
      { email, password, expiresIn = '2d' },
      { jwtSecret },
      info
    ) => ({
      token: await generateAuthToken({ email }, jwtSecret, expiresIn)
    }),

    login: async (
      parent,
      { email, password, expiresIn = '2d' },
      { jwtSecret },
      info
    ) => ({
      token: await generateAuthToken({ email }, jwtSecret, expiresIn)
    }),

    updateUser: (
      parent,
      { id, firstName, lastName, email, avatar },
      { user, faker }
    ) => {
      if (!user) {
        throw new Error('You must be logged into do that.');
      }

      return {
        id,
        firstName: firstName === undefined ? faker.name.firstName() : firstName,
        lastName: lastName === undefined ? faker.name.lastName() : lastName,
        email: email === undefined ? faker.internet.email() : email,
        avatar: avatar === undefined ? faker.image.avatar() : avatar
      };
    },

    // No authentication for demo purposes
    createTodo: (parent, { title, completed }, { faker }) => ({
      id: cuid(),
      title,
      completed: completed === undefined ? faker.random.boolean() : completed
    })
  }
};