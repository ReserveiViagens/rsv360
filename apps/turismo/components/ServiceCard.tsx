import * as React from "react";
import { useState } from "react";
import { cn } from "../lib/utils";
import {
  Activity,
  ArrowUpRight,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Server,
  DollarSign,
  Users,
  MapPin,
  Camera,
  Video,
  FileText,
  BarChart3,
  Bell,
  Star,
  Gift,
  CreditCard,
  Globe,
  Shield,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Layers,
  Database,
  Cloud,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  XCircle,
  User,
  Hotel,
  Plane,
  Car,
  Award,
  Target
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  status?: "online" | "offline" | "maintenance" | "warning";
  icon?: React.ReactNode;
  metrics?: {
    label: string;
    value: string;
    unit?: string;
  }[];
  lastUpdate?: string;
  port?: number;
  serviceId?: string;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onConfigure?: () => void;
  onViewDetails?: () => void;
  onAccess?: () => void;
}

const statusConfig = {
  online: {
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
    label: "Online"
  },
  offline: {
    color: "bg-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: WifiOff,
    label: "Offline"
  },
  maintenance: {
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: Settings,
    label: "Maintenance"
  },
  warning: {
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: AlertCircle,
    label: "Warning"
  }
};

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({
    className,
    title = "RSV Analytics Service",
    description = "Real-time data processing and analytics engine for the RSV 360 Ecosystem",
    status = "online",
    icon,
    metrics = [
      { label: "CPU", value: "45", unit: "%" },
      { label: "Memory", value: "2.1", unit: "GB" },
      { label: "Requests", value: "1.2k", unit: "/min" }
    ],
    lastUpdate = "2 minutes ago",
    port,
    serviceId,
    onStart,
    onStop,
    onRestart,
    onConfigure,
    onViewDetails,
    onAccess,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const statusInfo = statusConfig[status];
    const StatusIcon = statusInfo.icon;

    const handleAction = async (action: () => void | undefined) => {
      if (!action) return;
      setIsLoading(true);
      try {
        await action();
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group relative w-full max-w-md",
          "bg-white border border-gray-200 rounded-2xl",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:shadow-black/5",
          "hover:-translate-y-1",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Status indicator line */}
        <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-2xl", statusInfo.color)} />

        {/* Card content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                statusInfo.bgColor
              )}>
                {icon || <Activity className={cn("w-5 h-5", statusInfo.textColor)} />}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                  {title}
                </h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium",
                    statusInfo.textColor,
                    statusInfo.bgColor
                  )}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            {/* Real-time indicator */}
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                status === "online" ? "bg-emerald-500" : "bg-gray-400"
              )} />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>

          {/* Service Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {port && (
              <span>Porta: {port}</span>
            )}
            {serviceId && (
              <span>ID: {serviceId}</span>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center space-y-1">
                <div className="text-lg font-bold text-gray-800">
                  {metric.value}
                  {metric.unit && (
                    <span className="text-xs text-gray-500 ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Actions */}
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(onAccess)}
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Acessar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(onConfigure)}
                disabled={isLoading}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Atualizado {lastUpdate}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
                className={cn(
                  "text-xs transition-all duration-200 text-gray-600 hover:text-gray-800",
                  isHovered && "translate-x-1"
                )}
              >
                Ver Detalhes
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ServiceCard.displayName = "ServiceCard";

export { ServiceCard };
