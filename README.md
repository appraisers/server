Start:

npm run serve
 
Database: 

start docker image: docker-compose --env-file .env.local up  
stop docker image: docker-compose --env-file .env.local down
clear all docker images: 
- docker stop $(docker ps -aq)
- docker rm $(docker ps -aq)

address pgAdmin: localhost:5050 

Create server in PG_ADMIN: 
    general: name - postgres
    connection: host name - postgres
                user name - POSTGRES_USER
                password  - POSTGRES_PASSWORD

postman: {host}/api/{entity_name}/{route}