import React, { useState } from 'react';
import './Chatbot.css'

import botAvatar from '../../assets/medical-robot.png';
import userAvatar from '../../assets/user.png';
import newMessageIcon from '../../assets/new-message.png';
import sendMessageIcon from '../../assets/send.png';
import sideBarIcon from '../../assets/sidebar.png';

const Chatbot = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="chatbot-fullbleed">
            <div className="chatbot-page">
                <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <img src={botAvatar} alt="Bot" className="avatar" />
                    </div>
                    <button className="new-chat-btn">
                        <img src={newMessageIcon} alt="New message" className="icon" />
                        <span>New chat</span>
                    </button>
                    <div className="chats-label">Chats</div>
                    <div className="chat-list">
                        <button className="chat-list-item">RAG System for meds</button>
                        <button className="chat-list-item">RAG System for meds</button>
                        <button className="chat-list-item">RAG System for meds</button>
                    </div>
                </aside>

                <main className={`chat-area ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        <img 
                            src={sideBarIcon} 
                            alt={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                        />
                    </button>
                    <div className="messages">
                        <div className="message-row bot">
                            <img src={botAvatar} alt="Bot" className="message-avatar" />
                            <div className="message-bubble bot-bubble">Hello! How can i help you today?</div>
                        </div>
                        <div className="message-row user">
                            <div className="spacer" />
                            <div className="message-bubble user-bubble">What is Abecma?</div>
                            <img src={userAvatar} alt="User" className="message-avatar" />
                        </div>
                    </div>
                    <form className="composer" onSubmit={(e) => e.preventDefault()}>
                        <input className="composer-input" placeholder="Ask anything" />
                        <button className="send-btn" type="submit" aria-label="Send">
                            <img src={sendMessageIcon} alt="Send" className="send-icon" />
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Chatbot;