const tabs = document.querySelectorAll('[data-tab-target]')
const tabContents = document.querySelectorAll('[data-tab-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active')
        })
        tabs.forEach(tab => {
            tab.classList.remove('active')
        })
        tab.classList.add('active')
        document.querySelector(tab.dataset.tabTarget).classList.add('active')
    })
})

function startServer() {
    fetch('/start', {method: 'POST'})
        .catch(error => console.error(error))

    document.getElementById('button_start').disabled = true
    document.getElementById('button_stop').disabled = false
    document.getElementById('output').innerHTML = "Starting..."
}

function stopServer() {
    fetch('/stop', {method: 'POST'})
        .catch(error => console.error(error))

    document.getElementById('button_start').disabled = false
    document.getElementById('button_stop').disabled = true
    document.getElementById('output').innerHTML = "Stopping..."
}

function enableServerButtons() {
    console.log('serverProcessgffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    // if (serverProcess == null) {
    //     document.getElementById('button_start').disabled = true
    // }
    // else {
    //     document.getElementById('button_stop').disabled = true
    // }
}