import { useState, useEffect, useRef } from "react";
import {
    GoogleAuthProvider
} from "firebase/auth";

import {  db } from "../firebase";
import { doc, onSnapshot } from 'firebase/firestore';


export default function UserInfo({ user })
{

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.data())
            }
        });

        return () => unsubscribe();
    }, [user.uid]);

    return (
        <div className="ProfileUp">
            <h3>{user.email}</h3>
            <h2>Logged In</h2>
        </div>
    )
}
