import * as scuid from 'scuid';

import { generateAuthToken, getUserId } from '../utils';
import * as faker from 'faker/locale/en';


const DEFAULT_COUNT = 25;

let users = new Array(DEFAULT_COUNT).fill(0).map(_ => ({
  id: scuid(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  children: new Array(2).fill(0).map(_ => ({
    id: scuid(),
    name: faker.name.firstName(),
    age: Math.floor(Math.random() * (60 - 18 + 1)) + 18
  }))
}))

class Child {
  id: string;
  parent: any;
  name: string;
  age: number;

}

const addChildrenToUser = (user, userInput) => {
  const childrenInput = userInput.children;
  const childrenArr = childrenInput.map(childInput => {
    let child;

    if (childInput.id !== undefined) {
      child = user.children.find(child => child.id === childInput.id);
    } else {
      child = new Child();
      child.id = scuid();
      child.parent = user;
    }

    if (childInput.name !== undefined) {
      child.name = childInput.name;
    }

    if (childInput.age !== undefined) {
      child.age = childInput.age;
    }

    return child;
  });

  user.children = childrenArr;
}

const createUser = (userInput) => {
  let userToCreate = {
    id: userInput.id,
    firstName: userInput.firstName,
    lastName: userInput.lastName,
    email: userInput.email,
    avatar: userInput.avatar,
    children: []
  }

  if (userInput.children !== undefined) {
    addChildrenToUser(userToCreate, userInput)
  }
  users.push(userToCreate);
  console.log(userToCreate);

  return userToCreate;
}

const updateUser = (userInput) => {
  let userToUpdate = users.find(user => user.id === userInput.id);

  if (userInput.firstName !== undefined) {
    userToUpdate.firstName = userInput.firstName;
  }
  if (userInput.lastName !== undefined) {
    userToUpdate.lastName = userInput.lastName;
  }
  if (userInput.email !== undefined) {
    userToUpdate.email = userInput.email;
  }
  if (userInput.avatar !== undefined) {
    userToUpdate.avatar = userInput.avatar;
  }

  if (userInput.children !== undefined) {
    addChildrenToUser(userToUpdate, userInput);
  }

  return userToUpdate;
}

const deleteUser = (id) => {
  users = users.filter(user => user.id !== id);
 
  return id;
}

export default {
  Query: {
    me: (parent, args, ctx) => {
      const userId = getUserId(ctx);
      const { faker } = ctx;

      return {
        id: userId,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar()
      };
    },

    allUsers(parent, { count = DEFAULT_COUNT }, { faker }) {
      return users;
    },

    User: (parent, { id }, { faker }) => (users.find(user => user.id === id)),

    allProducts: (parent, { count = DEFAULT_COUNT }, { faker }) => {
      return new Array(count).fill(0).map(_ => ({
        id: scuid(),
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
        id: scuid(),
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
        id: scuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar()
      }
    }),

    // refactor user relation into Class
    allPosts: (parent, { count }, { faker }) => {
      return new Array(count).fill(0).map(_ => ({
        id: scuid(),
        title: faker.random.words(),
        body: faker.lorem.sentences(),
        published: faker.random.boolean(),
        createdAt: faker.date.past(),
        author: {
          id: scuid(),
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
      token: await generateAuthToken(
        { userId: scuid(), email },
        jwtSecret,
        expiresIn
      )
    }),

    login: async (
      parent,
      { email, password, expiresIn = '2d' },
      { jwtSecret },
      info
    ) => ({
      token: await generateAuthToken(
        { email, userId: scuid() },
        jwtSecret,
        expiresIn
      )
    }),

    updateUser: (parent, { userInput }, ctx) => {
      return updateUser(userInput);
    },

    createUser: (parent, { userInput }, ctx) => {
      return createUser(userInput);
    },

    deleteUser: (parent, { id }, ctx) => {
    },

    users: (parent, { userInputs }: any, ctx) => {
      // Fetch all user ids to identify which mutation should be used on the users input
      const existingIds = users.map(u => u.id);
      const usersToCreate = [];
      const usersToUpdate = [];
      const usersToDelete = [];
      userInputs.forEach(userInput => {
        if (existingIds.includes(userInput.id)) {
          usersToUpdate.push(userInput);
        } else {
          usersToCreate.push(userInput);
        }
      });

      const newUsersListIds = [...usersToCreate.map(user => user.id), ...usersToUpdate.map(user => user.id)];
      
      // to indicate the deleted ids
      users.forEach(user => {
        if (!newUsersListIds.includes(user.id)) {
          usersToDelete.push(user.id);
        }
      })

      // Mutations
      usersToCreate.forEach(userToCreate => {
        createUser(userToCreate);
      })

      usersToUpdate.forEach(userToUpdate => {
        updateUser(userToUpdate);
      })

      usersToDelete.forEach(userToDelete => {
        deleteUser(userToDelete)
      })
      return {
        usersCreated: usersToCreate,
        usersUpdated: usersToUpdate,
        usersDeleted: usersToDelete
      }
    },

    // No authentication for demo purposes
    createTodo: (parent, { title, completed }, { faker }) => {
      const id = scuid();

      // pubsub.publish('todoAdded', {
      //   todoAdded: {
      //     id,
      //     title,
      //     completed
      //   }
      // });

      return {
        id,
        title,
        completed: completed === undefined ? faker.random.boolean() : completed
      };
    }
  }

  // Subscription: {
  //   todoAdded: {
  //     subscribe: (parent, args, { pubsub }) => {
  //       // setInterval(
  //       //   () => pubsub.publish(channel, { counter: { count: count++ } }),
  //       //   2000
  //       // );
  //       //
  //       // return pubsub.asyncIterator({
  //       //   id: 'abc',
  //       //   title: 'Hello',
  //       //   completed: true
  //       // });
  //     }
  //   }
  // }
};
