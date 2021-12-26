Start:

npm run serve
 
Database: 

start docker image: docker-compose --env-file .env.local up  
stop docker image: docker-compose --env-file .env.local down
address pgAdmin: localhost:5050 

Create server in PG_ADMIN: 
    general: name(postgres)
    connection: host name - any
                user name - POSTGRES_USER
                password  - POSTGRES_PASSWORD

