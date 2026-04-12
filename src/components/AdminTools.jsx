import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from 'firebase/firestore';


import Leaderboard from "./LeaderBoard";
import UserInfo from "./UserInfo";

export default function AdminTools({ user }) {
    const checkRole = async(() => {
         
    });
}

    return (
        <div>
            <h3>If you are reading this, you're are an admin</h3>
        </div>
    )
}