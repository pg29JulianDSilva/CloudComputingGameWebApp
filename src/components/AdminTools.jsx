import { useState, useEffect } from "react";
import { collection, query, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

import PLOT_PY from './../Data/plot.py?raw';


let pyodideReady = null;
let DATA_LIMIT = 10;

function getPyodide() {
    if (!pyodideReady) {
        pyodideReady = (async () => {
            const pyodide = await globalThis.loadPyodide();
            await pyodide.loadPackage(['matplotlib']);
            return pyodide;
        })();
    }
    return pyodideReady;
}
export default function AdminTools({ user }) {
    const [status, setStatus] = useState('Idle');
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //here the query absrobs the rules, shown as processes
        const q = query(collection(db, "users"), limit(DATA_LIMIT));

        //This one is a trigger when someone updates the database, which it can bind with it
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id, ...doc.data(),
            }));

            setLeaders(data);
            setLoading(false);
        });

        return () => unsubscribe();

    }, []);

    useEffect(() => {
        const runPythonCode = async () => {
            try {
                setStatus('Re-organizing the data');
                const pyodide = await getPyodide();

                let actualData = [];

                leaders.map(p => actualData.push({ playerName: p.displayName, score: p.highScore, duration: 10 }));

                window.__pyodideData = JSON.stringify(actualData);


                setStatus('Running Python :(');
                await pyodide.runPythonAsync(PLOT_PY);

                setStatus('Done');
            } catch (err) {
                console.error('Error, ', err);
                setStatus('Error, check console');
            }
        };

        runPythonCode();
    }, [leaders]);


    //YES, IS THE SAME LOADING THAT THE LEADERBOARD; BUT BECAUSE IT HAS THE SAME PURPOSE, IT IS THE SAME STYLE
    if (loading) {
        return (
            <div className="leaderboard-card">
                <h2 className="card-title">Reaching the players data</h2>
                <div className="card-loading">
                    <div className="spinner" />
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', alignItems: 'center' }}>
            <h2 className="card-title">On Game Data</h2>
            <p className="stat-label">{status}</p>
            <div id="pyodide-target"></div>
        </div>
    )
}