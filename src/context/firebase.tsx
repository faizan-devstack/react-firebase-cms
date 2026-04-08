import { createContext } from "react";

const FirebaseContext = createContext(null);

export const FirbaseProvider = (props: any) => {
    return (
        <FirebaseContext.Provider value={null}>
            {props.children}
        </FirebaseContext.Provider>
    )
}