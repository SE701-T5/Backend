# UniForum Server

This is the backend server for the UniForum project developed using the [MERN stack](https://www.digitalocean.com/community/tutorials/getting-started-with-the-mern-stack).

To view the deployment of the server from this repository, visit: [https://uni-forum.herokuapp.com/](https://uni-forum.herokuapp.com/)

#### More Information

To view the UniForum frontend repository, visit: [SE701-T5/Frontend](https://github.com/SE701-T5/Frontend)

## Requirements

The following are required to run the application

>* MongoDB
>* Heroku

The following is required to be installed for running the application locally

>* Node.js

### Environment Variables

To run this application, environment variables are required to be set as GitHub repository Action Secrets, and as system variables when run locally.

#### Application

The following environment variable is required for running the application
```
PORT = <port>
```

#### Database

The following environment variables are required for connecting the application to a MongoDB account
```
DATABASE_USER = <database-username>
DATABASE_PW = <database-password>
DATABASE_NAME = <application-database-name>
DATABASE_TEST_NAME = <test-database-name>
```

It is recommended to use a different ```test-database-name``` for repository forks and local testing

#### Deployment

The following environment variables are required for deploying the application using a Heroku account
```
HEROKU_EMAIL = <heroku-email>
HEROKU_API_KEY = <heroku-api-key>
HEROKU_APP_NAME = <heroku-application-name>
```

## Local Development 

### Install

The following instruction can be used to install npm dependencies
```
npm install
```

### Test
The following instruction can be used to test the application
```
npm test
```

### Run

The following instruction can be used to run the application
```
npm start
```

The application should be running locally at ```http://localhost:<port>```

The following instruction can be used to run the application with automatic restarts for local changes
```
npm dev
```

### Deploy

The following instructions can be used to locally deploy the application to Heroku
```
heroku create <application-name>
git push heroku main
heroku open
```

## Contributing

To contribute to this project, refer to the instructions laid out in the [Contributing Guidelines](https://github.com/SE701-T5/Backend/blob/main/.github/CONTRIBUTING.md) and [Code of Conduct](https://github.com/SE701-T5/Backend/blob/main/.github/CODE_OF_CONDUCT.md) 

## Further Reading

* [Getting Started with Node.js](https://nodejs.org/en/docs/guides/getting-started-guide/)
* [Getting Started with MongoDB](https://www.mongodb.com/basics/get-started)
* [Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
