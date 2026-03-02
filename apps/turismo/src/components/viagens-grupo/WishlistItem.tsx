'use client'

import React from 'react'
import { Heart, ThumbsUp, User } from 'lucide-react'
import { WishlistItem as WishlistItemType } from '../../services/api/viagensGrupoApi'

interface WishlistItemProps {
  item: WishlistItemType
  onVote?: () => void
  canVote?: boolean
}

export function WishlistItem({ item, onVote, canVote = true }: WishlistItemProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-gray-900">{item.descricao}</h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{item.user_name || 'Usuário'}</span>
            <span className="text-gray-400">•</span>
            <span className="capitalize">{item.item_tipo}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full">
            <ThumbsUp className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-600">{item.votos}</span>
          </div>
          {canVote && onVote && (
            <button
              onClick={onVote}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Votar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

