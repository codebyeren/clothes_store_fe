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
  userUnreadCounts: { [key: number]: number } = {};
  userMessages: { [key: number]: ChatMessageDTO[] } = {};
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.setupCurrentUser();
    this.loadUsersWithChats();
    
    // Lắng nghe tin nhắn mới (WebSocket)
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe(message => {
        this.handleNewMessage(message);
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
            // Load tin nhắn cho tất cả users
            this.loadAllUserChats();
            this.selectUser(this.usersWithChats[0]);
          }
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      })
    );
  }

  private loadAllUserChats(): void {
    if (!this.currentUser) return;

    this.usersWithChats.forEach(user => {
      this.chatService.getChatHistory(this.currentUser!.id, user.id).subscribe({
        next: (messages) => {
          // Khôi phục trạng thái đọc từ localStorage
          const savedReadStatus = this.getSavedReadStatus(user.id);
          const updatedMessages = messages.map(message => ({
            ...message,
            isRead: savedReadStatus[message.id!] || message.sender.id === this.currentUser?.id
          }));
          
          this.userMessages[user.id] = updatedMessages;
          this.updateUnreadCount(user.id);
        },
        error: (error) => {
          console.error(`Error loading chat history for user ${user.id}:`, error);
        }
      });
    });
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
      // Load tin nhắn cho user được chọn
      this.loadChatHistoryForUser(user.id);
    }
  }

  private loadChatHistoryForUser(userId: number): void {
    if (!this.currentUser) return;

    // Nếu đã có tin nhắn trong cache, sử dụng cache và đánh dấu đã đọc
    if (this.userMessages[userId]) {
      this.messages = this.userMessages[userId];
      this.markMessagesAsRead(userId);
      return;
    }

    // Load từ server nếu chưa có cache
    this.chatService.getChatHistory(this.currentUser.id, userId).subscribe({
      next: (messages) => {
        // Khôi phục trạng thái đọc từ localStorage
        const savedReadStatus = this.getSavedReadStatus(userId);
        const updatedMessages = messages.map(message => ({
          ...message,
          isRead: savedReadStatus[message.id!] || message.sender.id === this.currentUser?.id
        }));
        
        this.userMessages[userId] = updatedMessages;
        this.messages = updatedMessages;
        this.markMessagesAsRead(userId);
        this.updateUnreadCount(userId);
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
      }
    });
  }

  private handleNewMessage(message: ChatMessageDTO): void {
    // Xác định user gửi tin nhắn
    const senderId = message.sender.id;
    const receiverId = message.receiver.id;
    
    // Xác định user cần cập nhật tin nhắn
    const targetUserId = senderId === this.currentUser?.id ? receiverId : senderId;
    
    // Thêm tin nhắn vào cache của user
    if (!this.userMessages[targetUserId]) {
      this.userMessages[targetUserId] = [];
    }
    
    // Đánh dấu tin nhắn đã đọc nếu đang chat với user này
    const isRead = this.selectedUser?.id === targetUserId;
    const updatedMessage = { ...message, isRead };
    
    this.userMessages[targetUserId].push(updatedMessage);
    
    // Cập nhật tin nhắn hiện tại nếu đang chat với user này
    if (this.selectedUser?.id === targetUserId) {
      this.messages = this.userMessages[targetUserId];
      this.scrollToBottom();
    }
    
    // Cập nhật số tin nhắn chưa đọc
    this.updateUnreadCount(targetUserId);
  }

  private markMessagesAsRead(userId: number): void {
    if (this.userMessages[userId]) {
      this.userMessages[userId] = this.userMessages[userId].map(message => ({
        ...message,
        isRead: true
      }));
      this.messages = this.userMessages[userId];
      this.saveReadStatus(userId);
      this.updateUnreadCount(userId);
    }
  }

  // Lưu trạng thái đọc vào localStorage
  private saveReadStatus(userId: number): void {
    if (!this.currentUser || !this.userMessages[userId]) return;
    
    const readStatus: { [key: number]: boolean } = {};
    this.userMessages[userId].forEach(message => {
      if (message.id) {
        readStatus[message.id] = message.isRead || false;
      }
    });
    
    localStorage.setItem(`admin_chat_read_status_${this.currentUser.id}_${userId}`, JSON.stringify(readStatus));
  }

  // Lấy trạng thái đọc từ localStorage
  private getSavedReadStatus(userId: number): { [key: number]: boolean } {
    if (!this.currentUser) return {};
    
    const saved = localStorage.getItem(`admin_chat_read_status_${this.currentUser.id}_${userId}`);
    return saved ? JSON.parse(saved) : {};
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedUser && this.currentUser) {
      const message: ChatMessage = {
        sender: this.currentUser,
        receiver: this.selectedUser,
        content: this.newMessage.trim(),
        isRead: true
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
      const chatContainer = document.querySelector('.messages-container');
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

  getUnreadCount(userId: number): number {
    return this.userUnreadCounts[userId] || 0;
  }

  private updateUnreadCount(userId: number): void {
    if (!this.currentUser || !this.userMessages[userId]) return;

    const messages = this.userMessages[userId];
    const unreadCount = messages.filter(message => 
      message.sender.id !== this.currentUser?.id && 
      !message.isRead
    ).length;

    this.userUnreadCounts[userId] = unreadCount;
  }
} 