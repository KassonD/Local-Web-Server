## Instructions
1. Install **Git**
    - Windows:
        - Go to **https://github.com/git-guides/install-git**
    - Linux/Mac:
        ```bash
        sudo apt update && sudo apt install git -y
        ```
2. Install **Docker**
    - Windows:
        - Go to **https://docs.docker.com/desktop/setup/install/windows-install/**
    - Linux/Mac:
        ```bash
        curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER && newgrp docker
        ```

3. Clone the repositroy
    ```bash
    git clone https://github.com/KassonD/Local-Web-Server.git
    ```

4. Navigate to the root directory **LOCAL-WEB-SERVER**
    ```bash
    cd Local-Web-Server
    ```
    - For Linux/Mac, you also need to run this command to allow the execution of the setup script:
        ```bash
        chmod +x setup.sh
        ``` 

5. Run the setup file
    - Windows:
        ```bash
        setup.bat
        ``` 
    - Linux/Mac:
        ```bash
        ./setup.sh
        ``` 
        or
        ```bash
        sudo ./setup.sh
        ``` 
    - If the setup was unsuccessful, stop all the Docker containers, delete all Docker images and containers, then run the script again (see **Useful Commands**)

6. Acces the website from another device at **"http://{HOST_DEVICE_IP}:3000"**

## Useful Commands
- Stop all docker containers: 
    - Windows:
        ```bash
        powershell "docker stop $(docker ps -q)"
        ```
    - Linux/Mac:
        ```bash
        docker stop $(docker ps -q)
        ```
- Delete all docker images and containers:
    ```bash
    docker system prune --all --volumes
    ```
- Delete directories on Linux/Mac:
    ```bash
    rm -rf <DIRECTORY_NAME>
    ```
    or
    ```bash
    sudo rm -rf <DIRECTORY_NAME>
    ```