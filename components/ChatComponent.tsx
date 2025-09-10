
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, UserRole, CandidateStatus, ChatParticipant, AppEvent } from '../types';
import * as dataService from '../services/dataService';
import Modal from './Modal';
import { UserCircleIcon, PaperAirplaneIcon, CogIcon, UsersIcon, LogoutIcon, TagIcon, CANDIDATE_STATUSES, getStatusColor, getStatusLabel, CheckCircleIcon, XCircleIcon, InformationCircleIcon, BellIcon, APP_TITLE } from '../constants';

interface ChatComponentProps {
  currentUser: User;
  onLogout: () => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ currentUser, onLogout }) => {
  const [chatPartners, setChatPartners] = useState<ChatParticipant[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<ChatParticipant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isGlobalCategorizeModalOpen, setIsGlobalCategorizeModalOpen] = useState(false);

  const [selectedStatusForModal, setSelectedStatusForModal] = useState<CandidateStatus>(CandidateStatus.NONE);
  const [bulkMessageText, setBulkMessageText] = useState('');
  const [bulkMessageCategory, setBulkMessageCategory] = useState<CandidateStatus>(CandidateStatus.SELECTED);
  
  const [globalCategoryToSet, setGlobalCategoryToSet] = useState<CandidateStatus>(CandidateStatus.SELECTED);
  const [selectedCandidateIdsForGlobalChange, setSelectedCandidateIdsForGlobalChange] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  const playNotificationSound = useCallback(() => {
    if (notificationAudioRef.current) {
      notificationAudioRef.current.play().catch(e => console.warn("Audio play failed:", e));
    }
  }, []);
  
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' }); 
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      });
    }
  }, []);

  const fetchChatPartners = useCallback(async () => {
    try {
      setError(null);
      if (currentUser.role === UserRole.RECRUITER) {
        const candidates = await dataService.getCandidatesForRecruiter(currentUser.id);
        const candidatesWithUnread = await Promise.all(candidates.map(async c => {
          const msgs = await dataService.getMessages(currentUser.id, c.id);
          const unreadCount = msgs.filter(m => m.receiverId === currentUser.id && m.senderId === c.id && (!document.hasFocus() || activeChatPartner?.id !== c.id)).length;
          return {...c, unreadCount};
        }));
        setChatPartners(candidatesWithUnread);
      } else if (currentUser.role === UserRole.CANDIDATE && currentUser.assignedRecruiterId) {
        const recruiter = await dataService.getUserById(currentUser.assignedRecruiterId);
        if (recruiter) {
          const msgs = await dataService.getMessages(currentUser.id, recruiter.id);
          const unreadCount = msgs.filter(m => m.receiverId === currentUser.id && m.senderId === recruiter.id && (!document.hasFocus() || activeChatPartner?.id !== recruiter.id)).length;
          const recruiterParticipant = { ...recruiter, unreadCount };
          setChatPartners([recruiterParticipant]);
           // Automatically select the recruiter if they are the only chat partner for a candidate
          if (chatPartners.length === 1 && !activeChatPartner) { // chatPartners here refers to the state variable
            setActiveChatPartner(recruiterParticipant);
          }
        } else {
           setError('Assigned recruiter not found.');
           setChatPartners([]); 
        }
      }
    } catch (err: any) { // Corrected: err was missing type
        setError(err.message || 'Failed to load chat partners.');
    }
  }, [currentUser, activeChatPartner, chatPartners.length]); // Added chatPartners.length to dependencies

  useEffect(() => {
    fetchChatPartners();
    if (typeof Audio !== "undefined") {
        notificationAudioRef.current = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(1e3).join("123"));
    }
  }, [fetchChatPartners]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      const isForCurrentUser = message.receiverId === currentUser.id;
      const isActiveChat = activeChatPartner && 
                           ((message.senderId === activeChatPartner.id && message.receiverId === currentUser.id) || 
                            (message.senderId === currentUser.id && message.receiverId === activeChatPartner.id));

      if (isActiveChat) {
        setMessages(prev => [...prev, message]);
      }
      
      if (isForCurrentUser) {
        setChatPartners(prevPartners => prevPartners.map(p => {
          if (p.id === message.senderId) {
            const newUnreadCount = (document.hasFocus() && isActiveChat) ? 0 : (p.unreadCount || 0) + 1;
            return {...p, unreadCount: newUnreadCount};
          }
          return p;
        }));

        if (!document.hasFocus() || !isActiveChat) {
          playNotificationSound();
          showBrowserNotification(`New message from ${message.senderName || 'Someone'}`, message.text);
          document.title = `(*) ${currentUser.username} - ${APP_TITLE}`;
        }
      }
    };

    const handleUserStatusUpdate = (updatedUser: User) => {
        setChatPartners(prev => prev.map(p => p.id === updatedUser.id ? {...p, ...updatedUser} : p));
        if (activeChatPartner && activeChatPartner.id === updatedUser.id) {
            setActiveChatPartner(prev => prev ? {...prev, ...updatedUser} : null);
        }
    };

    const unsubscribeMessage = dataService.eventBus.subscribe(AppEvent.NEW_MESSAGE, handleNewMessage);
    const unsubscribeUserUpdate = dataService.eventBus.subscribe(AppEvent.USER_STATUS_UPDATE, handleUserStatusUpdate);
    
    const onFocus = () => { 
        document.title = `${currentUser.username} - ${APP_TITLE}`; 
        if (activeChatPartner) {
            setChatPartners(prev => prev.map(p => p.id === activeChatPartner.id ? {...p, unreadCount: 0} : p));
        }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      unsubscribeMessage();
      unsubscribeUserUpdate();
      window.removeEventListener('focus', onFocus);
    };
  }, [activeChatPartner, currentUser, playNotificationSound, showBrowserNotification, currentUser.username]); // Added currentUser.username

  useEffect(() => {
    if (activeChatPartner) {
      setLoadingMessages(true);
      setError(null);
      dataService.getMessages(currentUser.id, activeChatPartner.id)
        .then(setMessages)
        .catch(err => setError(err.message || 'Failed to load messages.'))
        .finally(() => setLoadingMessages(false));
      
      setChatPartners(prev => prev.map(p => p.id === activeChatPartner.id ? {...p, unreadCount: 0} : p));
      document.title = `${currentUser.username} - ${APP_TITLE}`;
    } else {
      setMessages([]);
    }
  }, [activeChatPartner, currentUser.id, currentUser.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !activeChatPartner) return;
    setError(null);
    try {
      await dataService.sendMessage(currentUser.id, activeChatPartner.id, newMessageText);
      setNewMessageText('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    }
  };

  const handleSelectChatPartner = (partner: ChatParticipant) => {
    setActiveChatPartner(partner);
    setError(null); 
  };
  
  const handleUpdateIndividualStatus = async () => {
    if (!activeChatPartner || currentUser.role !== UserRole.RECRUITER) return;
    setError(null);
    try {
      await dataService.updateCandidateStatus(activeChatPartner.id, selectedStatusForModal, currentUser.id);
      setIsStatusModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleSendBulkMessage = async () => {
    if (!bulkMessageText.trim() || currentUser.role !== UserRole.RECRUITER) return;
    setError(null);
    try {
      await dataService.sendBulkMessage(currentUser.id, bulkMessageCategory, bulkMessageText);
      setBulkMessageText('');
      setIsBulkModalOpen(false);
      alert(`Bulk message sent to ${getStatusLabel(bulkMessageCategory)} candidates.`); 
    } catch (err: any) {
      setError(err.message || 'Failed to send bulk message.');
    }
  };

  const handleGlobalCandidateSelectionChange = (candidateId: string) => {
    setSelectedCandidateIdsForGlobalChange(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleConfirmGlobalCategorization = async () => {
    if (currentUser.role !== UserRole.RECRUITER || selectedCandidateIdsForGlobalChange.length === 0) return;
    setError(null);
    let successCount = 0;
    try {
      for (const candidateId of selectedCandidateIdsForGlobalChange) {
        await dataService.updateCandidateStatus(candidateId, globalCategoryToSet, currentUser.id);
        successCount++;
      }
      if (successCount > 0) {
        alert(`${successCount} candidate(s) have been updated to ${getStatusLabel(globalCategoryToSet)}.`);
      }
      setIsGlobalCategorizeModalOpen(false);
      setSelectedCandidateIdsForGlobalChange([]); 
    } catch (err: any) {
      setError(err.message || `Failed to update status for some candidates. ${successCount} updated successfully.`);
    }
  };
  
  const getStatusIconElement = (status?: CandidateStatus, className: string = "w-4 h-4") => {
    switch (status) {
        case CandidateStatus.SELECTED: return <CheckCircleIcon className={`${className} text-green-400`} />;
        case CandidateStatus.REJECTED: return <XCircleIcon className={`${className} text-red-400`} />;
        case CandidateStatus.INTERVIEWING: return <InformationCircleIcon className={`${className} text-yellow-400`} />;
        default: return null;
    }
  };

  return (
    <div className="flex h-screen antialiased text-slate-200 bg-slate-900">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        {/* Sidebar */}
        <div className="flex flex-col py-8 pl-6 pr-2 w-80 bg-slate-800 flex-shrink-0 shadow-lg"> {/* Increased width to 80 */}
          <div className="flex flex-row items-center justify-center h-12 w-full">
            <div className="flex items-center justify-center rounded-2xl text-sky-400 bg-sky-800/50 h-10 w-10">
              <BellIcon className="w-6 h-6" />
            </div>
            <div className="ml-2 font-bold text-2xl text-sky-400">{ APP_TITLE }</div>
          </div>
          <div className="flex flex-col items-center bg-slate-700/50 border border-slate-700 mt-4 w-full py-6 px-4 rounded-lg">
            <UserCircleIcon className="h-20 w-20 rounded-full text-sky-400" />
            <div className="text-sm font-semibold mt-2 text-slate-100">{currentUser.username}</div>
            <div className="text-xs text-slate-400">{currentUser.role}</div>
          </div>
          <div className="flex flex-col mt-8">
            <div className="flex flex-row items-center justify-between text-xs px-2"> {/* Added px-2 for alignment */}
              <span className="font-bold text-slate-300">
                {currentUser.role === UserRole.RECRUITER ? 'Candidates' : 'Recruiter'}
              </span>
              {currentUser.role === UserRole.RECRUITER && (
                <span className="flex items-center justify-center bg-slate-600 h-4 w-4 rounded-full text-slate-200">
                  {chatPartners.length}
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-1 mt-4 -mx-2 h-[calc(100vh-370px)] overflow-y-auto pr-2 custom-scrollbar"> {/* Adjusted height */}
              {chatPartners.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => handleSelectChatPartner(partner)}
                  className={`flex flex-row items-center hover:bg-slate-700/80 rounded-xl p-2.5 w-full text-left focus:outline-none transition-colors duration-150 ease-in-out ${activeChatPartner?.id === partner.id ? 'bg-sky-600 shadow-md' : 'hover:bg-slate-700'}`}
                  aria-label={`Chat with ${partner.username}`}
                >
                  <div className={`flex items-center justify-center h-9 w-9 ${activeChatPartner?.id === partner.id ? 'bg-sky-500' : 'bg-slate-600'} rounded-full text-white text-sm font-semibold flex-shrink-0`}>
                    {partner.username.substring(0,1).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-grow overflow-hidden">
                    <div className={`text-sm font-semibold truncate ${activeChatPartner?.id === partner.id ? 'text-white' : 'text-slate-100'}`}>{partner.username}</div>
                    {currentUser.role === UserRole.RECRUITER && partner.role === UserRole.CANDIDATE && partner.status && partner.status !== CandidateStatus.NONE && (
                      <span 
                        className={`mt-1 text-[11px] leading-tight px-1.5 py-0.5 rounded-full inline-block ${getStatusColor(partner.status)} ${activeChatPartner?.id === partner.id ? 'bg-opacity-100 text-white shadow-sm' : 'bg-opacity-70 text-slate-100'} font-medium`}
                        title={getStatusLabel(partner.status)}
                      >
                        {getStatusLabel(partner.status)}
                      </span>
                    )}
                  </div>
                  <div className="ml-2 flex flex-col items-end flex-shrink-0 space-y-1">
                    {partner.unreadCount && partner.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" aria-label={`${partner.unreadCount} unread messages`}>
                        {partner.unreadCount}
                      </span>
                    )}
                    {currentUser.role === UserRole.RECRUITER && partner.role === UserRole.CANDIDATE && partner.status && partner.status !== CandidateStatus.NONE && (
                       <span title={getStatusLabel(partner.status)} className={`${partner.unreadCount && partner.unreadCount > 0 ? '' : 'mt-auto mb-auto'}`}>
                        {getStatusIconElement(partner.status, `w-4 h-4 ${activeChatPartner?.id === partner.id ? 'text-sky-200' : getStatusColor(partner.status).replace('bg-', 'text-').replace('-500', '-400') }`)}
                       </span>
                    )}
                  </div>
                </button>
              ))}
              {chatPartners.length === 0 && currentUser.role === UserRole.RECRUITER && (
                <p className="text-slate-400 text-sm text-center py-4 px-2">No candidates assigned yet.</p>
              )}
               {chatPartners.length === 0 && currentUser.role === UserRole.CANDIDATE && !currentUser.assignedRecruiterId && (
                <p className="text-slate-400 text-sm text-center py-4 px-2">Waiting for recruiter assignment.</p>
              )}
               {chatPartners.length === 0 && currentUser.role === UserRole.CANDIDATE && currentUser.assignedRecruiterId && (
                <p className="text-slate-400 text-sm text-center py-4 px-2">Your assigned recruiter is not available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col flex-auto h-full p-6">
            <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-slate-800 shadow-xl h-full">
                {/* HEADER: Always shown for Recruiter, or if Candidate has activeChatPartner */}
                {(currentUser.role === UserRole.RECRUITER || (currentUser.role === UserRole.CANDIDATE && activeChatPartner)) && (
                <div className="flex items-center justify-between py-3 px-4 border-b-2 border-slate-700 h-16 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                    {activeChatPartner ? (
                        <>
                        <div className={`flex items-center justify-center h-10 w-10 ${getStatusColor(activeChatPartner.status)} rounded-full text-white text-lg font-semibold flex-shrink-0`}>
                            {activeChatPartner.username.substring(0,1).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-100">{activeChatPartner.username}</p>
                            {currentUser.role === UserRole.RECRUITER && activeChatPartner.role === UserRole.CANDIDATE && (
                                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getStatusColor(activeChatPartner.status)}`}>
                                    {getStatusLabel(activeChatPartner.status)}
                                </span>
                            )}
                            {currentUser.role === UserRole.CANDIDATE && activeChatPartner.role === UserRole.RECRUITER && (
                                <span className="text-xs text-slate-400">Your Recruiter</span>
                            )}
                        </div>
                        </>
                    ) : currentUser.role === UserRole.RECRUITER ? (
                        <div className="text-lg font-semibold text-slate-100">Conversations</div>
                    ) : null }
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {currentUser.role === UserRole.RECRUITER && activeChatPartner?.role === UserRole.CANDIDATE && (
                            <button 
                                onClick={() => { setSelectedStatusForModal(activeChatPartner.status || CandidateStatus.NONE); setIsStatusModalOpen(true); }}
                                className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                                title="Change Candidate Status" aria-label="Change current candidate's status">
                                <CogIcon className="w-6 h-6 text-slate-400 hover:text-sky-400" />
                            </button>
                        )}
                        {currentUser.role === UserRole.RECRUITER && (
                            <>
                                <button
                                    onClick={() => { setSelectedCandidateIdsForGlobalChange([]); setGlobalCategoryToSet(CandidateStatus.SELECTED); setIsGlobalCategorizeModalOpen(true); }}
                                    className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                                    title="Categorize Multiple Candidates" aria-label="Open global candidate categorization modal">
                                    <TagIcon className="w-6 h-6 text-slate-400 hover:text-sky-400" />
                                </button>
                                <button 
                                    onClick={() => setIsBulkModalOpen(true)}
                                    className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                                    title="Send Bulk Message" aria-label="Open bulk message modal">
                                    <UsersIcon className="w-6 h-6 text-slate-400 hover:text-sky-400" />
                                </button>
                            </>
                        )}
                        <button 
                            onClick={onLogout}
                            className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-slate-800 focus:ring-rose-500"
                            title="Logout" aria-label="Logout">
                            <LogoutIcon className="w-6 h-6 text-slate-400 hover:text-rose-400" />
                        </button>
                    </div>
                </div>
                )}

                {/* CONTENT: Messages or Placeholder */}
                <div className="flex-grow overflow-hidden"> {/* This div will handle the scroll internally */}
                {activeChatPartner ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                            {loadingMessages && <p className="col-span-12 text-center text-slate-400 py-4">Loading messages...</p>}
                            {!loadingMessages && error && <p className="col-span-12 text-center text-red-400 py-4" role="alert">{error}</p>}
                            {!loadingMessages && !error && messages.length === 0 && <p className="col-span-12 text-center text-slate-500 py-4">No messages yet. Start the conversation!</p>}
                            {!loadingMessages && !error && messages.map(msg => (
                            msg.senderId === currentUser.id ? (
                                <div key={msg.id} className="col-start-6 col-end-13 p-3 rounded-lg">
                                <div className="flex items-end justify-start flex-row-reverse"> {/* items-end for timestamp */}
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sky-600 text-white flex-shrink-0 font-semibold" aria-hidden="true">
                                    {currentUser.username.substring(0,1).toUpperCase()}
                                    </div>
                                    <div className="relative mr-3 text-sm bg-sky-700 py-2 px-4 shadow rounded-xl text-white">
                                    <div>{msg.text}</div>
                                    <div className="text-xs text-sky-200/80 pt-1 text-right" aria-label={`Sent at ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                </div>
                            ) : (
                                <div key={msg.id} className="col-start-1 col-end-8 p-3 rounded-lg">
                                <div className="flex flex-row items-end"> {/* items-end for timestamp */}
                                    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${getStatusColor(activeChatPartner?.status)} text-white flex-shrink-0 font-semibold`} aria-hidden="true">
                                    {activeChatPartner?.username.substring(0,1).toUpperCase()}
                                    </div>
                                    <div className="relative ml-3 text-sm bg-slate-700 py-2 px-4 shadow rounded-xl text-slate-100">
                                    <div>{msg.text}</div>
                                    <div className="text-xs text-slate-400 pt-1 text-left" aria-label={`Received at ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                </div>
                            )
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="flex-shrink-0 flex items-center h-16 bg-slate-800 border-t border-slate-700 w-full px-4">
                            <div className="flex-grow"> {/* Removed ml-4 */}
                                <input
                                type="text"
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                                placeholder="Type your message…"
                                aria-label="Message input"
                                className="flex w-full bg-slate-700 border border-slate-600 rounded-xl focus:outline-none focus:border-sky-500 pl-4 h-10 text-slate-100 placeholder-slate-400"
                                />
                            </div>
                            <div className="ml-4">
                                <button type="submit" disabled={!newMessageText.trim()} className="flex items-center justify-center bg-sky-600 hover:bg-sky-700 rounded-xl text-white px-4 py-2 flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-50" aria-label="Send message">
                                <span>Send</span>
                                <PaperAirplaneIcon className="w-4 h-4 ml-2 transform rotate-45" />
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
                        <UserCircleIcon className="w-24 h-24 mb-4 text-slate-600"/>
                        <p className="text-lg text-center">
                            {currentUser.role === UserRole.RECRUITER ? "Select a candidate to start chatting" : 
                            (chatPartners.length > 0 && currentUser.assignedRecruiterId ? "Select your recruiter to start the conversation." : 
                                (currentUser.assignedRecruiterId ? "Waiting for your assigned recruiter..." : "Waiting for recruiter assignment...")
                            )
                            }
                        </p>
                        {error && <p className="text-red-400 mt-2 text-sm" role="alert">{error}</p>}
                        {currentUser.role === UserRole.CANDIDATE && (
                            <div className="mt-6">
                                <button 
                                    onClick={onLogout}
                                    className="p-2 rounded-lg hover:bg-slate-700/80 transition-colors flex items-center text-sm bg-slate-700/50 text-slate-300 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-offset-slate-800 focus:ring-rose-500"
                                    title="Logout" aria-label="Logout for Candidate">
                                    <LogoutIcon className="w-5 h-5 mr-2" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
      </div>

      {/* Modal for Individual Candidate Status Update */}
      <Modal isOpen={isStatusModalOpen} onClose={() => {setIsStatusModalOpen(false); setError(null);}} title={`Update Status for ${activeChatPartner?.username || 'Candidate'}`}>
          <div className="space-y-4">
            <p className="text-slate-300">Select a new status:</p>
            <select 
                value={selectedStatusForModal} 
                onChange={e => setSelectedStatusForModal(e.target.value as CandidateStatus)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                aria-label="Select candidate status"
            >
                {CANDIDATE_STATUSES.map(status => (
                    <option key={status.value} value={status.value} className="bg-slate-700 text-slate-100">{status.label}</option>
                ))}
            </select>
          </div>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => {setIsStatusModalOpen(false); setError(null);}} className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-600 hover:bg-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500">Cancel</button>
            <button onClick={handleUpdateIndividualStatus} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500">Update Status</button>
          </div>
      </Modal>

      {/* Modal for Bulk Message */}
      <Modal isOpen={isBulkModalOpen} onClose={() => {setIsBulkModalOpen(false); setError(null);}} title="Send Bulk Message">
          <div className="space-y-4">
            <div>
                <label htmlFor="bulkCategory" className="block text-sm font-medium text-slate-300">Select Category:</label>
                <select 
                    id="bulkCategory"
                    value={bulkMessageCategory} 
                    onChange={e => setBulkMessageCategory(e.target.value as CandidateStatus)}
                    className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                    aria-label="Select category for bulk message"
                >
                    {CANDIDATE_STATUSES.filter(s => s.value !== CandidateStatus.NONE).map(status => (
                        <option key={status.value} value={status.value} className="bg-slate-700 text-slate-100">{status.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="bulkMessage" className="block text-sm font-medium text-slate-300">Message:</label>
                <textarea 
                    id="bulkMessage"
                    value={bulkMessageText} 
                    onChange={e => setBulkMessageText(e.target.value)}
                    rows={4}
                    className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
                    placeholder="Type your bulk message here..."
                    aria-label="Bulk message content"
                />
            </div>
          </div>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => {setIsBulkModalOpen(false); setError(null);}} className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-600 hover:bg-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500">Cancel</button>
            <button onClick={handleSendBulkMessage} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500">Send Bulk Message</button>
          </div>
      </Modal>

      {/* Modal for Global Candidate Categorization */}
      <Modal isOpen={isGlobalCategorizeModalOpen} onClose={() => {setIsGlobalCategorizeModalOpen(false); setError(null);}} title="Categorize Multiple Candidates">
        <div className="space-y-4">
            <div>
                <label htmlFor="globalCategory" className="block text-sm font-medium text-slate-300">Select Category to Apply:</label>
                <select
                    id="globalCategory"
                    value={globalCategoryToSet}
                    onChange={(e) => setGlobalCategoryToSet(e.target.value as CandidateStatus)}
                    className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
                    aria-label="Select category to apply to selected candidates"
                >
                    {CANDIDATE_STATUSES.filter(s => s.value !== CandidateStatus.NONE).map(status => (
                        <option key={status.value} value={status.value} className="bg-slate-700 text-slate-100">{status.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300">Select Candidates:</label>
                {chatPartners.filter(p => p.role === UserRole.CANDIDATE).length === 0 && <p className="text-slate-400 text-sm mt-1">No candidates available to categorize.</p>}
                <div className="mt-1 max-h-60 overflow-y-auto space-y-2 p-2 bg-slate-700/50 rounded-md border border-slate-600 custom-scrollbar">
                    {chatPartners.filter(p => p.role === UserRole.CANDIDATE).map(candidate => (
                        <label key={candidate.id} className="flex items-center space-x-3 p-2 hover:bg-slate-600/50 rounded-md cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-700"
                                checked={selectedCandidateIdsForGlobalChange.includes(candidate.id)}
                                onChange={() => handleGlobalCandidateSelectionChange(candidate.id)}
                                aria-labelledby={`candidate-name-${candidate.id}`}
                            />
                            <div className="flex items-center space-x-2">
                                <span id={`candidate-name-${candidate.id}`} className="text-slate-200">{candidate.username}</span>
                                {getStatusIconElement(candidate.status, "w-3.5 h-3.5")}
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => {setIsGlobalCategorizeModalOpen(false); setError(null);}} className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-600 hover:bg-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500">Cancel</button>
            <button 
                onClick={handleConfirmGlobalCategorization} 
                disabled={selectedCandidateIdsForGlobalChange.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-50"
            >
                Confirm Categorization
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default ChatComponent;
