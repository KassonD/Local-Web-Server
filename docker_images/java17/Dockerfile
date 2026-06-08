FROM eclipse-temurin:17-jre

RUN apt-get update && \
    apt-get install -y bash haveged && \
    apt-get clean

ENV JAVA_TOOL_OPTIONS="-Djava.security.egd=file:/dev/urandom"
    
WORKDIR /server

CMD [ "bash"]