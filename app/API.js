import GraphiQL from 'graphiql';
import { mockServer, MockList } from 'graphql-tools';
import { formatError } from 'graphql';
import casual from 'casual-browserify';

const shorthand = `
  type User {
    id: ID!
    name: String
    lists: [List]
  }

  type List {
    id: ID!
    name: String
    owner: User
    incomplete_count: Int
    tasks(completed: Boolean): [Task]
  }

  type Task {
    id: ID!
    text: String
    completed: Boolean
    list: List
  }

  type RootQuery {
    user(id: ID): User
    users(num: Int): [User]
  }

  schema {
    query: RootQuery
  }
`;

const query = `{
  user(id: 6) {
    id
    name
    lists {
      name
      completeTasks: tasks(completed: true) {
        completed
        text
      }
      incompleteTasks: tasks(completed: false) {
        completed
        text
      }
      anyTasks: tasks {
        completed
        text
      }
    }
  }
  users(num: 3){
    name
  }
}`;

const server = mockServer(shorthand, {
    RootQuery: () => ({
        // return a user whose id matches that of the request
        user: (o, { id }) => ({ id }),
        // return a list with num users in it
        users: (o, { num }) => new MockList(num),
    }),
    List: () => ({
        name: () => casual.title,
        // return a list with 2 - 6 tasks
        tasks: () => new MockList([2, 6], (o, { completed }) => ({ completed })),
    }),
    Task: () => ({ text: casual.sentence }),
    User: () => ({
        name: casual.full_name,
        lists: () => new MockList(3, (user) => ({ owner: user.id })),
    }),
});

function graphQLFetcher (graphQLParams) {
    let variables = {};
    try {
        variables = JSON.parse(graphQLParams.variables);
    } catch (e) {
        // do nothing
    }
    return server.query(
        graphQLParams.query,
        variables
    ).then((res) => {
        console.log(res);
        if (res.errors) {
            res.errors = res.errors.map(formatError)
        }
        return res;
    });
}

const API = {
    fetchLinks() {
        graphQLFetcher({
            query: query
        });
    }
};

export default API;
