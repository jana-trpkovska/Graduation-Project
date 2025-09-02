import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './Chatbot.css';

import botAvatar from '../../assets/medical-robot.png';
import userAvatar from '../../assets/user.png';
import newMessageIcon from '../../assets/new-message.png';
import sendMessageIcon from '../../assets/send.png';
import sideBarIcon from '../../assets/sidebar.png';
import editIcon from '../../assets/edit.png';
import moreIcon from '../../assets/more.png';
import trashIcon from '../../assets/trash.png';

import drugService from '../../repository/Repository';

const Chatbot = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingChatId, setDeletingChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const hasInitializedPrefill = useRef(false);
    const prefillQuestion = location.state?.prefillQuestion || null;
    const [headerHeight, setHeaderHeight] = useState(0);

    const DEFAULT_GREETING = 'Hello! How can I help you today?';

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (prefillQuestion && !hasInitializedPrefill.current) {
            hasInitializedPrefill.current = true;

            (async () => {
                try {
                    const newChat = await drugService.createChat();
                    setChats(prev => [newChat, ...prev]);
                    setActiveChat(newChat);

                    const greetingMessage = {
                        id: `welcome-${Date.now()}`,
                        role: 'assistant',
                        content: DEFAULT_GREETING
                    };
                    setMessages([greetingMessage]);

                    await new Promise(resolve => setTimeout(resolve, 200));

                    sendPrefilledMessage(newChat.id, prefillQuestion);

                } catch (err) {
                    console.error("Failed to create chat for prefill question", err);
                }
            })();
        }
    }, [prefillQuestion]);

    useEffect(() => {
        const header = document.querySelector(".app-header");
        if (header) setHeaderHeight(header.offsetHeight);

        const handleResize = () => {
            if (header) setHeaderHeight(header.offsetHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sendPrefilledMessage = async (chatId, question) => {
        if (!chatId || !question) return;

        setInput('');
        setIsLoading(true);

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: question
        };
        setMessages(prev => [...prev, userMessage]);

        const typingIndicator = {
            id: `typing-${Date.now()}`,
            role: 'assistant',
            content: 'Typing...'
        };
        setMessages(prev => [...prev, typingIndicator]);

        try {
            const botMessage = await drugService.askQuestion(chatId, question);

            setMessages(prev =>
                prev.filter(msg => msg.id !== typingIndicator.id).concat(botMessage)
            );
        } catch (err) {
            console.error("Error sending prefill message:", err);
            setMessages(prev => prev.filter(msg => msg.id !== typingIndicator.id));
        } finally {
            setIsLoading(false);
        }
    };

    const loadChats = async () => {
        try {
            const data = await drugService.getChats();
            setChats(data);
        } catch (err) {
            console.error("Failed to load chats", err);
        }
    };

    const selectChat = async (chat) => {
        setActiveChat(chat);
        try {
            const msgs = await drugService.getChatMessages(chat.id);
            if (Array.isArray(msgs) && msgs.length > 0) {
                setMessages(msgs);
            } else {
                setMessages([
                    {
                        id: `welcome-${Date.now()}`,
                        role: 'assistant',
                        content: DEFAULT_GREETING
                    }
                ]);
            }
        } catch (err) {
            console.error("Failed to load messages", err);
            setMessages([
                {
                    id: `welcome-${Date.now()}`,
                    role: 'assistant',
                    content: DEFAULT_GREETING
                }
            ]);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeChat || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const typingIndicator = {
            id: `typing-${Date.now()}`,
            role: 'assistant',
            content: 'Typing...'
        };
        setMessages(prev => [...prev, typingIndicator]);

        try {
            const botMessage = await drugService.askQuestion(activeChat.id, input);

            setMessages(prev =>
                prev.filter(msg => msg.id !== typingIndicator.id).concat(botMessage)
            );
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages(prev => prev.filter(msg => msg.id !== typingIndicator.id));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (menuOpenFor === null) return;
        const handleClickAway = () => setMenuOpenFor(null);
        document.addEventListener('click', handleClickAway);
        return () => document.removeEventListener('click', handleClickAway);
    }, [menuOpenFor]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const openEditModal = (chatId, currentTitle) => {
        setEditingChatId(chatId);
        setEditTitleValue(currentTitle || '');
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setEditingChatId(null);
        setEditTitleValue('');
    };

    const saveEditedTitle = async () => {
        const trimmed = editTitleValue.trim();
        if (!trimmed || editingChatId == null) {
            closeEditModal();
            return;
        }

        try {
            const updatedChat = await drugService.updateChatTitle(editingChatId, trimmed);
            setChats((prev) =>
                prev.map((c) => (c.id === editingChatId ? updatedChat : c))
            );

            if (activeChat?.id === editingChatId) {
                setActiveChat(updatedChat);
            }
        } catch (err) {
            console.error("Failed to update chat title", err);
        } finally {
            closeEditModal();
        }
    };

    const openDeleteModal = (chatId) => {
        setDeletingChatId(chatId);
        setIsDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteOpen(false);
        setDeletingChatId(null);
    };

    const confirmDeleteChat = async () => {
        if (deletingChatId == null) {
            closeDeleteModal();
            return;
        }

        try {
            await drugService.deleteChat(deletingChatId);
            setChats((prev) => prev.filter((c) => c.id !== deletingChatId));

            if (activeChat?.id === deletingChatId) {
                setActiveChat(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Failed to delete chat", err);
        } finally {
            closeDeleteModal();
        }
    };

    const formatBotMessage = (text) => {
        if (!text) return null;

        const cleanedText = text
            .replace(/^\s*\d+\s*$/gm, '')
            .replace(/^\s*or\s*$/gim, '')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');


        const lines = cleanedText.split(/\n+/);
        const formattedElements = [];
        let listItems = [];

        const pushList = () => {
            if (listItems.length) {
                formattedElements.push(
                    <ul key={`list-${formattedElements.length}`} className="formatted-list">
                        {listItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                );
                listItems = [];
            }
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (/^[A-Za-z\s]+:$/.test(trimmed)) {
                pushList();
                formattedElements.push(
                    <h4 key={`h-${index}`} className="formatted-heading">
                        {trimmed.replace(':', '')}
                    </h4>
                );
                return;
            }

            if (/^\d+\./.test(trimmed) || trimmed.startsWith('-') || trimmed.startsWith('•')) {
                listItems.push(trimmed.replace(/^\d+\.\s*|^-+\s*|^•\s*/, ''));
            } else {
                pushList();
                formattedElements.push(
                    <p
                        key={`p-${index}`}
                        className="formatted-paragraph"
                        dangerouslySetInnerHTML={{ __html: highlightKeywords(trimmed) }}
                    />

                );
            }
        });

        pushList();
        return formattedElements;
    };

    const highlightKeywords = (text) => {
        const keywords = ['Side effects', 'Warnings', 'Important', 'Symptoms'];
        let formattedText = text;

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            formattedText = formattedText.replace(regex, '<strong>$1</strong>');
        });

        return formattedText;
    };

    return (
        <div className="chatbot-fullbleed" style={{ paddingTop: `${headerHeight}px` }}>
            <div className="chatbot-page">
                <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <img src={botAvatar} alt="Bot" className="avatar" />
                    </div>
                    <button
                        className="new-chat-btn"
                        onClick={async () => {
                            try {
                                const newChat = await drugService.createChat();
                                setChats(prev => [newChat, ...prev]);
                                selectChat(newChat);
                            } catch (err) {
                                console.error("Failed to create chat", err);
                            }
                        }}
                    >
                        <img src={newMessageIcon} alt="New message" className="icon" />
                        <span>New chat</span>
                    </button>
                    <div className="chats-label">Chats</div>
                    <div className="chat-list">
                        {chats.length === 0 ? (
                            <div className="no-chats-message">No saved chats.</div>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat.id}
                                    className={`chat-list-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                                    onClick={() => selectChat(chat)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            selectChat(chat);
                                        }
                                    }}
                                >
                                    <span className="chat-title">{chat.title}</span>
                                    <button
                                        className="chat-more-btn"
                                        aria-label="More actions"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpenFor(prev => prev === chat.id ? null : chat.id);
                                        }}
                                    >
                                        <img src={moreIcon} alt="More" />
                                    </button>

                                    {menuOpenFor === chat.id && (
                                        <div className="chat-actions-menu" onClick={(e) => e.stopPropagation()}>
                                            <button className="chat-action-item" type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpenFor(null);
                                                        openEditModal(chat.id, chat.title);
                                                    }}>
                                                <img src={editIcon} alt="Edit" className="chat-action-icon" />
                                                <span>Edit title</span>
                                            </button>
                                            <button className="chat-action-item delete" type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpenFor(null);
                                                        openDeleteModal(chat.id);
                                                    }}>
                                                <img src={trashIcon} alt="Delete" className="chat-action-icon" />
                                                <span>Delete chat</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                <main className={`chat-area ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        <img
                            src={sideBarIcon}
                            alt={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                        />
                    </button>
                    {activeChat ? (
                        <>
                            <div className="messages">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`message-row ${msg.role}`}>
                                        {msg.role === 'assistant' && (
                                            <img src={botAvatar} alt="Bot" className="message-avatar" />
                                        )}
                                        <div className={`message-bubble ${msg.role}-bubble ${msg.content === 'Typing...' ? 'typing' : ''}`}>
                                            {msg.content === 'Typing...' ? (
                                                <span className="typing-indicator">
                                                    <span></span><span></span><span></span>
                                                </span>
                                            ) : (
                                                msg.role === 'assistant'
                                                    ? formatBotMessage(msg.content)
                                                    : msg.content
                                            )}
                                        </div>
                                        {msg.role === 'user' && (
                                            <img src={userAvatar} alt="User" className="message-avatar" />
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="composer" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                                <input
                                    className="composer-input"
                                    placeholder={isLoading ? "Waiting for response..." : "Ask anything"}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                />
                                <button className="send-btn" type="submit" aria-label="Send" disabled={isLoading}>
                                    <img src={sendMessageIcon} alt="Send" className="send-icon" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-hero">
                                <div className="empty-hero-circle">
                                    <img src={botAvatar} alt="Bot" className="empty-avatar" />
                                </div>
                            </div>
                            <div className="empty-card">
                                <h2 className="empty-title">Welcome!</h2>
                                <p className="empty-subtitle">Open an existing chat or create a new one.</p>
                            </div>
                            <div className="empty-grid">
                                <div className="empty-tip">
                                    <div className="empty-tip-title">Check drug interactions</div>
                                    <div className="empty-tip-text">Ask how two medications may interact and what to watch for.</div>
                                </div>
                                <div className="empty-tip">
                                    <div className="empty-tip-title">Drug side effects</div>
                                    <div className="empty-tip-text">Explore common side effects on drugs.</div>
                                </div>
                                <div className="empty-tip">
                                    <div className="empty-tip-title">Safer alternatives</div>
                                    <div className="empty-tip-text">Find options that may be safer given a specific condition.</div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {isEditOpen && (
                <div className="edit-modal-overlay" onClick={closeEditModal}>
                    <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="edit-modal-title">Enter new title</h3>
                        <input
                            autoFocus
                            className="edit-modal-input"
                            placeholder="Title"
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveEditedTitle();
                                }
                            }}
                        />
                        <div className="edit-modal-actions">
                            <button className="edit-modal-cancel" type="button" onClick={closeEditModal}>Cancel</button>
                            <button className="edit-modal-save" type="button" onClick={saveEditedTitle}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteOpen && (
                <div className="edit-modal-overlay" onClick={closeDeleteModal}>
                    <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="edit-modal-title">Are you sure you want to delete this chat?</h3>
                        <div className="edit-modal-actions">
                            <button className="edit-modal-cancel" type="button" onClick={closeDeleteModal}>Cancel</button>
                            <button className="edit-modal-delete" type="button" onClick={confirmDeleteChat}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
