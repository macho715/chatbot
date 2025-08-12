// components/ChatBox.tsx - Enhanced ChatBox with MOSB Entry System support

import React, { useState, useRef, useEffect } from 'react';
import { NaturalLanguageProcessor, CommandIntent, CommandResponse } from '../services/NaturalLanguageProcessor';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  intent?: CommandIntent;
  response?: CommandResponse;
}

interface ChatBoxProps {
  onAction?: (action: string, data?: any) => void;
  className?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onAction, className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '안녕하세요! MOSB Gate Agent AI 어시스턴트입니다. 무엇을 도와드릴까요?',
      isUser: false,
      timestamp: new Date(),
      response: {
        success: true,
        message: '안녕하세요! MOSB Gate Agent AI 어시스턴트입니다. 무엇을 도와드릴까요?',
        action: 'show_welcome',
        suggestions: ['MOSB 신청', 'LPO 조회', '상태 확인', '도움말']
      }
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nlpProcessor = useRef(new NaturalLanguageProcessor());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean, intent?: CommandIntent, response?: CommandResponse) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      intent,
      response
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const processUserInput = async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsProcessing(true);

    // 사용자 메시지 추가
    addMessage(userInput, true);

    try {
      // 자연어 처리로 명령어 의도 파악
      const intent = nlpProcessor.current.processCommand(userInput);

      // 응답 생성
      const response = nlpProcessor.current.generateResponse(intent);

      // AI 응답 메시지 추가
      addMessage(response.message, false, intent, response);

      // 제안사항 업데이트
      setSuggestions(response.suggestions || []);

      // 액션 실행 (부모 컴포넌트에 전달)
      if (onAction && response.action) {
        onAction(response.action, response.data);
      }

    } catch (error) {
      console.error('Error processing user input:', error);
      addMessage('죄송합니다. 명령어를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.', false);
    } finally {
      setIsProcessing(false);
      setInputText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      processUserInput(inputText);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isProcessing) {
        processUserInput(inputText);
      }
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return '높음';
    if (confidence >= 0.6) return '보통';
    return '낮음';
  };

  return React.createElement('div', { className: `bg-white rounded-lg shadow-lg border border-gray-200 ${className}` },
    // 채팅 헤더
    React.createElement('div', { className: "bg-blue-600 text-white px-4 py-3 rounded-t-lg" },
      React.createElement('div', { className: "flex items-center space-x-2" },
        React.createElement('div', { className: "w-3 h-3 bg-green-400 rounded-full animate-pulse" }),
        React.createElement('h3', { className: "font-semibold" }, "MOSB AI Assistant"),
        React.createElement('span', { className: "text-sm opacity-75" }, "실시간 지원")
      )
    ),

    // 메시지 영역
    React.createElement('div', { className: "h-96 overflow-y-auto p-4 space-y-4" },
      messages.map((message) =>
        React.createElement('div', {
          key: message.id,
          className: `flex ${message.isUser ? 'justify-end' : 'justify-start'}`
        },
          React.createElement('div', {
            className: `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.isUser
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`
          },
            React.createElement('div', { className: "text-sm" }, message.text),

            // AI 응답의 경우 추가 정보 표시
            !message.isUser && message.intent && message.response &&
            React.createElement('div', { className: "mt-2 pt-2 border-t border-gray-200" },
              React.createElement('div', { className: "text-xs text-gray-600 space-y-1" },
                React.createElement('div', null,
                  React.createElement('span', { className: "font-medium" }, "인식된 명령:"), " ", message.intent.action
                ),
                message.intent.entity &&
                React.createElement('div', null,
                  React.createElement('span', { className: "font-medium" }, "추출된 정보:"), " ", message.intent.entity
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "font-medium" }, "신뢰도:"),
                  React.createElement('span', { className: `ml-1 ${getConfidenceColor(message.intent.confidence)}` },
                    ` ${getConfidenceText(message.intent.confidence)} (${Math.round(message.intent.confidence * 100)}%)`
                  )
                )
              )
            )
          )
        )
      ),

      isProcessing &&
      React.createElement('div', { className: "flex justify-start" },
        React.createElement('div', { className: "bg-gray-100 text-gray-800 px-4 py-2 rounded-lg" },
          React.createElement('div', { className: "flex items-center space-x-2" },
            React.createElement('div', { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" }),
            React.createElement('span', { className: "text-sm" }, "처리 중...")
          )
        )
      ),

      React.createElement('div', { ref: messagesEndRef })
    ),

    // 제안사항
    suggestions.length > 0 &&
    React.createElement('div', { className: "px-4 pb-2" },
      React.createElement('div', { className: "text-xs text-gray-500 mb-2" }, "추천 명령어:"),
      React.createElement('div', { className: "flex flex-wrap gap-2" },
        suggestions.map((suggestion, index) =>
          React.createElement('button', {
            key: index,
            onClick: () => handleSuggestionClick(suggestion),
            className: "px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
          }, suggestion)
        )
      )
    ),

    // 입력 영역
    React.createElement('form', { onSubmit: handleSubmit, className: "border-t border-gray-200 p-4" },
      React.createElement('div', { className: "flex space-x-2" },
        React.createElement('input', {
          ref: inputRef,
          type: "text",
          value: inputText,
          onChange: (e) => setInputText(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: "자연어로 명령어를 입력하세요... (예: MOSB 신청, LPO 위치 찾기)",
          className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          disabled: isProcessing
        }),
        React.createElement('button', {
          type: "submit",
          disabled: isProcessing || !inputText.trim(),
          className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        }, "전송")
      ),

      // 도움말
      React.createElement('div', { className: "mt-2 text-xs text-gray-500" },
        "💡 ", React.createElement('strong', null, "사용 예시:"), " \"LPO-2024-001234 위치 알려줘\", \"MOSB 신청서 작성하고 싶어요\", \"날씨 확인해줘\""
      )
    )
  );
};

export default ChatBox;
