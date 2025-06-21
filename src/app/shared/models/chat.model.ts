export interface ChatMessage {
  id?: number;
  sender: User;
  receiver: User;
  content: string;
  timestamp?: Date;
  isRead?: boolean;
}

export interface User {
  id: number;
  username: string;
}

export interface ChatMessageDTO {
  id?: number;
  sender: UserDTO;
  receiver: UserDTO;
  content: string;
  timestamp?: Date;
  isRead?: boolean;
}

export interface UserDTO {
  id: number;
  username: string;
}
