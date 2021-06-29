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

const ManageUsers = (props) => {
    const [users, setUsers] = useState([]);
    useEffect(async () => {
        try {
            let res = await axios.get(`${CONTEXT_ROOT}/users`, getOptions());
            setUsers(res.data);
        } catch (error) {
            toast("Unable to retrieve puzzles", {type: "error"});
        }
    }, []);

    return (
        <div>
            <h1>User Management</h1>
            <div>
                <h3>User Controls</h3>
                <button>Create User</button>
            </div>
            <h3>Users</h3>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Roles</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
                        return (
                            <tr>
                                <td>
                                    {user.username}
                                </td>
                                <td>
                                    {user.roles}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
};

export default ManageUsers;