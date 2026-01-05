# The Old Rabbit Post

## Intro

The idea for this codebase emerged from a story in this Substack article: https://dejanz.substack.com/p/the-medieval-post-office-that-delivered. The article tells a short, humorous story about a man building a post office in medieval times. A post office that delivered every letter (even during plagues) 🐇

Here is a preview of what this code produces:

[screen-capture.webm](https://github.com/user-attachments/assets/31681047-4d60-4a1a-a251-b4f1269665a3)

## Setup

- Run `docker compose up --build`
- After all services are up, go to http://localhost:8081 in your browser

### Project structure

This project consists of a couple of smaller projects:

- **ottos-stand-service**: A Node.js Express API. It has an endpoint that stores email events (status: NEW) in the database. It also has an endpoint to fetch all email events from the database.
- **carlos-background-service**: A NodeJS console app, a cron job that takes email events with status: NEW from the database, every 5 seconds, and dispatches them to the queue (RabbitMQ)
- **postman-service**: Docker compose builds five **postman** services, which act as queue consumers (or workers). They process the messages and succeed with a 70% chance. If processing fails, the message is requeued; if the max retries are reached, the message goes to the dead letter queue. An endpoint in _ottos-stand-service_ can flush those messages back to the original queue.
- **init-scripts**: script that builds the required PostgreSQL objects
- **old-rabbit-post-ui**: UI project in Pixi.js. It is a facade for the above-mentioned backend services.

Docker-compose defines two additional services:

- **postgres_db**: shared PostgreSQL database
- **rabbitmq**: shared RabbitMQ instance
