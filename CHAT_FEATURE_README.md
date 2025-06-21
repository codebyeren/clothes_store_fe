# Hệ thống Chat với Theo dõi Tin nhắn Chưa đọc

## Tổng quan

Hệ thống chat đã được cải thiện để theo dõi chính xác tin nhắn chưa đọc và tự động cập nhật số lượng khi có tin nhắn mới qua WebSocket.

## Tính năng chính

### 1. Theo dõi trạng thái tin nhắn chưa đọc
- **Trường `isRead`**: Mỗi tin nhắn có trạng thái `isRead` để xác định đã đọc hay chưa
- **Tự động đánh dấu**: Tin nhắn mới nhận được tự động đánh dấu là chưa đọc
- **Đánh dấu đã đọc**: Khi mở chat window, tất cả tin nhắn được đánh dấu là đã đọc

### 2. Hiển thị số tin nhắn chưa đọc
- **Badge trên chat bubble**: Hiển thị số tin nhắn chưa đọc với animation pulse
- **Giới hạn hiển thị**: Số lớn hơn 99 sẽ hiển thị "99+"
- **Indicator trong header**: Hiển thị số tin nhắn mới trong header khi mở chat

### 3. Giao diện tin nhắn chưa đọc
- **Animation highlight**: Tin nhắn chưa đọc có animation highlight khi xuất hiện
- **Unread dot**: Dấu chấm đỏ nhấp nháy bên cạnh thời gian tin nhắn chưa đọc
- **Read status**: Hiển thị icon check/check-double cho tin nhắn đã gửi

### 4. Lưu trữ trạng thái
- **localStorage**: Lưu trạng thái đọc và số tin nhắn chưa đọc vào localStorage
- **Khôi phục trạng thái**: Tự động khôi phục trạng thái khi refresh trang
- **Per-user storage**: Mỗi user có storage riêng biệt

## Cách hoạt động

### 1. Khi nhận tin nhắn mới qua WebSocket
```typescript
// Trong ChatService
this.stompClient.subscribe(`/topic/${this.currentUserId}`, (message: any) => {
  const chatMessage: ChatMessageDTO = JSON.parse(message.body);
  chatMessage.isRead = false; // Đánh dấu chưa đọc
  this.newMessageSubject.next(chatMessage);
  this.updateUnreadCount(); // Cập nhật số lượng
  this.saveUnreadCount(); // Lưu vào localStorage
});
```

### 2. Tính toán số tin nhắn chưa đọc
```typescript
private updateUnreadCount(): void {
  const messages = this.historySubject.value;
  const unreadCount = messages.filter(message => 
    message.sender.id.toString() !== this.currentUserId && 
    !message.isRead
  ).length;
  this.unreadCountSubject.next(unreadCount);
}
```

### 3. Đánh dấu tin nhắn đã đọc
```typescript
markMessagesAsRead(): void {
  const currentMessages = this.historySubject.value;
  const updatedMessages = currentMessages.map(message => ({
    ...message,
    isRead: true
  }));
  this.historySubject.next(updatedMessages);
  this.updateUnreadCount();
  this.saveReadStatus(updatedMessages); // Lưu trạng thái
}
```

### 4. Lưu trữ vào localStorage
```typescript
// Lưu trạng thái đọc
private saveReadStatus(messages: ChatMessageDTO[]): void {
  const readStatus: { [key: number]: boolean } = {};
  messages.forEach(message => {
    if (message.id) {
      readStatus[message.id] = message.isRead || false;
    }
  });
  localStorage.setItem(`chat_read_status_${this.currentUserId}`, JSON.stringify(readStatus));
}

// Lưu số tin nhắn chưa đọc
private saveUnreadCount(): void {
  const currentCount = this.unreadCountSubject.value;
  localStorage.setItem(`chat_unread_count_${this.currentUserId}`, currentCount.toString());
}
```

## Cấu trúc dữ liệu

### ChatMessageDTO
```typescript
export interface ChatMessageDTO {
  id?: number;
  sender: UserDTO;
  receiver: UserDTO;
  content: string;
  timestamp?: Date;
  isRead?: boolean; // Trạng thái đọc
}
```

### LocalStorage Keys
- `chat_read_status_${userId}`: Lưu trạng thái đọc của từng tin nhắn
- `chat_unread_count_${userId}`: Lưu số tin nhắn chưa đọc

## Các Observable trong ChatService

- `history$`: Danh sách tin nhắn
- `newMessage$`: Tin nhắn mới nhận được
- `connected$`: Trạng thái kết nối WebSocket
- `unreadCount$`: Số tin nhắn chưa đọc

## Responsive Design

- **Desktop**: Chat window 350x500px
- **Mobile**: Chat window 300x400px
- **Badge**: Tự động điều chỉnh kích thước cho số lớn

## Animation và Visual Effects

- **Pulse animation**: Badge tin nhắn chưa đọc
- **Slide-in animation**: Chat window khi mở
- **Highlight animation**: Tin nhắn chưa đọc mới
- **Blink animation**: Unread dot
- **Hover effects**: Các button và interactive elements 