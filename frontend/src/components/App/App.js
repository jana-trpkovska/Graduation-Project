import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Header from '../Header/Header'
import ExploreDrugs from "../ExploreDrugs/ExploreDrugs";
import MyDrugs from "../MyDrugs/MyDrugs";
import Login from "../Login/Login";
import Chatbot from "../Chatbot/Chatbot";
import Home from "../Home/Home";
import SignUp from '../SignUp/SignUp'

function App() {
  return (
    <div className="App">
        <Router>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore-drugs" element={<ExploreDrugs />} />
                    <Route path="/my-drugs" element={<MyDrugs />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/sign-up" element={<SignUp />} />
                </Routes>
            </main>
        </Router>
    </div>
  );
}

export default App;
