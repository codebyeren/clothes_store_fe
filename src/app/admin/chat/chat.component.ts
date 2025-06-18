import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { ChatMessage, ChatMessageDTO, User } from '../../shared/models/chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class AdminChatComponent implements OnInit, OnDestroy {
  messages: ChatMessageDTO[] = [];
  newMessage: string = '';
  currentUser: User | null = null;
  selectedUser: User | null = null;
  usersWithChats: User[] = [];
  isConnected: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.setupCurrentUser();
    this.loadUsersWithChats();
    // Lắng nghe lịch sử chat (chỉ gán 1 lần khi mở chat)
    this.subscriptions.push(
      this.chatService.history$.subscribe(messages => {
        this.messages = messages;
        this.updateUnreadCount();
        this.scrollToBottom();
      })
    );

    // Lắng nghe tin nhắn mới (WebSocket)
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe(message => {
        this.messages = [...this.messages, message];
        this.updateUnreadCount();
        this.scrollToBottom();
      })
    );

    // Lắng nghe trạng thái kết nối
    this.subscriptions.push(
      this.chatService.connected$.subscribe(connected => {
        this.isConnected = connected;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  private setupCurrentUser(): void {
    this.userService.getUserInfo().subscribe({
      next: (data) => {
        const user = data.data;
        this.currentUser = {
          id: user.id,
          username: user.username || `User${user.id}`
        };
        this.chatService.connect(user.id);
      },
      error: (error) => {
        console.error('Error getting user info:', error);
      }
    });
  }

  private loadUsersWithChats(): void {
    this.subscriptions.push(
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.usersWithChats = users.map(user => this.mapToChatUser(user));
          if (this.usersWithChats.length > 0) {
            this.selectUser(this.usersWithChats[0]);
          }
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      })
    );
  }

  private mapToChatUser(user: any) {
    return {
      id: user.id,
      username: user.username || user.firstName || `User${user.id}`,
    };
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    if (this.currentUser) {
      this.chatService.loadChatHistory(this.currentUser.id, user.id);
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedUser && this.currentUser) {
      const message: ChatMessage = {
        sender: this.currentUser,
        receiver: this.selectedUser,
        content: this.newMessage.trim()
      };
      this.chatService.sendMessage(message);
      this.newMessage = '';
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  isOwnMessage(message: ChatMessageDTO): boolean {
    return message.sender.id === this.currentUser?.id;
  }

  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getUserDisplayName(user: User): string {
    return `${user.username}`.trim() || `User ${user.id}`;
  }

  private updateUnreadCount(): void {
    // Implementation of updateUnreadCount method
  }
} 