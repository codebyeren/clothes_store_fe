import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { ChatMessage, ChatMessageDTO, User } from '../../shared/models/chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.css']
})
export class ChatBubbleComponent implements OnInit, OnDestroy {
  messages: ChatMessageDTO[] = [];
  newMessage: string = '';
  currentUser: User | null = null;
  adminUser: User | null = null;
  isConnected: boolean = false;
  isChatOpen: boolean = false;
  unreadCount: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe({
      next: (data) => {
        const user = data.data;
        this.currentUser = {
          id: user.id,
          username: user.username || `User${user.id}`
        };
        this.adminUser = {
          id: 1,
          username: 'Admin Support'
        };
        
        // Khôi phục số tin nhắn chưa đọc từ localStorage
        this.unreadCount = this.chatService.getStoredUnreadCount();
        
        this.chatService.connect(user.id);
        this.loadChatHistory();
      },
      error: (error) => {
        console.error('Error getting user info:', error);
      }
    });

    this.subscriptions.push(
      this.chatService.history$.subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
      })
    );

    this.subscriptions.push(
      this.chatService.newMessage$.subscribe(message => {
        // Service đã xử lý việc thêm tin nhắn vào history
        // Chỉ cần scroll xuống dưới
        this.scrollToBottom();
      })
    );

    this.subscriptions.push(
      this.chatService.connected$.subscribe(connected => {
        this.isConnected = connected;
      })
    );

    // Subscribe to unread count from service
    this.subscriptions.push(
      this.chatService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  private loadChatHistory(): void {
    if (this.currentUser && this.adminUser) {
      this.chatService.loadChatHistory(this.currentUser.id, this.adminUser.id);
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    
    if (this.isChatOpen) {
      // Khi mở chat, đánh dấu tất cả tin nhắn đã đọc trước
      this.chatService.setChatOpen(true);
      // Sau đó load history để cập nhật UI
      this.loadChatHistory();
    } else {
      // Khi đóng chat
      this.chatService.setChatOpen(false);
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.adminUser && this.currentUser) {
      const message: ChatMessage = {
        sender: this.currentUser,
        receiver: this.adminUser,
        content: this.newMessage.trim(),
        isRead: true // Tin nhắn gửi đi được đánh dấu là đã đọc
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
}
