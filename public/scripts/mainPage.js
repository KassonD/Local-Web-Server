function buildServerList() {
    var table = document.getElementById("serverList");
    fetch('/json/serverData.json')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            for (i = 0; i < data.serverCount; i++)
            {
                var serverName = data.servers['server_' + i].name;
                var status = 'Offline';

                if (data.servers['server_' + i].active)
                    status = 'Online'
                
                var row = `
                    <tr>
                        <td>
                            <a href="/server.html">
                                <button class="serverButton" onclick="setServerIndex(${i})">${serverName}</button>
                            </a>
                        </td>
                        <td id="server1_status">${status}</td>
                    </tr>
                `;
                
                table.innerHTML += row;
            }
        });
}

function setServerIndex(serverIndex) {
    console.log("goofy goober", serverIndex);
    data = {index: serverIndex};
    fetch('/api/server-index', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)})
        .catch(error => console.error(error))
}