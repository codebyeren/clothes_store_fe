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
  private currentUserId: string | null = null;

  public history$ = this.historySubject.asObservable();
  public newMessage$ = this.newMessageSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(userId: number): void {
    this.currentUserId = userId.toString();
    console.log('Connecting to WebSocket with userId:', userId);
    this.stompClient = Stomp.over(() => new SockJS(`${environment.wsUrl}/ws`));
    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected to WebSocket:', frame);
      this.connectedSubject.next(true);
      this.stompClient.subscribe(`/topic/${this.currentUserId}`, (message: any) => {
        const chatMessage: ChatMessageDTO = JSON.parse(message.body);
        this.newMessageSubject.next(chatMessage); // emit single message
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

  getChatHistory(userId: string | number, otherId: string | number): Observable<ChatMessageDTO[]> {
    const url = `${environment.apiUrl}/chat/history`;
    const params = { 
      userId: userId.toString(), 
      otherId: otherId.toString() 
    };
    console.log('Loading chat history:', url, params);
    return this.http.get<ChatMessageDTO[]>(url, { params });
  }

  loadChatHistory(userId: string | number, otherId: string | number): void {
    this.getChatHistory(userId, otherId).subscribe({
      next: (messages) => {
        console.log('Chat history loaded:', messages);
        this.historySubject.next(messages); // emit full history
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
      }
    });
  }

  clearMessages(): void {
    this.historySubject.next([]);
  }

  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }
} 