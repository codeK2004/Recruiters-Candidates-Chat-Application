
import { User, Message, UserRole, CandidateStatus, AppEvent, EventCallback, EventListener } from '../types';

// In-memory store (simulating a database)
// Initialize with an empty array if no users are in localStorage. No default users.
let users: User[] = JSON.parse(localStorage.getItem('chat_users') || '[]');
let messages: Record<string, Message[]> = JSON.parse(localStorage.getItem('chat_messages') || '{}');

// Simple Event Bus
const eventListeners: EventListener[] = [];

const generateId = (): string => Math.random().toString(36).substr(2, 9);

const subscribe = (event: AppEvent, callback: EventCallback): (() => void) => {
  const id = generateId();
  eventListeners.push({ id, event, callback });
  return () => {
    const index = eventListeners.findIndex(listener => listener.id === id);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
  };
};

const publish = (event: AppEvent, data?: any): void => {
  eventListeners.filter(listener => listener.event === event).forEach(listener => listener.callback(data));
};


// --- User Management ---
export const registerUser = async (userData: Omit<User, 'id' | 'password' | 'status'> & { password_unsafe: string }): Promise<User> => {
  if (users.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
    throw new Error('User with this username already exists.');
  }
  const newUser: User = { 
    id: generateId(),
    username: userData.username, 
    role: userData.role,
    password: userData.password_unsafe, // Storing password, ensure this is for mock only
    assignedRecruiterId: userData.assignedRecruiterId,
    status: userData.role === UserRole.CANDIDATE ? CandidateStatus.NONE : undefined 
  };
  users.push(newUser);
  localStorage.setItem('chat_users', JSON.stringify(users.map(u => ({...u, password: u.password})))); // Keep password for demo
  
  // Return user object without password for client-side
  const { password, ...userToReturn } = newUser;
  return userToReturn;
};

export const loginUser = async (usernameAttempt: string, passwordAttempt: string): Promise<User> => {
  const user = users.find(u => u.username.toLowerCase() === usernameAttempt.toLowerCase());
  if (!user || user.password !== passwordAttempt) { // Direct password check for mock service
    throw new Error('Invalid username or password.');
  }
  // Return user object without password for client-side
  const { password, ...userToReturn } = user;
  return userToReturn;
};

export const getAllRecruiters = async (): Promise<User[]> => {
  return users
    .filter(u => u.role === UserRole.RECRUITER)
    .map(u => {
      const { password, ...recruiter } = u; // Exclude password
      return recruiter;
    });
};

export const getCandidatesForRecruiter = async (recruiterId: string): Promise<User[]> => {
  return users
    .filter(u => u.role === UserRole.CANDIDATE && u.assignedRecruiterId === recruiterId)
    .map(u => {
      const { password, ...candidate } = u; // Exclude password
      return candidate;
    });
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  const user = users.find(u => u.id === userId);
  if (user) {
    const { password, ...userToReturn } = user; // Exclude password
    return userToReturn;
  }
  return undefined;
};

export const updateCandidateStatus = async (candidateId: string, status: CandidateStatus, recruiterId: string): Promise<User> => {
  const userIndex = users.findIndex(u => u.id === candidateId && u.assignedRecruiterId === recruiterId);
  if (userIndex === -1) {
    throw new Error('Candidate not found or not assigned to this recruiter.');
  }
  users[userIndex] = { ...users[userIndex], status };
  localStorage.setItem('chat_users', JSON.stringify(users.map(u => ({...u, password: u.password})))); // Keep password for demo
  
  publish(AppEvent.USER_STATUS_UPDATE, users[userIndex]);
  const { password, ...updatedUser } = users[userIndex]; // Exclude password
  return updatedUser;
};

// --- Message Management ---
const getChatId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

export const getMessages = async (userId1: string, userId2: string): Promise<Message[]> => {
  const chatId = getChatId(userId1, userId2);
  return messages[chatId] || [];
};

export const sendMessage = async (senderId: string, receiverId: string, text: string): Promise<Message> => {
  // Find sender in the full users array (which includes passwords, but we only need username)
  const senderFromFullList = users.find(u => u.id === senderId);
  if (!senderFromFullList) throw new Error('Sender not found');

  const chatId = getChatId(senderId, receiverId);
  const newMessage: Message = {
    id: generateId(),
    chatId,
    senderId,
    receiverId,
    text,
    timestamp: Date.now(),
    senderName: senderFromFullList.username, // Use username for senderName
  };
  if (!messages[chatId]) {
    messages[chatId] = [];
  }
  messages[chatId].push(newMessage);
  localStorage.setItem('chat_messages', JSON.stringify(messages));
  publish(AppEvent.NEW_MESSAGE, newMessage);
  return newMessage;
};

export const sendBulkMessage = async (recruiterId: string, status: CandidateStatus, text: string): Promise<Message[]> => {
  const candidates = await getCandidatesForRecruiter(recruiterId); // This already returns users without passwords
  const targetCandidates = candidates.filter(c => c.status === status);
  const sentMessages: Message[] = [];

  for (const candidate of targetCandidates) {
    const msg = await sendMessage(recruiterId, candidate.id, text);
    sentMessages.push(msg);
  }
  return sentMessages;
};

// --- Event Bus Export ---
export const eventBus = {
  subscribe,
  publish,
};