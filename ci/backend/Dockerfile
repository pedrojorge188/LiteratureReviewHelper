FROM maven:3.9-eclipse-temurin-23

WORKDIR /app

COPY src/backend/pom.xml .

RUN mvn dependency:go-offline -B

COPY src/backend/src ./src
