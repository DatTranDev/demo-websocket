/**
 * WebSocket Demo - Expo React Native Mobile App
 *
 * This is the main entry point for the Expo React Native application.
 * It provides a simple chat interface using WebSocket (Socket.io) for real-time communication.
 *
 * Features:
 * - Real-time message sending and receiving
 * - Display connected user count
 * - Typing indicators
 * - Message history from PostgreSQL database
 * - Run directly on physical device using Expo Go app
 *
 * @format
 */

import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import io from "socket.io-client";

// Backend server URL - IMPORTANT: Change this to your computer's IP address
// To find your IP: Run "ipconfig" in PowerShell and look for IPv4 Address
// Example: If your IP is 192.168.1.100, use: http://192.168.1.100:3000
//
// For Expo on physical device: MUST use your computer's local IP (not localhost)
// For Android emulator: use http://10.0.2.2:3000
// For iOS simulator: use http://localhost:3000
const SOCKET_URL = "http://192.168.32.1:3000"; // ⚠️ CHANGE THIS TO YOUR IP!

function App() {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [typingUser, setTypingUser] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  // References
  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /**
   * Initialize Socket.io connection and event listeners
   */
  useEffect(() => {
    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket"], // Use WebSocket transport
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection established
    socket.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
      loadMessageHistory(); // Load previous messages when connected
    });

    // Connection lost
    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    // Connection error
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      Alert.alert(
        "Connection Error",
        "Failed to connect to server. Please check if the backend is running."
      );
    });

    // Receive new message from server
    socket.on("new_message", (data) => {
      console.log("📨 New message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
      // Auto-scroll to bottom when new message arrives
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Receive user count update
    socket.on("user_count", (data) => {
      console.log("👥 User count:", data.count);
      setUserCount(data.count);
    });

    // Someone is typing
    socket.on("user_typing", (data) => {
      setTypingUser(data.username);
      // Clear typing indicator after 3 seconds
      setTimeout(() => setTypingUser(""), 3000);
    });

    // Someone stopped typing
    socket.on("user_stop_typing", () => {
      setTypingUser("");
    });

    // All messages cleared event
    socket.on("messages_cleared", () => {
      setMessages([]);
      Alert.alert("Notice", "All messages have been cleared");
    });

    // Error from server
    socket.on("error", (data) => {
      Alert.alert("Error", data.message);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Load message history from REST API
   */
  const loadMessageHistory = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages.reverse()); // Reverse to show oldest first
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  /**
   * Handle joining the chat
   */
  const handleJoin = () => {
    if (username.trim() === "") {
      Alert.alert("Error", "Please enter your username");
      return;
    }
    setHasJoined(true);
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = () => {
    if (message.trim() === "") {
      return;
    }

    // Emit message to server via WebSocket
    socketRef.current?.emit("send_message", {
      username: username,
      content: message.trim(),
    });

    // Clear input field
    setMessage("");

    // Stop typing indicator
    socketRef.current?.emit("stop_typing", { username });
  };

  /**
   * Handle text input change (typing indicator)
   */
  const handleMessageChange = (text) => {
    setMessage(text);

    // Emit typing event
    if (text.length > 0) {
      socketRef.current?.emit("typing", { username });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("stop_typing", { username });
      }, 2000);
    } else {
      socketRef.current?.emit("stop_typing", { username });
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Render login screen
   */
  if (!hasJoined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e90ff" />
        <View style={styles.loginContainer}>
          <Text style={styles.title}>WebSocket Chat Demo</Text>
          <Text style={styles.subtitle}>Enter your username to join</Text>

          <TextInput
            style={styles.loginInput}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            maxLength={20}
          />

          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Join Chat</Text>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? "#4caf50" : "#f44336" },
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? "Connected to server" : "Disconnected"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render chat screen
   */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e90ff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WebSocket Chat</Text>
        <View style={styles.headerInfo}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? "#4caf50" : "#f44336" },
            ]}
          />
          <Text style={styles.headerText}>
            {userCount} user{userCount !== 1 ? "s" : ""} online
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>
              No messages yet. Start the conversation!
            </Text>
          ) : (
            messages.map((msg, index) => (
              <View
                key={msg.id || index}
                style={[
                  styles.messageItem,
                  msg.username === username
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
              >
                <Text style={styles.messageUsername}>{msg.username}</Text>
                <Text style={styles.messageContent}>{msg.content}</Text>
                <Text style={styles.messageTime}>
                  {formatTime(msg.created_at)}
                </Text>
              </View>
            ))
          )}

          {/* Typing Indicator */}
          {typingUser && typingUser !== username && (
            <Text style={styles.typingIndicator}>
              {typingUser} is typing...
            </Text>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={handleMessageChange}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e90ff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  loginInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  joinButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#1e90ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  header: {
    backgroundColor: "#1e90ff",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 14,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 50,
  },
  messageItem: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#1e90ff",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageUsername: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    opacity: 0.8,
  },
  messageContent: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.6,
    alignSelf: "flex-end",
  },
  typingIndicator: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#1e90ff",
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default App;
