import React, { useEffect, useRef, useState } from 'react';
import { chatService, type ChatMessage } from '../../services/chatService';
import { getErrorMessage } from '../../utils/helpers';
import '../../styles/chat-widget.css';

const WELCOME_MESSAGE: ChatMessage = {
    role: 'assistant',
    content:
        'Përshëndetje! Unë jam asistenti AutoKosova. Mund t’ju ndihmoj me blerje veturash, qira, llogarinë tuaj dhe navigimin në platformë. Si mund t’ju ndihmoj?',
};

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            inputRef.current?.focus();
        }
    }, [isOpen, messages, isLoading]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) {
            return;
        }

        const userMessage: ChatMessage = { role: 'user', content: trimmed };
        const nextMessages = [...messages, userMessage];

        setMessages(nextMessages);
        setInput('');
        setError(null);
        setIsLoading(true);

        try {
            const history = nextMessages.filter((m) => m.role === 'user' || m.role === 'assistant');
            const response = await chatService.sendMessage(history);
            setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
        } catch (err) {
            setError(getErrorMessage(err, 'Nuk mund të lidhem me asistentin. Nisni API-n dhe vendosni OpenAI:ApiKey.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    };

    return (
        <div className="chat-widget">
            {isOpen && (
                <section className="chat-panel" aria-label="AutoKosova assistant">
                    <header className="chat-panel__header">
                        <div>
                            <p className="chat-panel__title">AutoKosova Assistant</p>
                            <p className="chat-panel__subtitle">Powered by OpenAI</p>
                        </div>
                        <button
                            type="button"
                            className="chat-panel__close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Mbyll chat-in"
                        >
                            ×
                        </button>
                    </header>

                    <div className="chat-panel__messages">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`chat-bubble chat-bubble--${message.role}`}
                            >
                                {message.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                                Duke shkruar…
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {error && <p className="chat-panel__error">{error}</p>}

                    <footer className="chat-panel__footer">
                        <textarea
                            ref={inputRef}
                            className="chat-panel__input"
                            rows={2}
                            placeholder="Shkruani pyetjen tuaj…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="chat-panel__send"
                            onClick={() => void handleSend()}
                            disabled={isLoading || !input.trim()}
                        >
                            Dërgo
                        </button>
                    </footer>
                </section>
            )}

            <button
                type="button"
                className="chat-widget__toggle"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Mbyll asistentin' : 'Hap asistentin AutoKosova'}
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};
