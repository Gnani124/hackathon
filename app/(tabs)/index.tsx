import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator, TouchableOpacity, Image, TextInput, Modal, Share, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { ChevronRight, Calendar, BookOpen, GraduationCap, Bell, Book, Users, FileText, Award, Send, ThumbsUp, MessageCircle, Share2, MessageSquare, Plus, Search, Hash } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Define Post interface
interface Post {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  type: 'general' | 'question' | 'resource' | 'discussion';
  isLiked?: boolean;
}

// Define Comment interface
interface Comment {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  content: string;
  timestamp: Date;
}

// Define Chatroom interface
interface Chatroom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  category: 'academic' | 'social' | 'sports' | 'tech' | 'other';
  lastActivity: Date;
}

// Define ChatMessage interface
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  content: string;
  timestamp: Date;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [isChatroomModalVisible, setIsChatroomModalVisible] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateChatroomModalVisible, setIsCreateChatroomModalVisible] = useState(false);
  const [newChatroomName, setNewChatroomName] = useState('');
  const [newChatroomDescription, setNewChatroomDescription] = useState('');
  const [newChatroomCategory, setNewChatroomCategory] = useState<'academic' | 'social' | 'sports' | 'tech' | 'other'>('academic');
  const [isCreatingChatroom, setIsCreatingChatroom] = useState(false);

  // Mock data for posts
  const mockPosts: Post[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      content: 'Does anyone have notes for the Advanced Algorithms course?',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      likes: 5,
      comments: [
        {
          id: 'c1',
          userId: 'user2',
          userName: 'Jane Smith',
          content: 'I have some notes from last semester. I can share them with you.',
          timestamp: new Date(Date.now() - 3500000),
        }
      ],
      type: 'question',
      isLiked: false
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      content: 'I found this great resource for learning React Native: https://reactnative.dev/docs/tutorial',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      likes: 8,
      comments: [
        {
          id: 'c2',
          userId: 'user3',
          userName: 'Alex Johnson',
          content: 'Thanks for sharing! This is really helpful.',
          timestamp: new Date(Date.now() - 7100000),
        },
        {
          id: 'c3',
          userId: 'user1',
          userName: 'John Doe',
          content: 'I\'ve been looking for something like this. Appreciate it!',
          timestamp: new Date(Date.now() - 7000000),
        }
      ],
      type: 'resource',
      isLiked: false
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Alex Johnson',
      content: 'Let\'s discuss the best study techniques for the upcoming finals!',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      likes: 12,
      comments: [
        {
          id: 'c4',
          userId: 'user2',
          userName: 'Jane Smith',
          content: 'I find that creating flashcards helps me memorize key concepts.',
          timestamp: new Date(Date.now() - 86300000),
        },
        {
          id: 'c5',
          userId: 'user1',
          userName: 'John Doe',
          content: 'Group study sessions have been really effective for me.',
          timestamp: new Date(Date.now() - 86200000),
        },
        {
          id: 'c6',
          userId: 'user4',
          userName: 'Sarah Williams',
          content: 'I use the Pomodoro technique - 25 minutes of focused study followed by a 5-minute break.',
          timestamp: new Date(Date.now() - 86100000),
        }
      ],
      type: 'discussion',
      isLiked: false
    }
  ];

  // Mock data for chatrooms
  const mockChatrooms: Chatroom[] = [
    {
      id: '1',
      name: 'Computer Science Majors',
      description: 'Discussion group for CS students',
      memberCount: 156,
      isJoined: true,
      category: 'academic',
      lastActivity: new Date(Date.now() - 1800000), // 30 minutes ago
    },
    {
      id: '2',
      name: 'Campus Events',
      description: 'Stay updated with campus events and activities',
      memberCount: 243,
      isJoined: true,
      category: 'social',
      lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: '3',
      name: 'Study Group: Data Structures',
      description: 'Study group for Data Structures and Algorithms',
      memberCount: 42,
      isJoined: false,
      category: 'academic',
      lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      id: '4',
      name: 'Basketball Team',
      description: 'College basketball team discussions',
      memberCount: 28,
      isJoined: false,
      category: 'sports',
      lastActivity: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: '5',
      name: 'Tech Enthusiasts',
      description: 'Discuss the latest in technology',
      memberCount: 89,
      isJoined: true,
      category: 'tech',
      lastActivity: new Date(Date.now() - 1800000), // 30 minutes ago
    },
  ];

  // Mock data for chat messages
  const mockChatMessages: ChatMessage[] = [
    {
      id: 'm1',
      userId: 'user1',
      userName: 'John Doe',
      content: 'Hey everyone! Anyone working on the Data Structures project?',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: 'm2',
      userId: 'user2',
      userName: 'Jane Smith',
      content: 'Yes, I\'m working on it. The binary tree implementation is challenging.',
      timestamp: new Date(Date.now() - 3500000), // 58 minutes ago
    },
    {
      id: 'm3',
      userId: 'user3',
      userName: 'Alex Johnson',
      content: 'I finished it yesterday. Let me know if you need help!',
      timestamp: new Date(Date.now() - 3400000), // 57 minutes ago
    },
    {
      id: 'm4',
      userId: 'user1',
      userName: 'John Doe',
      content: 'That would be great! Can we meet tomorrow?',
      timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
    },
    {
      id: 'm5',
      userId: 'user3',
      userName: 'Alex Johnson',
      content: 'Sure, I\'m free after 2 PM.',
      timestamp: new Date(Date.now() - 3200000), // 53 minutes ago
    },
  ];

  const loadData = async () => {
    try {
      setIsLoading(true);
      // In a real app, you would fetch posts and chatrooms from your backend
      // For now, we'll use mock data
      setTimeout(() => {
        setPosts(mockPosts);
        setChatrooms(mockChatrooms);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this to your backend
      // For now, we'll just add it to the local state
      const newPost: Post = {
        id: Date.now().toString(),
        userId: user?.id || 'unknown',
        userName: user?.displayName || 'Anonymous',
        userProfilePicture: user?.profilePicture,
        content: newPostContent,
        timestamp: new Date(),
        likes: 0,
        comments: [],
        type: 'general'
      };
      
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isCurrentlyLiked = post.isLiked;
        return {
          ...post,
          likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !isCurrentlyLiked
        };
      }
      return post;
    }));
  };

  const handleCommentPost = (post: Post) => {
    setSelectedPost(post);
    setIsCommentModalVisible(true);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    
    setIsSubmittingComment(true);
    
    try {
      // In a real app, you would send this to your backend
      // For now, we'll just add it to the local state
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: user?.id || 'unknown',
        userName: user?.displayName || 'Anonymous',
        userProfilePicture: user?.profilePicture,
        content: commentText,
        timestamp: new Date()
      };
      
      setPosts(posts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      }));
      
      setCommentText('');
      setIsCommentModalVisible(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSharePost = async (post: Post) => {
    try {
      const result = await Share.share({
        message: `${post.userName}: ${post.content}`,
        title: 'Shared from Student App'
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleJoinChatroom = (chatroomId: string) => {
    setChatrooms(chatrooms.map(chatroom => {
      if (chatroom.id === chatroomId) {
        return {
          ...chatroom,
          isJoined: !chatroom.isJoined,
          memberCount: chatroom.isJoined ? chatroom.memberCount - 1 : chatroom.memberCount + 1
        };
      }
      return chatroom;
    }));
  };

  const handleOpenChatroom = (chatroom: Chatroom) => {
    setSelectedChatroom(chatroom);
    setChatMessages(mockChatMessages);
    setIsChatroomModalVisible(true);
  };

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !selectedChatroom) return;
    
    setIsSubmittingMessage(true);
    
    try {
      // In a real app, you would send this to your backend
      // For now, we'll just add it to the local state
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: user?.id || 'unknown',
        userName: user?.displayName || 'Anonymous',
        userProfilePicture: user?.profilePicture,
        content: newMessageText,
        timestamp: new Date()
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setNewMessageText('');
      
      // Update the last activity of the chatroom
      setChatrooms(chatrooms.map(chatroom => {
        if (chatroom.id === selectedChatroom.id) {
          return {
            ...chatroom,
            lastActivity: new Date()
          };
        }
        return chatroom;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const filteredChatrooms = chatrooms.filter(chatroom => 
    chatroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chatroom.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChatroom = async () => {
    if (!newChatroomName.trim() || !newChatroomDescription.trim()) return;
    
    setIsCreatingChatroom(true);
    
    try {
      // In a real app, you would send this to your backend
      // For now, we'll just add it to the local state
      const newChatroom: Chatroom = {
        id: Date.now().toString(),
        name: newChatroomName,
        description: newChatroomDescription,
        memberCount: 1, // The creator is automatically a member
        isJoined: true,
        category: newChatroomCategory,
        lastActivity: new Date()
      };
      
      setChatrooms([newChatroom, ...chatrooms]);
      setIsCreateChatroomModalVisible(false);
      
      // Reset form fields
      setNewChatroomName('');
      setNewChatroomDescription('');
      setNewChatroomCategory('academic');
      
      // Show success message
      Alert.alert('Success', 'Chatroom created successfully!');
    } catch (error) {
      console.error('Error creating chatroom:', error);
      Alert.alert('Error', 'Failed to create chatroom. Please try again.');
    } finally {
      setIsCreatingChatroom(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with gradient background */}
        <LinearGradient
          colors={[colors.primary, colors.info]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
      >
        <View style={styles.header}>
            <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.displayName?.split(' ')[0]}
          </Text>
          <Text style={styles.subtitle}>
            {user?.role === 'student'
              ? 'Your academic dashboard'
                  : 'Manage your teaching schedule'}
          </Text>
        </View>
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => setIsChatroomModalVisible(true)}
            >
              <MessageSquare size={24} color="#FFFFFF" />
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>
                  {chatrooms.filter(c => c.isJoined).length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Stats Section */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Calendar size={24} color={colors.primary} />
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Users size={24} color={colors.secondary} />
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Students</Text>
          </Card>
          <Card style={styles.statCard}>
            <Book size={24} color={colors.warning} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </Card>
        </View>

        {/* Create Post Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share with Community</Text>
          <Card style={styles.createPostCard}>
            <View style={styles.createPostContent}>
              <View style={styles.createPostHeader}>
                <View style={styles.createPostAvatar}>
                  {user?.profilePicture ? (
                    <Image 
                      source={{ uri: user.profilePicture }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user?.displayName?.charAt(0) || 'U'}
                      </Text>
          </View>
                  )}
            </View>
                <View style={styles.postInputContainer}>
                  <TextInput
                    style={styles.postInput}
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                    multiline
                  />
                  <TouchableOpacity 
                    style={[
                      styles.postButton,
                      !newPostContent.trim() && styles.postButtonDisabled
                    ]}
                    onPress={handleCreatePost}
                    disabled={!newPostContent.trim() || isSubmitting}
                  >
                    <Send size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.createPostActions}>
                <TouchableOpacity 
                  style={styles.createPostAction}
                  onPress={() => setNewPostContent(prev => prev + '?')}
                >
                  <BookOpen size={20} color={colors.primary} />
                  <Text style={styles.createPostActionText}>Ask Question</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.createPostAction}
                  onPress={() => setNewPostContent(prev => prev + '📚 ')}
                >
                  <FileText size={20} color={colors.secondary} />
                  <Text style={styles.createPostActionText}>Share Resource</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.createPostAction}
                  onPress={() => setNewPostContent(prev => prev + '💭 ')}
                >
                  <Users size={20} color={colors.warning} />
                  <Text style={styles.createPostActionText}>Start Discussion</Text>
                </TouchableOpacity>
              </View>
            </View>
            </Card>
        </View>

        {/* Posts Feed Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          
          {posts.length > 0 ? (
            posts.map(post => (
              <Card key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    {post.userProfilePicture ? (
                      <Image 
                        source={{ uri: post.userProfilePicture }} 
                        style={styles.avatarImage} 
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {post.userName.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.postInfo}>
                    <Text style={styles.postUserName}>{post.userName}</Text>
                    <Text style={styles.postTimestamp}>
                      {formatTimestamp(post.timestamp)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.postAction}
                    onPress={() => handleLikePost(post.id)}
                  >
                    <ThumbsUp 
                      size={18} 
                      color={post.isLiked ? colors.primary : colors.textSecondary} 
                      fill={post.isLiked ? colors.primary : 'none'}
                    />
                    <Text 
                      style={[
                        styles.postActionText,
                        post.isLiked && { color: colors.primary }
                      ]}
                    >
                      {post.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.postAction}
                    onPress={() => handleCommentPost(post)}
                  >
                    <MessageCircle size={18} color={colors.textSecondary} />
                    <Text style={styles.postActionText}>{post.comments.length}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.postAction}
                    onPress={() => handleSharePost(post)}
                  >
                    <Share2 size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
          </View>
          
                {/* Comments Preview */}
                {post.comments.length > 0 && (
                  <View style={styles.commentsPreview}>
                    <Text style={styles.commentsPreviewTitle}>
                      {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                    </Text>
                    {post.comments.slice(0, 2).map(comment => (
                      <View key={comment.id} style={styles.commentPreview}>
                        <Text style={styles.commentPreviewName}>{comment.userName}</Text>
                        <Text style={styles.commentPreviewText}>{comment.content}</Text>
                      </View>
                    ))}
                    {post.comments.length > 2 && (
                      <TouchableOpacity 
                        style={styles.viewMoreComments}
                        onPress={() => handleCommentPost(post)}
                      >
                        <Text style={styles.viewMoreCommentsText}>
                          View {post.comments.length - 2} more comments
                        </Text>
                      </TouchableOpacity>
                    )}
            </View>
                )}
              </Card>
            ))
          ) : (
            <Card style={styles.emptyStateCard}>
              <Users size={40} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No posts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Be the first to share something with the community!
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={isCommentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity 
                onPress={() => setIsCommentModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedPost && (
              <>
                <View style={styles.selectedPostContainer}>
                  <View style={styles.selectedPostHeader}>
                    <View style={styles.selectedPostAvatar}>
                      {selectedPost.userProfilePicture ? (
                        <Image 
                          source={{ uri: selectedPost.userProfilePicture }} 
                          style={styles.avatarImage} 
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {selectedPost.userName.charAt(0)}
            </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.selectedPostInfo}>
                      <Text style={styles.selectedPostName}>{selectedPost.userName}</Text>
                      <Text style={styles.selectedPostTimestamp}>
                        {formatTimestamp(selectedPost.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.selectedPostContent}>{selectedPost.content}</Text>
                </View>
                
                <ScrollView style={styles.commentsList}>
                  {selectedPost.comments.map(comment => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <View style={styles.commentAvatar}>
                          {comment.userProfilePicture ? (
                            <Image 
                              source={{ uri: comment.userProfilePicture }} 
                              style={styles.avatarImage} 
                            />
                          ) : (
                            <View style={styles.avatarPlaceholder}>
                              <Text style={styles.avatarText}>
                                {comment.userName.charAt(0)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.commentInfo}>
                          <Text style={styles.commentName}>{comment.userName}</Text>
                          <Text style={styles.commentTimestamp}>
                            {formatTimestamp(comment.timestamp)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.commentInputContainer}>
                  <View style={styles.commentInputWrapper}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Write a comment..."
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                    />
                    <TouchableOpacity 
                      style={[
                        styles.commentSubmitButton,
                        !commentText.trim() && styles.commentSubmitButtonDisabled
                      ]}
                      onPress={handleSubmitComment}
                      disabled={!commentText.trim() || isSubmittingComment}
                    >
                      <Send size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Chatroom Modal */}
      <Modal
        visible={isChatroomModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsChatroomModalVisible(false)}
      >
        <SafeAreaView style={styles.fullScreenModal}>
          <LinearGradient
            colors={[colors.primary, colors.info]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradientHeader}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleLight}>Chatrooms</Text>
              <TouchableOpacity 
                onPress={() => setIsChatroomModalVisible(false)}
                style={styles.modalCloseButtonLight}
              >
                <Text style={styles.modalCloseTextLight}>✕</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
            
          {selectedChatroom ? (
            // Chatroom Detail View
            <View style={styles.chatroomDetailContainer}>
              <LinearGradient
                colors={[colors.primary, colors.info]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chatroomDetailGradientHeader}
              >
                <View style={styles.chatroomDetailHeader}>
                  <TouchableOpacity 
                    onPress={() => setSelectedChatroom(null)}
                    style={styles.backButtonLight}
                  >
                    <ChevronRight size={24} color="#FFFFFF" style={styles.backIcon} />
                  </TouchableOpacity>
                  <View style={styles.chatroomDetailInfo}>
                    <Text style={styles.chatroomDetailNameLight}>{selectedChatroom.name}</Text>
                    <Text style={styles.chatroomDetailMembersLight}>
                      {selectedChatroom.memberCount} members
            </Text>
                  </View>
                </View>
              </LinearGradient>
                
              <ScrollView style={styles.messagesList}>
                {chatMessages.map(message => (
                  <View 
                    key={message.id} 
                    style={[
                      styles.messageItem,
                      message.userId === user?.id && styles.ownMessageItem
                    ]}
                  >
                    {message.userId !== user?.id && (
                      <View style={styles.messageAvatar}>
                        {message.userProfilePicture ? (
                          <Image 
                            source={{ uri: message.userProfilePicture }} 
                            style={styles.avatarImage} 
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {message.userName.charAt(0)}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    <View 
                      style={[
                        styles.messageContent,
                        message.userId === user?.id && styles.ownMessageContent
                      ]}
                    >
                      {message.userId !== user?.id && (
                        <Text style={styles.messageName}>{message.userName}</Text>
                      )}
                      <Text style={styles.messageText}>{message.content}</Text>
                      <Text style={styles.messageTimestamp}>
                        {formatTimestamp(message.timestamp)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
                
              <View style={styles.messageInputContainer}>
                <View style={styles.messageInputWrapper}>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Type a message..."
                    value={newMessageText}
                    onChangeText={setNewMessageText}
                    multiline
                  />
                  <TouchableOpacity 
                    style={[
                      styles.messageSubmitButton,
                      !newMessageText.trim() && styles.messageSubmitButtonDisabled
                    ]}
                    onPress={handleSendMessage}
                    disabled={!newMessageText.trim() || isSubmittingMessage}
                  >
                    <Send size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            // Chatroom List View
            <>
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search chatrooms..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>
                
              <ScrollView style={styles.chatroomsList}>
                {filteredChatrooms.map(chatroom => (
                  <TouchableOpacity 
                    key={chatroom.id} 
                    style={styles.chatroomItem}
                    onPress={() => handleOpenChatroom(chatroom)}
                  >
                    <View style={[
                      styles.chatroomIcon,
                      { backgroundColor: getCategoryColor(chatroom.category) }
                    ]}>
                      <Hash size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.chatroomInfo}>
                      <Text style={styles.chatroomName}>{chatroom.name}</Text>
                      <Text style={styles.chatroomDescription} numberOfLines={1}>
                        {chatroom.description}
            </Text>
                      <View style={styles.chatroomMetaInfo}>
                        <View style={styles.chatroomMetaItem}>
                          <Users size={14} color={colors.textSecondary} />
                          <Text style={styles.chatroomMetaText}>
                            {chatroom.memberCount}
                          </Text>
                        </View>
                        <Text style={styles.chatroomMetaDot}>•</Text>
                        <Text style={styles.chatroomMetaText}>
                          Last active {formatTimestamp(chatroom.lastActivity)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={[
                        styles.joinButton,
                        chatroom.isJoined && styles.joinedButton
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleJoinChatroom(chatroom.id);
                      }}
                    >
                      <Text style={[
                        styles.joinButtonText,
                        chatroom.isJoined && styles.joinedButtonText
                      ]}>
                        {chatroom.isJoined ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
                
              <TouchableOpacity 
                style={styles.createChatroomButton}
                onPress={() => setIsCreateChatroomModalVisible(true)}
              >
                <LinearGradient
                  colors={[colors.primary, colors.info]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createChatroomGradient}
                >
                  <Plus size={24} color="#FFFFFF" />
                  <Text style={styles.createChatroomText}>Create New Chatroom</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Create Chatroom Modal */}
      <Modal
        visible={isCreateChatroomModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCreateChatroomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createChatroomModalContent}>
            <LinearGradient
              colors={[colors.primary, colors.info]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createChatroomModalHeader}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitleLight}>Create New Chatroom</Text>
                <TouchableOpacity 
                  onPress={() => setIsCreateChatroomModalVisible(false)}
                  style={styles.modalCloseButtonLight}
                >
                  <Text style={styles.modalCloseTextLight}>✕</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            <ScrollView style={styles.createChatroomForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Chatroom Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter chatroom name"
                  value={newChatroomName}
                  onChangeText={setNewChatroomName}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textAreaInput]}
                  placeholder="Describe what this chatroom is about"
                  value={newChatroomDescription}
                  onChangeText={setNewChatroomDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryContainer}>
                  {(['academic', 'social', 'sports', 'tech', 'other'] as const).map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        newChatroomCategory === category && styles.selectedCategoryButton
                      ]}
                      onPress={() => setNewChatroomCategory(category)}
                    >
                      <Text 
                        style={[
                          styles.categoryButtonText,
                          newChatroomCategory === category && styles.selectedCategoryButtonText
                        ]}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!newChatroomName.trim() || !newChatroomDescription.trim()) && styles.createButtonDisabled
                ]}
                onPress={handleCreateChatroom}
                disabled={!newChatroomName.trim() || !newChatroomDescription.trim() || isCreatingChatroom}
              >
                <LinearGradient
                  colors={[colors.primary, colors.info]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createButtonGradient}
                >
                  {isCreatingChatroom ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.createButtonText}>Create Chatroom</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
      </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper function to get category color
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'academic':
      return colors.primary;
    case 'social':
      return colors.secondary;
    case 'sports':
      return colors.warning;
    case 'tech':
      return colors.info;
    case 'other':
      return colors.success;
    default:
      return colors.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -30,
    marginHorizontal: 20,
    zIndex: 1,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  createPostCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createPostContent: {
    padding: 16,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  postInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  postInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  postButtonDisabled: {
    backgroundColor: colors.border,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  createPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  createPostActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  postInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  postTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  postContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  postActionText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  commentsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentsPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  commentPreview: {
    marginBottom: 8,
  },
  commentPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentPreviewText: {
    fontSize: 14,
    color: colors.text,
  },
  viewMoreComments: {
    marginTop: 4,
  },
  viewMoreCommentsText: {
    fontSize: 14,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedPostContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  selectedPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedPostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden',
  },
  selectedPostInfo: {
    flex: 1,
  },
  selectedPostName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedPostTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedPostContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  commentsList: {
    flex: 1,
    marginBottom: 16,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    overflow: 'hidden',
  },
  commentInfo: {
    flex: 1,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 36,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  commentSubmitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  commentSubmitButtonDisabled: {
    backgroundColor: colors.border,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
  },
  chatroomsList: {
    flex: 1,
  },
  chatroomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatroomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatroomInfo: {
    flex: 1,
  },
  chatroomName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  chatroomDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  chatroomActivity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  joinedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  joinedButtonText: {
    color: colors.primary,
  },
  createChatroomButton: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createChatroomText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  chatroomDetailContainer: {
    flex: 1,
  },
  chatroomDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  chatroomDetailInfo: {
    flex: 1,
    marginLeft: 8,
  },
  chatroomDetailName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatroomDetailMembers: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messagesList: {
    flex: 1,
    marginBottom: 16,
  },
  messageItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ownMessageItem: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  messageContent: {
    maxWidth: '70%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageContent: {
    backgroundColor: colors.primaryLight,
    borderTopRightRadius: 4,
  },
  messageName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  messageTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  messageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: colors.text,
  },
  messageSubmitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageSubmitButtonDisabled: {
    backgroundColor: colors.border,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  createChatroomModalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    marginTop: 50,
  },
  createChatroomForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    margin: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  createButton: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalGradientHeader: {
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalTitleLight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButtonLight: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseTextLight: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  chatroomDetailGradientHeader: {
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  chatroomDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatroomDetailInfo: {
    flex: 1,
    marginLeft: 8,
  },
  chatroomDetailNameLight: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatroomDetailMembersLight: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chatroomMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chatroomMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatroomMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  chatroomMetaDot: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  createChatroomGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 12,
  },
  createChatroomModalHeader: {
    paddingTop: 10,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  createButtonGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  messageContent: {
    maxWidth: '70%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageContent: {
    backgroundColor: colors.primaryLight,
    borderTopRightRadius: 4,
  },
  messageItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  ownMessageItem: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  messageName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  messageTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  messageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: colors.text,
  },
  messageSubmitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageSubmitButtonDisabled: {
    backgroundColor: colors.border,
  },
  chatroomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatroomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  joinedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  joinedButtonText: {
    color: colors.primary,
  },
  searchContainer: {
    margin: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: colors.text,
  },
  createChatroomButton: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createChatroomText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    margin: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  createButton: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});