import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';

const CONTEXT_ROOT = "http://localhost:8888"

const getOptions = () => {
    return {
        headers: {
            "authorization": `Bearer ${window.localStorage.getItem("gremlin-token")}`
        }
    }
}

const EscapeRoomDashboard = (props) => {
    const [puzzles, setPuzzles] = useState([]);
    useEffect(async () => {
        try {
            let res = await axios.get(`${CONTEXT_ROOT}/puzzles`, getOptions());
            setPuzzles(res.data);
        } catch (error) {
            toast("Unable to retrieve puzzles", {type: "error"});
        }
    }, []);

    return (
        <div className="container-fluid">
            <h1>Dashboard</h1>
            <hr />
            <div>
                <h3>Escape Room Status</h3>
                <div>Stopped</div>
            </div>
            <hr />
            <div>
                <h3>Escape Room Controls</h3>
                <button>Start Escape Room</button>
                <button>Reset Escape Room</button>
                <button>Stop Escape Room</button>
            </div>
            <hr />
            <div>
                <h3>Puzzle Controls</h3>
                { Object.keys(puzzles).map((key, index) => {
                    let puzzle = puzzles[key];

                    if (key === "_start") {
                        return;
                    }

                    return (
                        <div key={`puzzle-${key}-${index}`} className="row">
                            <div className="col-4">
                                {puzzle.name}
                            </div>
                            <div className="col-2">
                                {!puzzle.lastPinged || Date.now() - puzzle.lastPinged > 10 * 1000 ? 
                                <span style={{color: "red"}}>Down</span> : 
                                <span style={{color: "green"}}>Up</span>}
                            </div>
                            <div className="col">
                                <button>Reset</button>
                                <button>Activate</button>
                                <button>Solve</button>
                            </div>
                        </div>
                    )
                })}
            </div>
            <hr />
        </div>
    )
};

export default EscapeRoomDashboard;