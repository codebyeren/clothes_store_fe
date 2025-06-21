import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs'
import { ChatMessage, ChatMessageDTO, User } from '../shared/models/chat.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any;
  private historySubject = new BehaviorSubject<ChatMessageDTO[]>([]);
  private newMessageSubject = new Subject<ChatMessageDTO>();
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private currentUserId: number | null = null;
  private isChatOpen: boolean = false;

  public history$ = this.historySubject.asObservable();
  public newMessage$ = this.newMessageSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(userId: number): void {
    this.currentUserId = userId;
    console.log('Connecting to WebSocket with userId:', userId);
    this.stompClient = Stomp.over(() => new SockJS(`${environment.wsUrl}/ws`));
    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected to WebSocket:', frame);
      this.connectedSubject.next(true);
      this.stompClient.subscribe(`/topic/${this.currentUserId}`, (message: any) => {
        const chatMessage: ChatMessageDTO = JSON.parse(message.body);
        chatMessage.isRead = this.isChatOpen;
        this.newMessageSubject.next(chatMessage);
        this.addMessageToHistory(chatMessage);
        this.updateUnreadCount();
        this.saveUnreadCount();
      });
    }, (error: any) => {
      console.error('WebSocket connection error:', error);
      this.connectedSubject.next(false);
    });
  }
  
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connectedSubject.next(false);
    }
  }

  sendMessage(message: ChatMessage): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log('Sending message:', message);
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
    }
  }

  getChatHistory(userId: number, otherId: number): Observable<ChatMessageDTO[]> {
    const url = `${environment.apiUrl}/chat/history`;
    const params = { 
      userId: userId, 
      otherId: otherId 
    };
    console.log('Loading chat history:', url, params);
    return this.http.get<ChatMessageDTO[]>(url, { params });
  }

  loadChatHistory(userId: number, otherId: number): void {
    this.getChatHistory(userId, otherId).subscribe({
      next: (messages) => {
        console.log('Chat history loaded:', messages);
        
        if (this.isChatOpen) {
          const updatedMessages = messages.map(message => ({
            ...message,
            isRead: true
          }));
          this.historySubject.next(updatedMessages);
          this.saveReadStatus(updatedMessages);
        } else {
          const savedReadStatus = this.getSavedReadStatus();
          const updatedMessages = messages.map(message => ({
            ...message,
            isRead: savedReadStatus[message.id!] || false
          }));
          this.historySubject.next(updatedMessages);
        }
        
        this.updateUnreadCount();
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
      }
    });
  }

  markMessagesAsRead(): void {
    const currentMessages = this.historySubject.value;
    const updatedMessages = currentMessages.map(message => ({
      ...message,
      isRead: true
    }));
    this.historySubject.next(updatedMessages);
    this.updateUnreadCount();
    this.saveReadStatus(updatedMessages);
  }

  setChatOpen(isOpen: boolean): void {
    this.isChatOpen = isOpen;
    if (isOpen) {
      this.markMessagesAsRead();
    }
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    if (!this.currentUserId) return;

    const messages = this.historySubject.value;
    const unreadCount = messages.filter(message => 
      message.sender.id !== this.currentUserId && 
      !message.isRead
    ).length;

    this.unreadCountSubject.next(unreadCount);
  }

  private saveReadStatus(messages: ChatMessageDTO[]): void {
    if (!this.currentUserId) return;
    
    const readStatus: { [key: number]: boolean } = {};
    messages.forEach(message => {
      if (message.id) {
        readStatus[message.id] = message.isRead || false;
      }
    });
    
    localStorage.setItem(`chat_read_status_${this.currentUserId}`, JSON.stringify(readStatus));
  }

  private getSavedReadStatus(): { [key: number]: boolean } {
    if (!this.currentUserId) return {};
    
    const saved = localStorage.getItem(`chat_read_status_${this.currentUserId}`);
    return saved ? JSON.parse(saved) : {};
  }

  private saveUnreadCount(): void {
    if (!this.currentUserId) return;
    
    const currentCount = this.unreadCountSubject.value;
    localStorage.setItem(`chat_unread_count_${this.currentUserId}`, currentCount.toString());
  }

  getStoredUnreadCount(): number {
    if (!this.currentUserId) return 0;
    
    const saved = localStorage.getItem(`chat_unread_count_${this.currentUserId}`);
    return saved ? parseInt(saved, 10) : 0;
  }

  clearMessages(): void {
    this.historySubject.next([]);
    this.unreadCountSubject.next(0);
    if (this.currentUserId) {
      localStorage.removeItem(`chat_read_status_${this.currentUserId}`);
      localStorage.removeItem(`chat_unread_count_${this.currentUserId}`);
    }
  }

  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }

  private addMessageToHistory(message: ChatMessageDTO): void {
    const currentMessages = this.historySubject.value;
    const updatedMessages = [...currentMessages, message];
    this.historySubject.next(updatedMessages);
  }
} 