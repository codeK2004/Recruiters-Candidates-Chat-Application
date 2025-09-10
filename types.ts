
export enum UserRole {
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE',
}

export enum CandidateStatus {
  NONE = 'NONE',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  INTERVIEWING = 'INTERVIEWING',
}

export interface User {
  id: string;
  username: string; // Changed from name, email field removed
  role: UserRole;
  password?: string; // Should not be stored long-term or sent to client after auth
  assignedRecruiterId?: string; // For candidates
  status?: CandidateStatus; // For candidates, managed by recruiters
}

export interface Message {
  id: string;
  chatId: string; // Composite ID like `${userId1}_${userId2}` ensuring order
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  senderName?: string; // Will store the sender's username
}

export interface ChatParticipant extends User {
  unreadCount?: number;
}

// For event bus
export enum AppEvent {
  NEW_MESSAGE = 'NEW_MESSAGE',
  USER_STATUS_UPDATE = 'USER_STATUS_UPDATE',
}

export type EventCallback = (data?: any) => void;

export interface EventListener {
  id: string;
  event: AppEvent;
  callback: EventCallback;
}