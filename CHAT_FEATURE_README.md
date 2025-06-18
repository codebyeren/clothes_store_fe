# Chat Feature Implementation

This document describes the chat feature implementation for the clothing store application.

## Overview

The chat feature allows real-time communication between users and admin support staff using WebSocket technology with STOMP protocol.

## Features

### User Chat
- Real-time messaging between users
- User list with online status
- Message history
- Responsive design
- Connection status indicator

### Admin Chat
- Customer support interface for admins
- View all customers in the system
- Real-time chat with customers
- Professional support theme
- Message history management

## Technical Implementation

### Backend Requirements
The chat feature requires the following backend components:

1. **WebSocket Configuration**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://127.0.0.1:5500")
                .withSockJS();
    }
}
```

2. **Chat Controller**
```java
@RequestMapping("api/chat")
public class ChatController {
    @GetMapping("/history")
    public List<ChatMessageDTO> getHistory(@RequestParam Long userId, @RequestParam Long otherId) {
        return chatService.getChatHistory(userId, otherId);
    }
}
```

3. **WebSocket Chat Controller**
```java
@Controller
public class WebSocketChatController {
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage message) {
        chatService.sendMessage(message);
    }
}
```

### Frontend Components

#### 1. Chat Service (`src/app/services/chat.service.ts`)
- Manages WebSocket connections
- Handles message sending and receiving
- Provides chat history functionality
- Connection status management

#### 2. User Chat Component (`src/app/user/chat/`)
- User interface for chatting with other users
- Modern, responsive design
- Real-time message updates
- User selection interface

#### 3. Admin Chat Component (`src/app/admin/chat/`)
- Admin interface for customer support
- Professional support theme
- Customer list management
- Support-focused UI

#### 4. Chat Models (`src/app/shared/models/chat.model.ts`)
- TypeScript interfaces for chat data
- Message and user DTOs
- Type safety for chat operations

## Installation

1. Install required dependencies:
```bash
npm install @stomp/stompjs sockjs-client
```

2. Update environment configuration:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'http://localhost:8080'
};
```

## Usage

### For Users
1. Log in to the application
2. Click the chat icon in the header
3. Select a user from the list to start chatting
4. Type messages and press Enter to send

### For Admins
1. Log in as an admin user
2. Navigate to Admin Panel > Customer Chat
3. Select a customer from the list
4. Provide customer support through the chat interface

## Routes

- **User Chat**: `/user/chat` (requires authentication)
- **Admin Chat**: `/admin/chat` (requires admin authentication)

## Features

### Real-time Messaging
- Instant message delivery
- Connection status indicators
- Automatic reconnection handling

### Message History
- Load previous conversations
- Persistent chat history
- Timestamp display

### User Management
- User list with avatars
- Role-based filtering
- Online status indicators

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts
- Touch-friendly controls

## Security

- Authentication required for chat access
- Admin-only access to customer support
- Secure WebSocket connections
- Token-based authentication

## Troubleshooting

### Connection Issues
1. Check backend WebSocket configuration
2. Verify CORS settings
3. Ensure proper URL configuration

### Message Not Sending
1. Check WebSocket connection status
2. Verify user authentication
3. Check browser console for errors

### User List Not Loading
1. Verify API endpoints
2. Check authentication tokens
3. Ensure proper user service configuration

## Future Enhancements

- File sharing capabilities
- Message read receipts
- Typing indicators
- Push notifications
- Chat rooms/groups
- Message search functionality
- Chat export features 