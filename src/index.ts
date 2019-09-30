import { GraphQLServer, PubSub } from 'graphql-yoga';
import { formatError } from 'apollo-errors';
import * as faker from 'faker/locale/en';
import * as compression from 'compression';

import resolvers from './resolvers';
import defaultPlaygroundQuery from './initQuery'


const pubsub = new PubSub();
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    faker,
    pubsub
  })
});

server.express.disable('x-powered-by');


server.express.use(compression());

const options = {
  formatError,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/',
  defaultPlaygroundQuery
};

server.start(options, ({ port }) =>
  console.log(`Server is running on PORT: ${port}`)
);
