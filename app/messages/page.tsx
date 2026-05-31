'use client';

import { useState } from 'react';
import './messages.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Conversation {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  channel: 'sms' | 'email' | 'system';
  unread: boolean;
  unreadCount?: number;
  phone: string;
  leadStatus: string;
  membership: string;
}

interface ChatMessage {
  id: number;
  direction: 'inbound' | 'outbound' | 'system';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const conversations: Conversation[] = [
  {
    id: 1,
    name: 'John Smith',
    initials: 'JS',
    avatarColor: 'blue',
    lastMessage: "Yes, I'd like to schedule a maintenance visit...",
    time: '2 min ago',
    channel: 'sms',
    unread: true,
    unreadCount: 3,
    phone: '(555) 234-5678',
    leadStatus: 'Hot Lead',
    membership: 'Premium',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    initials: 'SJ',
    avatarColor: 'green',
    lastMessage: 'Thanks for the reminder about my annual tune-up',
    time: '15 min ago',
    channel: 'email',
    unread: true,
    unreadCount: 1,
    phone: '(555) 345-6789',
    leadStatus: 'Warm Lead',
    membership: 'Basic',
  },
  {
    id: 3,
    name: 'Mike Davis',
    initials: 'MD',
    avatarColor: 'purple',
    lastMessage: 'What times are available this Thursday?',
    time: '1 hr ago',
    channel: 'sms',
    unread: true,
    unreadCount: 2,
    phone: '(555) 456-7890',
    leadStatus: 'New Lead',
    membership: 'None',
  },
  {
    id: 4,
    name: 'Emily Chen',
    initials: 'EC',
    avatarColor: 'amber',
    lastMessage: 'The AC unit is making a strange noise again',
    time: '2 hrs ago',
    channel: 'sms',
    unread: false,
    phone: '(555) 567-8901',
    leadStatus: 'Customer',
    membership: 'Premium',
  },
  {
    id: 5,
    name: 'Robert Wilson',
    initials: 'RW',
    avatarColor: 'cyan',
    lastMessage: 'Got the invoice, will pay by Friday',
    time: '3 hrs ago',
    channel: 'email',
    unread: false,
    phone: '(555) 678-9012',
    leadStatus: 'Customer',
    membership: 'Basic',
  },
  {
    id: 6,
    name: 'Lisa Thompson',
    initials: 'LT',
    avatarColor: 'red',
    lastMessage: 'Can you send someone for an emergency repair?',
    time: '4 hrs ago',
    channel: 'sms',
    unread: true,
    unreadCount: 1,
    phone: '(555) 789-0123',
    leadStatus: 'Hot Lead',
    membership: 'None',
  },
  {
    id: 7,
    name: 'David Martinez',
    initials: 'DM',
    avatarColor: 'blue',
    lastMessage: 'How much for a new thermostat installation?',
    time: '5 hrs ago',
    channel: 'email',
    unread: false,
    phone: '(555) 890-1234',
    leadStatus: 'Warm Lead',
    membership: 'None',
  },
  {
    id: 8,
    name: 'Amanda Brown',
    initials: 'AB',
    avatarColor: 'green',
    lastMessage: 'Perfect, see you on Monday at 10am',
    time: 'Yesterday',
    channel: 'sms',
    unread: false,
    phone: '(555) 901-2345',
    leadStatus: 'Customer',
    membership: 'Premium',
  },
  {
    id: 9,
    name: 'James Taylor',
    initials: 'JT',
    avatarColor: 'purple',
    lastMessage: 'Is the warranty still valid for my furnace?',
    time: 'Yesterday',
    channel: 'email',
    unread: true,
    unreadCount: 1,
    phone: '(555) 012-3456',
    leadStatus: 'Customer',
    membership: 'Basic',
  },
  {
    id: 10,
    name: 'Karen White',
    initials: 'KW',
    avatarColor: 'amber',
    lastMessage: "I'll think about the maintenance plan offer",
    time: '2 days ago',
    channel: 'sms',
    unread: false,
    phone: '(555) 123-4567',
    leadStatus: 'Cold Lead',
    membership: 'None',
  },
];

const chatMessagesMap: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      direction: 'outbound',
      text: "Hi John, we noticed you called earlier but we weren't able to connect. How can we help you today?",
      time: '10:15 AM',
      status: 'delivered',
    },
    {
      id: 2,
      direction: 'inbound',
      text: 'Hey! Yeah, I called about my AC unit. It stopped blowing cold air this morning and the house is getting pretty warm.',
      time: '10:22 AM',
    },
    {
      id: 3,
      direction: 'outbound',
      text: "I'm sorry to hear that, John. That sounds uncomfortable — especially with this heat. Let me get some info so we can get a technician out to you quickly.",
      time: '10:24 AM',
      status: 'delivered',
    },
    {
      id: 4,
      direction: 'inbound',
      text: "Sure, what do you need? It's a Carrier unit, about 4 years old. Model is 24ACC636A003.",
      time: '10:26 AM',
    },
    {
      id: 5,
      direction: 'system',
      text: '🤖 AI auto-response triggered — appointment suggestion prepared',
      time: '10:26 AM',
    },
    {
      id: 6,
      direction: 'outbound',
      text: 'Thanks for that info! Based on your description, it could be a refrigerant or compressor issue. We have a technician available today between 2–4 PM or tomorrow morning 9–11 AM. Which works better for you?',
      time: '10:27 AM',
      status: 'delivered',
    },
    {
      id: 7,
      direction: 'inbound',
      text: "Today would be great! The 2–4 PM slot works. I'll be home.",
      time: '10:30 AM',
    },
    {
      id: 8,
      direction: 'outbound',
      text: "You're all set, John! 🎉 Tech Mike will be there between 2–4 PM today. He'll text you 30 min before arrival. As a Premium member, your diagnostic fee is waived.",
      time: '10:31 AM',
      status: 'read',
    },
    {
      id: 9,
      direction: 'inbound',
      text: 'Awesome, that Premium membership is already paying for itself. Thanks!',
      time: '10:33 AM',
    },
    {
      id: 10,
      direction: 'outbound',
      text: "Happy to help! 😊 If you need anything before the appointment, just text us here. Stay cool — help is on the way!",
      time: '10:34 AM',
      status: 'delivered',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Channel helpers                                                    */
/* ------------------------------------------------------------------ */

const channelIcon = (ch: 'sms' | 'email' | 'system') => {
  if (ch === 'sms') return '📱';
  if (ch === 'email') return '📧';
  return '⚙️';
};

const statusIcon = (s?: 'sent' | 'delivered' | 'read') => {
  if (s === 'read') return '✓✓';
  if (s === 'delivered') return '✓✓';
  if (s === 'sent') return '✓';
  return '';
};

type ChannelTab = 'all' | 'sms' | 'email' | 'system';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<ChannelTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [composerText, setComposerText] = useState('');
  const [channelSelect, setChannelSelect] = useState<'sms' | 'email'>('sms');

  /* Derived state */
  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const chatMessages = chatMessagesMap[selected.id] ?? [];

  const filteredConversations = conversations.filter((c) => {
    const matchesTab = activeTab === 'all' || c.channel === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs: { key: ChannelTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'sms', label: 'SMS' },
    { key: 'email', label: 'Email' },
    { key: 'system', label: 'System' },
  ];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="messages-page">
      {/* ============ LEFT PANEL ============ */}
      <div className="msg-left-panel">
        {/* Header */}
        <div className="msg-left-header">
          <div className="msg-left-header-top">
            <div className="msg-left-title">
              <h2>Messages</h2>
              <span className="msg-unread-badge">12</span>
            </div>
            <button className="msg-compose-btn" title="New message">
              ✏️
            </button>
          </div>

          {/* Search */}
          <div className="msg-search-wrapper">
            <span className="msg-search-icon">🔍</span>
            <input
              className="msg-search-input"
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="msg-channel-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`msg-channel-tab${activeTab === t.key ? ' msg-channel-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="msg-conversation-list">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`msg-conversation-item${conv.id === selectedId ? ' msg-conversation-item--selected' : ''}`}
              onClick={() => setSelectedId(conv.id)}
            >
              <div className={`msg-avatar msg-avatar--${conv.avatarColor}`}>
                {conv.initials}
              </div>

              <div className="msg-conversation-content">
                <div className="msg-conversation-top">
                  <span className="msg-conversation-name">{conv.name}</span>
                  <span
                    className={`msg-conversation-time${conv.unread ? ' msg-conversation-time--unread' : ''}`}
                  >
                    {conv.time}
                  </span>
                </div>
                <div className="msg-conversation-bottom">
                  <span className="msg-conversation-channel">
                    {channelIcon(conv.channel)}
                  </span>
                  <span
                    className={`msg-conversation-preview${conv.unread ? ' msg-conversation-preview--unread' : ''}`}
                  >
                    {conv.lastMessage}
                  </span>
                </div>
              </div>

              <div className="msg-conversation-meta">
                {conv.unread && <span className="msg-unread-dot" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ RIGHT PANEL ============ */}
      <div className="msg-right-panel">
        {/* Chat Header */}
        <div className="msg-chat-header">
          <div className="msg-chat-header-left">
            <div className={`msg-avatar msg-avatar--${selected.avatarColor}`}>
              {selected.initials}
            </div>
            <div className="msg-chat-header-info">
              <h3>{selected.name}</h3>
              <div className="msg-chat-header-details">
                <span className="msg-chat-header-phone">{selected.phone}</span>
                <span className="msg-chat-status-badge msg-chat-status-badge--lead">
                  {selected.leadStatus}
                </span>
                {selected.membership !== 'None' && (
                  <span className="msg-chat-status-badge msg-chat-status-badge--member">
                    {selected.membership}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="msg-chat-header-actions">
            <button className="msg-header-action-btn">
              👤 View Profile
            </button>
            <button className="msg-header-action-btn msg-header-action-btn--primary">
              📞 Call
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        {chatMessages.length > 0 ? (
          <div className="msg-chat-area">
            {/* Date separator */}
            <div className="msg-date-separator">
              <span>Today · May 31, 2026</span>
            </div>

            {chatMessages.map((msg) => {
              if (msg.direction === 'system') {
                return (
                  <div key={msg.id} className="msg-system-message">
                    <div className="msg-system-message-content">{msg.text}</div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`msg-bubble-row msg-bubble-row--${msg.direction}`}
                >
                  <div className={`msg-bubble msg-bubble--${msg.direction}`}>
                    <p className="msg-bubble-text">{msg.text}</p>
                    <div className="msg-bubble-footer">
                      <span className="msg-bubble-time">{msg.time}</span>
                      {msg.direction === 'outbound' && msg.status && (
                        <span className="msg-bubble-status">
                          {statusIcon(msg.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="msg-empty-state">
            <span className="msg-empty-state-icon">💬</span>
            <h3>No messages yet</h3>
            <p>Start the conversation by sending a message below.</p>
          </div>
        )}

        {/* Composer */}
        <div className="msg-composer">
          <div className="msg-composer-row">
            <div className="msg-composer-input-wrapper">
              <input
                className="msg-composer-input"
                type="text"
                placeholder="Type your message..."
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
              />
            </div>

            <div className="msg-composer-actions">
              <select
                className="msg-channel-select"
                value={channelSelect}
                onChange={(e) => setChannelSelect(e.target.value as 'sms' | 'email')}
              >
                <option value="sms">📱 SMS</option>
                <option value="email">📧 Email</option>
              </select>

              <button className="msg-ai-suggest-btn">✨ AI Suggest</button>
              <button className="msg-send-btn">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
