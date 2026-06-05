import { useContext, useEffect, useRef, useState } from 'react';
import { BACKEND_URL, ALERT_MODES, SERVER_STATUS } from '../constants';
import { AlertContext } from '../context/AlertContext';

function Console({gameName, serverName, logs}) {
    const sendAlert = useContext(AlertContext);
    const consoleLogsRef = useRef(null);
    const consoleInputRef = useRef(null);

    const sendCommand = async (formData) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/games/${gameName}/servers/${serverName}/command`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok || res == null)
                throw new Error(data.message || res.status);

            // setTimeout(getLog, 100);
        }
        catch (err) {
            console.log("Error: ", err);
            sendAlert(ALERT_MODES.ERROR, err.message);
        }
    }

    const submitForm = (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);

        if (consoleInputRef.current) {
            consoleInputRef.current.value = "";
        }

        sendCommand(formData)
    }

    // useEffect(() => {
    //     if (serverStatus === SERVER_STATUS.ONLINE) {
    //         getLog();

    //         const interval = setInterval(() => {
    //             if (serverStatus === SERVER_STATUS.ONLINE)
    //                 getLog();
    //         }, 1000);
    //         return () => clearInterval(interval);
    //     }
    // }, [logs]);

    useEffect(() => {
        if (consoleLogsRef.current) {
            consoleLogsRef.current.scrollTop = consoleLogsRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="console">
            <div className="console-log" ref={consoleLogsRef}>
                {logs.map((log) => (
                    <div>{log}</div>
                ))}
            </div>
            <form onSubmit={submitForm}>
                <input name="command" className="console-input" placeholder="Enter a command" ref={consoleInputRef}></input>
            </form>
        </div>
    );
}

export default Console;