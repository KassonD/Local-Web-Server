import { createContext, useState } from "react";
import { ALERT_MODES } from "../constants";
import { Alert } from "../components/Alert";
 
export const AlertContext = createContext();

export function AlertContextProvider({ children }) {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMode, setAlertMode] = useState(ALERT_MODES.NORMAL);
    const [alertText, setAlertText] = useState("alert");

    const sendAlert = (mode, text, delay = 5000) => {
        setAlertMode(mode);
        setAlertText(text);

        setShowAlert(true);
        setTimeout(() => setShowAlert(false), delay);
    }

    return (
        <AlertContext.Provider value={sendAlert}>
            {children}
            
            {showAlert && 
                <Alert mode={alertMode} text={alertText}></Alert>
            }
        </AlertContext.Provider>
    )
}