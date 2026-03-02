'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { Bot } from 'lucide-react'

interface Chatbot {
  id: number;
  name: string;
  status: string;
  messages_handled: number;
  created_at: string;
}

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await api.get('/api/v1/chatbots');
        setChatbots(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching chatbots:', err);
        setChatbots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChatbots();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-cyan-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chatbots</h1>
            <p className="text-gray-600 mt-1">Gestão de chatbots</p>
          </div>
        </div>

        {chatbots.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhum chatbot encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map(chatbot => (
              <div key={chatbot.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{chatbot.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    chatbot.status === 'active' ? 'bg-green-100 text-green-800' :
                    chatbot.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {chatbot.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Mensagens processadas: <span className="font-medium">{chatbot.messages_handled || 0}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(chatbot.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
