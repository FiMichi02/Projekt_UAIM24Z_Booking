import { BrowserRouter as DefaultRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login'
import Toolbar from "./components/Toolbar";
import './App.css'
import SignIn from "./components/SignIn";
import BookForm from "./components/BookForm";
import {AuthProvider} from "./components/AuthContext";
import Profile from "./components/Profile";

function App({ Router = DefaultRouter }) {
  return (
      <AuthProvider>
          <Router>
            <div className="App">
                <Toolbar></Toolbar>
                <Routes>
                    <Route path="/*" element={<Home />}/>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/new-booking" element={<BookForm />}/>
                    <Route path="/profile" element={<Profile/>}/>
                </Routes>
            </div>
          </Router>
      </AuthProvider>
  );
}

export default App;
