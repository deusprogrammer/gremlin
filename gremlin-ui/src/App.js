import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';

import Home from './routes/Home';
import Login from './routes/Login';
import EscapeRoomDashboard from './routes/EscapeRoomDashboard';
import ManageUsers from './routes/ManageUsers';
import ManagePuzzles from './routes/ManagePuzzles';

function App() {
    return (
        <div className="App">
            <ToastContainer />
            <Router>
                <Switch>
                    <Route exact path={`${process.env.PUBLIC_URL}/`} component={EscapeRoomDashboard} />
                    <Route exact path={`${process.env.PUBLIC_URL}/login`} component={Login} />
                    <Route exact path={`${process.env.PUBLIC_URL}/dashboard`} component={EscapeRoomDashboard} />
                    <Route exact path={`${process.env.PUBLIC_URL}/manage/users`} component={ManageUsers} />
                    <Route exact path={`${process.env.PUBLIC_URL}/manage/puzzles`} component={ManagePuzzles} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
