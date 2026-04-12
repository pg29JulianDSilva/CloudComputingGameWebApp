import { useState, useEffect, useRef, useCallback } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot, collection, } from 'firebase/firestore';


import Leaderboard from "./LeaderBoard";
import UserInfo from "./UserInfo";

const GAME_URL = import.meta.env.VITE_GAME_URL || null;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";

export default function GamePortal({user}) {

    const iframeRef = useRef(null);
    const retryTimer = useRef(null);
    const authAckowledged = useRef(null);

    const [userData, setUserData] = useState(null);
    const [gameLoaded, setGameLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState("game");
    const [userAdmin, setUserAdmin] = useState(false);

    useEffect(() => {
        const userRef = doc(db, "users", user.uid);
        const whitelistRef = doc(db, "whitelist/Admin_spencer");
        
        const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.data())
            }
        });

        const unsubscribeAdmin = onSnapshot(whitelistRef, (snapshot) => {
            if (snapshot.exists()) {
                const adminData = snapshot.data();

                const isAdmin = adminData.email == user.email;

                setUserAdmin(isAdmin);
            }
        });



        return () => {
            unsubscribeUser()
            unsubscribeAdmin();
        };
    }, [user.uid, user.email]);

    const sendAuthToGame = useCallback(async () => {
        if (!iframeRef.current?.contentWindow || !user || authAckowledged.current) return;

        try {
            const idToken = await user.getIdToken();
            const payload = {
                type: "firebase-auth",
                uid: user.uid,
                displayName: user.displayName || user.email || "Player",
                idToken,
                projectId: FIREBASE_PROJECT_ID,
            };
            iframeRef.current.contentWindow.postMessage(payload, "*");
            console.log("Auth token sent to iframe... waitinbg for ack");
        } catch (err) {
            console.error("Failed to send auth...", err);
        }
    }, [user]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === "firebase-auth-ack") {
                console.log("Game acknowledgement succesful");
                authAckowledged.current = true;
                if (retryTimer.current) {
                    clearInterval(retryTimer.current);
                    retryTimer.current = null;
                }
            };

            window.addEventListener("message", handleMessage);
            return () => window.removeEventListener("message", handleMessage);
        }
    }, []);


    const handleGameLoaded = useCallback(() => {
        setGameLoaded(true);
        authAckowledged.current = false;
        sendAuthToGame();

        retryTimer.current = setInterval(sendAuthToGame, 2000);

        setTimeout(() => {
            if (retryTimer.current) {
                clearInterval(retryTimer.current);
                retryTimer.current = null;
                if (!authAckowledged.current) {
                    console.warn("Game never acknowledge auth after 30s. Did you put the FirebaseManager in the scene?");
                }
            }
        }, /*30000*/) //Disabled for the cloud computing part only
    }, [sendAuthToGame])

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.log("Sign out error", err);
        }
    }

    return (
        <div className="portal-container">
            <div className="tab-bar">
                <button className={activeTab === "game" ? "tab active" : "tab"} onClick={() => { setActiveTab("game") }} /*disabled={gameLoaded}*/>Game</button> {/*TODO: add the gameloaded when the game works*/}
                <button className={activeTab === "leaderboard" ? "tab active" : "tab"} onClick={() => { setActiveTab("leaderboard") }} /*disabled={gameLoaded}*/>Leaderboard</button>
                <button className={activeTab === "admin" ? "tab active" : "tab"} onClick={() => { setActiveTab("admin") }} disabled={!userAdmin}>⚙️</button>
            </div>
            {activeTab === "game" ?
                <div className="game-area">
                <UserInfo user={user} />
                    <iframe
                        ref={iframeRef}
                        src={GAME_URL}
                        title="Sponder Bird"
                        className={`game-frame ${gameLoaded ? "visible" : "hidden"}`}
                        allow="fullscreen"
                        onLoad={handleGameLoaded}
                    />
                </div> : <></>}
            {activeTab === "leaderboard" ?
                <div className="portal-content">
                    <Leaderboard />
                </div> : <></>}
            <button onClick={handleSignOut} className="btn-signout">sign out</button>
        </div>
    )
}