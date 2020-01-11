import * as scuid from 'scuid';
import { generateAuthToken, getUserId } from '../utils';
import * as faker from 'faker/locale/en';


const DEFAULT_COUNT = 25;

class User {
  public id: string = scuid();
  public firstName: string;
  public lastName: string;
  public email: string;
  public avatar: string;
  public address: Address;
  public certifications: string[] = [];
  public children: Child[] = [];
}

class Child {
  public id: string = scuid();
  public parent: User;
  public name: string;
  public age: number;
}

class Address{
  public city: string;
  public street: string;
}

let users = new Array(DEFAULT_COUNT).fill(0).map(_ => {
  let newUser = new User();

  newUser.firstName = faker.name.firstName();
  newUser.lastName = faker.name.lastName();
  newUser.email = faker.internet.email();
  newUser.avatar = faker.image.avatar();

  let newAddress = new Address();
  newAddress.city = faker.address.city();
  newAddress.street = faker.address.streetName();
  newUser.address = newAddress;

  newUser.certifications = new Array(3).fill(0).map(_ => (faker.lorem.word()));

  newUser.children = new Array(2).fill(0).map(_ => {
    let newChild = new Child();

    newChild.parent = newUser;
    newChild.name = faker.name.firstName();
    newChild.age = Math.floor(Math.random() * (60 - 18 + 1)) + 18;

    return newChild;
  });

  return newUser;
})

const addChildrenToUser = (user, userInput) => {
  const childrenInput = userInput.children;
  const childrenArr = childrenInput.map(childInput => {
    let child;

    if (childInput.id !== undefined) {
      child = user.children.find(child => child.id === childInput.id);
    } else {
      child = new Child();
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

  let userToCreate = new User();

  if (userInput.id !== undefined) {
    userToCreate.id = userInput.id;
  }

  userSetFeilds(userToCreate, userInput);

  users.push(userToCreate);

  return userToCreate;
}

const updateUser = (userInput) => {
  let userToUpdate = users.find(user => user.id === userInput.id);

  userSetFeilds(userToUpdate, userInput);

  return userToUpdate;
}

const userSetFeilds = (userToSet, userInput) => {

  if (userInput.firstName !== undefined) {
    userToSet.firstName = userInput.firstName;
  }
  if (userInput.lastName !== undefined) {
    userToSet.lastName = userInput.lastName;
  }
  if (userInput.email !== undefined) {
    userToSet.email = userInput.email;
  }
  if (userInput.avatar !== undefined) {
    userToSet.avatar = userInput.avatar;
  }
  if (userInput.address !== undefined) {
    userToSet.address = userToSet.address ? userToSet.address : {};
    
    if(userInput.address.street !== undefined){
      userToSet.address.street = userInput.address.street;
    }

    if(userInput.address.city !== undefined){
      userToSet.address.city = userInput.address.city;
    }
  }
  if (userInput.certifications !== undefined) {
    userToSet.certifications = userInput.certifications;
  }
  if (userInput.children !== undefined) {
    addChildrenToUser(userToSet, userInput);
  }

}

const deleteUser = (id) => {
  users = users.filter(user => user.id !== id);

  return id;
}

const syncUsers = (usersInputs) => {
  // Fetch all user ids to identify which mutation should be used on the users input
  const existingUsersIds = users.map(u => u.id);

  const usersUpdated = [];
  const usersCreated = [];
  const deletedUsersIds = [];

  usersInputs.forEach(userInput => {
    if (existingUsersIds.includes(userInput.id)) {
      usersUpdated.push(updateUser(userInput));
    } else {
      usersCreated.push(createUser(userInput));
    }
  });

  const survivingUsersIds = [...usersCreated.map(user => user.id), ...usersUpdated.map(user => user.id)];
  const usersIdsToDelete = existingUsersIds.filter(exiUserId => !survivingUsersIds.includes(exiUserId));

  usersIdsToDelete.forEach(userId => {
    deletedUsersIds.push(deleteUser(userId))
  })


  return {
    usersCreated,
    usersUpdated,
    deletedUsersIds
  }
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

    updateUser: (parent, { user: userInput }, ctx) => {
      return updateUser(userInput);
    },

    createUser: (parent, { user: userInput }, ctx) => {
      return createUser(userInput);
    },

    deleteUser: (parent, { id }, ctx) => {
      return deleteUser(id)
    },

    syncUsers: (parent, { users: usersInputs }: any, ctx) => {
      return syncUsers(usersInputs);
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
