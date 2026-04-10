import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import LoginForm from "./components/LoginForm";
import GamePortal from "./components/GamePortal";

 async function createUserProfileIfNedded(firebaseUser) {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists) {
        await setDoc(userRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "Player",
            photoURL: serverTimestamp(),
            highscore: 0,
            gamePlayed: 0
        })

        console.log(`User ${firebaseUser.email} created.`);

    }
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsusbscribe = onAuthStateChanged(auth, async (firebaseUser) => { //connects with authState
            if (firebaseUser) {
                await createUserProfileIfNedded(firebaseUser); //if the player can login
                setUser(firebaseUser);
            } else {
                setUser(null); //No loggin
            }
            setLoading(false);
        });

        return () => unsusbscribe(); // returned when it is onMounted
    }, []);

    if (loading) {
        return (
            <div>
                <p>Checking_auth_state...</p>
            </div>
        )
    }

    return (
        <div className="app">
            {user ? <GamePortal user={user} /> : <LoginForm /> }
            {/*<LoginForm />  This is basically all the login componenet. Which in Firebase it should allow at least 300.000 dalily active users*/ }
        </div>
    )

}



