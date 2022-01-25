# <center>Appraisers</center>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Design and develop an application that respects the roles and functionality of the system, which collects feedback from everyone with whom a person works. Feedback should be given in an impersonal form, with the designation of strengths and weaknesses. 

Web application features:
- Preservation of previous data;
- Demonstration of growth points or failures in the form of tables, diagrams, diagrams. 

User functions: 
- Giving feedback;
- Receiving feedback.

### Built With

* [NodeJs (fastify)](https://www.fastify.io/)
* [Postgres](https://www.postgresql.org/)

<!-- GETTING STARTED -->
## Getting Started

Instructions for setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```bash
  npm install npm@latest -g 
  ```

### Installation

1. Clone the repo
   ```bash
   git clone https://github.comgit/appraisers/server.git
   ```
2. Install NPM packages
   ```bash
   npm install
   ```
3. Create .env.local like in .env.example

4. Start docker image
   ```bash
   docker-compose --env-file .env.local up
   ```
5. Launch of the project
   ```bash
   npm run serve
   ```
### Database


1. Stop docker image
   ```bash
   docker-compose --env-file .env.local down
   ```
2. Clear all docker images
   ```bash
   docker stop $(docker ps -aq)
   docker rm $(docker ps -aq)
   ```
### Server
- Create server in PG_ADMIN:

    - General: `name - appraisers_db`

    - Connection: 
       - host name - `postgres`
       - user name - `POSTGRES_USER`
       - password  - `POSTGRES_PASSWORD`

<!-- USAGE EXAMPLES -->
## Usage

- Address pgAdmin: `localhost:5050`
- Postman: `{host}/api/{entity_name}/{route}`
