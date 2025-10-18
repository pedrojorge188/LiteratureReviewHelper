FROM maven:3.9-eclipse-temurin-23

WORKDIR /app

COPY src/backend/pom.xml .

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

COPY src/backend/src ./src


RUN mvn clean package -DskipTests -B
