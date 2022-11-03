# HoyAdelantas Remix

## What's in the stack

- Express Server powered by [Remix](https://remix.run/docs/en/v1/pages/technical-explanation#server-framework)
- App deployment with [Docker](https://www.docker.com/)
- Email/Password Authentication with [cookie-based sessions](https://remix.run/docs/en/v1/api/remix#createcookiesessionstorage)
- Database ORM with [Prisma](https://prisma.io)
- Styling with [Tailwind](https://tailwindcss.com/)
- End-to-end testing with [Cypress](https://cypress.io)
- Local third party request mocking with [MSW](https://mswjs.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)

**TO DO:**

- Healthcheck endpoint for status monitoring
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments

## Development

- Install dependencies:

  ```sh
  npm install
  ```

- Ask a teammate for the `.env` file.

- Start the Postgres Database in [Docker](https://www.docker.com/get-started):

  ```sh
  npm run docker
  ```

  > **Note:** The npm script will complete while Docker sets up the container in the background. Ensure that Docker has finished and your container is running before proceeding.

- Initial setup:

  ```sh
  npm run setup
  ```

- Run the first build:

  ```sh
  npm run build
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `user@test.com`
- Password: `123123`

## Testing

We use `vitest` for lower level tests of utilities and individual components (Unit & Integration testing).

We use `cypress` for our End to End tests. A solid alternative would be to use `playwright`

### Unit Testing

- They should be placed in the same folder as their implementation. They are located inside the `app/services` directory, as of now, we are only testing the server functions.
- The naming should follow a convention of `{name}.test.ts`
- They should focus on testing only the logic of the function (e.g. asserting that inside certain conditions the function throws or return something that we expect...). If the function communicates with other service or the database, those external calls should be mocked.
- We should try to test all paths inside our functions.
- As they don't interact with the database, we can call them in parallel, making the process much faster.

If the test uses mocking, don't forget to clear it inside the `afterAll` hook.

```ts
afterAll(() => {
  vi.restoreAllMocks()
})
```

_**TO DO:** Add or link example of Unit Testing here._

### Integration Testing

- They should be placed in the `test` directory. There are multiple integration tests that we can add.
- The naming should follow a convention of `{name}.spec.ts`
- We should try to test only the happy paths of our functions here, because testing all paths would be too resource-expensive. If there is a valid reason, we can test alternative paths of our functions to make sure they work as they should, but we should rely on unit tests for this whenever possible.
- Inside `tests/routes`, we will add tests for the loaders and actions of our Remix routes.
- Inside `tests/sql`, we will add tests for any raw sql function that we use to interact with our database inside or outside the app. (e.g. datastudio).
- Inside `tests/services`, we will add tests for any function inside our service that we want to test without mocking the database. (e.g. Testing relationships)
- We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom)

If the test interact with the database, don't forget to reset it inside the `beforeEach` hook.

```ts
import { truncateDB } from 'test/helpers/truncateDB'

beforeEach(async () => {
  await truncateDB()
})
```

_**TO DO:** Add or link example of Integration Testing here._

### End to End Testing

- They should be placed in the `test/e2e` directory.
- The naming should follow a convention of `{name}.cy.ts` or `{name}.e2e.ts`
- To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Cypress client. Make sure the database is running in docker as described above.
- We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

We have a utility for testing authenticated features without having to go through the login flow:

```ts
cy.login()
// you are now logged in as a new user
```

We also have a utility to auto-delete the user at the end of your test. Just make sure to add this in each test file:

```ts
afterEach(() => {
  cy.cleanUp()
})
```

That way, we can keep your local db clean and keep your tests isolated from one another.

_**TO DO:** Add or link example of End to End Testing here._

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.

## Deployment

**TO DO:** Add deployment instructions here
