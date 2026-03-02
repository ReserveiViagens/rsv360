"use client";

import { useState, useEffect, useCallback } from "react";

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  entityName?: string;
  details?: string;
  timestamp: Date;
  user?: string;
  ip?: string;
}

const STORAGE_KEY = "admin_activity_logs";
const MAX_LOGS = 1000; // Limitar a 1000 logs

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Carregar logs do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Converter timestamps de string para Date
          const logsWithDates = parsed.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
          setLogs(logsWithDates);
        }
      } catch (error) {
        console.error("Erro ao carregar logs:", error);
      }
    }
  }, []);

  // Salvar logs no localStorage
  const saveLogs = useCallback((newLogs: ActivityLog[]) => {
    if (typeof window !== "undefined") {
      try {
        // Limitar quantidade de logs
        const logsToSave = newLogs.slice(-MAX_LOGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToSave));
        setLogs(logsToSave);
      } catch (error) {
        console.error("Erro ao salvar logs:", error);
      }
    }
  }, []);

  // Adicionar novo log
  const addLog = useCallback(
    (action: string, entity: string, options?: {
      entityId?: string;
      entityName?: string;
      details?: string;
      user?: string;
    }) => {
      const newLog: ActivityLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        entity,
        entityId: options?.entityId,
        entityName: options?.entityName,
        details: options?.details,
        timestamp: new Date(),
        user: options?.user || "admin",
        ip: typeof window !== "undefined" ? "client" : undefined,
      };

      const updatedLogs = [...logs, newLog];
      saveLogs(updatedLogs);
    },
    [logs, saveLogs]
  );

  // Limpar logs
  const clearLogs = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setLogs([]);
    }
  }, []);

  // Filtrar logs
  const getLogsByEntity = useCallback(
    (entity: string) => {
      return logs.filter((log) => log.entity === entity);
    },
    [logs]
  );

  const getLogsByAction = useCallback(
    (action: string) => {
      return logs.filter((log) => log.action === action);
    },
    [logs]
  );

  const getRecentLogs = useCallback(
    (limit: number = 50) => {
      return logs.slice(-limit).reverse();
    },
    [logs]
  );

  return {
    logs,
    addLog,
    clearLogs,
    getLogsByEntity,
    getLogsByAction,
    getRecentLogs,
    totalLogs: logs.length,
  };
}

