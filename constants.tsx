
import React from 'react';
import { CandidateStatus, UserRole } from './types';

export const APP_TITLE = "FastJob99";

export const USER_ROLES = [
  { label: 'Recruiter', value: UserRole.RECRUITER },
  { label: 'Candidate', value: UserRole.CANDIDATE },
];

export const CANDIDATE_STATUSES = [
  { label: 'Selected', value: CandidateStatus.SELECTED, color: 'bg-green-500' },
  { label: 'Rejected', value: CandidateStatus.REJECTED, color: 'bg-red-500' },
  { label: 'Interviewing', value: CandidateStatus.INTERVIEWING, color: 'bg-yellow-500' },
  { label: 'No Status', value: CandidateStatus.NONE, color: 'bg-gray-400'}
];

export const getStatusColor = (status?: CandidateStatus): string => {
  return CANDIDATE_STATUSES.find(s => s.value === status)?.color || 'bg-gray-400';
};

export const getStatusLabel = (status?: CandidateStatus): string => {
  return CANDIDATE_STATUSES.find(s => s.value === status)?.label || 'No Status';
};


// SVG Icons as React Components

export const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);

export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Status/Settings Icon for individual candidate
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.057-1.229a11.952 11.952 0 0 0-6.814 6.814c-.222.497-.687.967-1.229 1.057A9.003 9.003 0 0 1 2.25 12c0 .896.126 1.757.362 2.582.542.09.967.56 1.229 1.057a11.952 11.952 0 0 0 6.814 6.814c.497.222 1.007.687 1.057 1.229A9.003 9.003 0 0 1 12 21.75c-.896 0-1.757-.126-2.582-.362-.09-.542-.56-1.007-1.057-1.229a11.952 11.952 0 0 0-6.814-6.814c-.222-.497-.687-.967-1.229-1.057A9.003 9.003 0 0 1 2.25 12c0-.896.126-1.757.362-2.582.542-.09.967.56 1.229-1.057A11.952 11.952 0 0 0 8.36 3.638M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm0 0V8.25m0 7.5V12m0 0H8.25m7.5 0H12m0 0V8.25m0 7.5V12m0 0h3.75M12 12h3.75m-3.75 0H8.25m3.75 0V8.25m0 7.5V12" />
  </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Bulk Message Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.602m-3.741 6.081a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1-3.741-5.602m6.082 5.071a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.601m-3.741 5.601a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1-3.741-5.601M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9.664 2.83a9.048 9.048 0 0 0-2.302.285 3 3 0 0 0-2.73 4.404M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9.664 2.83A9.048 9.048 0 0 0 3.034 12c0 1.657.482 3.193 1.302 4.404m2.302-4.689a3 3 0 0 0-2.73 4.404M12 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6.336-2.83a9.048 9.048 0 0 1 2.302.285 3 3 0 0 1 2.73 4.404m-2.302-4.689a3 3 0 0 1 2.73 4.404" />
  </svg>
);

export const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const InformationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Interviewing
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

export const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Global Categorization Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25L7.5 16.5V3.75m9 0H7.5A2.25 2.25 0 0 0 5.25 6v10.5A2.25 2.25 0 0 0 7.5 18.75h9A2.25 2.25 0 0 0 18.75 16.5V6A2.25 2.25 0 0 0 16.5 3.75Z" />
  </svg>
);
