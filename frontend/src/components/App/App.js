import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Header from '../Header/Header'
import ExploreDrugs from "../ExploreDrugs/ExploreDrugs";
import MyDrugs from "../MyDrugs/MyDrugs";
import Login from "../Login/Login";
import Chatbot from "../Chatbot/Chatbot";
import Home from "../Home/Home";
import SignUp from '../SignUp/SignUp'
import DrugDetails from "../DrugDetails/DrugDetails";
import PrivateRoute from "../PrivateRoute/PrivateRoute";

function App() {

  return (
    <div className="App">
        <Router>
            <Header />
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/explore-drugs" element={<ExploreDrugs />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route path="/drugs/:id" element={<DrugDetails />} />

                    {/* Private Routes */}
                    <Route
                        path="/my-drugs"
                        element={
                            <PrivateRoute>
                                <MyDrugs />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/chatbot"
                        element={
                            <PrivateRoute>
                                <Chatbot />
                            </PrivateRoute>
                        }
                    />

                </Routes>
            </main>
        </Router>
    </div>
  );
}

export default App;
