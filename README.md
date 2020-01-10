# FakerQL

FakerQL was created for frontend developers and GraphQL powered apps. Whether you're getting started with a new project or learning Relay/Apollo, you can forget about building a custom server and rely on [Faker.js](https://github.com/marak/Faker.js) to provide some goodies!

## Give it a try

You can head over to [GraphiQL](https://fakerql.com) to send some example queries and mutations.

## Queries

#### Get a list of users

You can request a list of users. `count` is optional and defaults to 25.

```graphql
# allUsers(count: Int)

{
  allUsers(count: 5) {
    id
    firstName
    lastName
    email
    avatar
  }
}
```

#### Get a User

You can request a single User by providing any ID.

```graphql
# User(id: String!)

{
  allUsers(id: "wk0z1j1tzj7xc0116is3ckdrx") {
    id
    firstName
    lastName
    email
    avatar
  }
}


```
## Mutations


#### creating user

mutation createUser{
  createUser(user:{
    id:"12"
    firstName:"aa"
    lastName:"bb"
  }){
    id
    firstName
    lastName
  }
}

#### Updating user

Tmutation updateUser{
  updateUser(user:{
    id:"12"
    firstName:"cc"
  }){
    id
    firstName
    lastName
  }
}


#### deleting user


mutation deleteUser{
  deleteUser(id:"12")
}

## syncing users

mutation syncUsers{
  syncUsers(users:[{
    id:"12"
    firstName:"dd"
  },{
    id:"13",
    firstName:"new"
    lastName:"aaa"
  }]){
    usersCreated{
      id
      firstName
      lastName
    }
    usersUpdated{
      id
      firstName
      lastName
    }
    deletedUsersIds
  }
}
```