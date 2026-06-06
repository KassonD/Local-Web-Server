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
        curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER && newgrp
        ```

3. Clone the repositroy
    ```bash
    git clone https://github.com/KassonD/Local-Web-Server.git
    ```

4. Navigate to the root directory **LOCAL-WEB-SERVER**
    ```bash
    cd Local-Web-Server
    ```
    - For Linux/Mac, you also need to run `chmod +x setup.h` so you can run the setup script

4. Navigate to the root directory **LOCAL-WEB-SERVER**

5. Run the setup file
    - Windows: `setup.bat`
    - Linux/Mac: `./setup.sh`

6. Acces the website from another device at **"http://{HOST_DEVICE_IP}:3000"**

## Useful Commands
- Stop all docker containers: 
    - Windows: `powershell "docker stop $(docker ps -q)"`
    - Linux/Mac: `docker stop $(docker ps -q)`
- Delete all docker images and containers: `docker system prune --all --volumes`