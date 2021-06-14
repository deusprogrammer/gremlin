import React, {useState, useEffect} from 'react';
import axios from 'axios';

import {toast} from 'react-toastify';

import {useHistory} from 'react-router';

const CONTEXT_ROOT = "http://localhost:8888"

const Login = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const history = useHistory();

    const loginUser = async () => {
        try {
            let result = await axios.post(`${CONTEXT_ROOT}/users/auth`, {
                username,
                password
            });

            window.localStorage.setItem("gremlin-token", result.data.token);
            toast("Login success!  Now redirecting to dashboard!", {type: "info"});
            window.setTimeout(() => {
                history.push(`${process.env.PUBLIC_URL}/dashboard`);
            }, 1000);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                toast("Invalid username or password", {type: "error"});
                return;
            } else if (error.response && error.response.status === 404) {
                toast("Gremlin server seems to be down", {type: "error"});
                return;
            }

            toast("Unexpected error occurred, please try again or contact manager", {type: "error"});
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <div className="container-fluid">
                <div className="row">
                        <input 
                            type="text" 
                            onChange={(e) => {setUsername(e.target.value)}} 
                            value={username} 
                            placeholder="Username" />
                </div>
                <div className="row">
                        <input 
                            type="password" 
                            onChange={(e) => {setPassword(e.target.value)}} 
                            value={password} 
                            placeholder="Password" />
                </div>
                <div className="row">
                        <button 
                            className="btn-primary" 
                            onClick={() => {loginUser()}}>
                                Login
                        </button>
                </div>
            </div>
        </div>
    )
}

export default Login;