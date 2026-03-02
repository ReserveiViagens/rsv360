"use client";

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  showThemeToggle?: boolean;
  showUserMenu?: boolean;
  className?: string;
}

export function Header({
  title = "RSV 360",
  showThemeToggle = true,
  showUserMenu = true,
  className = ""
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo e Título */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RSV</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">{title}</span>
          </Link>
        </div>

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/hoteis"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Hotéis
          </Link>
          <Link
            href="/promocoes"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Promoções
          </Link>
          <Link
            href="/atracoes"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Atrações
          </Link>
          <Link
            href="/contato"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contato
          </Link>
        </nav>

        {/* Ações do Header */}
        <div className="flex items-center space-x-2">
          {/* Toggle de Tema */}
          {showThemeToggle && <ThemeToggle />}

          {/* Menu do Usuário */}
          {showUserMenu && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-9 w-9"
                aria-label="Menu do usuário"
              >
                <User className="h-4 w-4" />
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/cms"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      CMS
                    </Link>
                    <hr className="my-1" />
                    <Link
                      href="/dashboard/financeiro"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Financeiro
                    </Link>
                    <Link
                      href="/dashboard/contabil"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Contábil
                    </Link>
                    <Link
                      href="/dashboard/split-config"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Config. de Divisão
                    </Link>
                    <Link
                      href="/dashboard/tributacao"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Tributação
                    </Link>
                    <Link
                      href="/dashboard/incentivos"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Incentivos
                    </Link>
                    <Link
                      href="/dashboard/simulador"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Simulador Tributário
                    </Link>
                    <hr className="my-1" />
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // Implementar logout
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Menu Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu mobile"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container px-4 py-4 space-y-2">
            <Link
              href="/hoteis"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hotéis
            </Link>
            <Link
              href="/promocoes"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Promoções
            </Link>
            <Link
              href="/atracoes"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Atrações
            </Link>
            <Link
              href="/contato"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contato
            </Link>
            {showUserMenu && (
              <>
                <hr className="my-2" />
                <Link
                  href="/admin/dashboard"
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/cms"
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CMS
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
