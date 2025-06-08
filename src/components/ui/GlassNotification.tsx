'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: (id: string) => void;
}

const notificationIcons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const notificationColors = {
  success: 'text-success border-success/20',
  error: 'text-error border-error/20',
  warning: 'text-warning border-warning/20',
  info: 'text-primary border-primary/20',
};

export function GlassNotification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAnimationComplete = () => {
    if (!isVisible && onClose) {
      onClose(id);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onAnimationComplete={handleAnimationComplete}
          className={`
            glass-strong backdrop-blur-lg rounded-xl p-4
            border ${notificationColors[type]}
            shadow-xl min-w-[320px] max-w-md
            relative overflow-hidden
          `}
        >
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}

          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${notificationColors[type]}`}>
              {notificationIcons[type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-primary">{title}</h4>
              {message && (
                <p className="mt-1 text-sm text-secondary">{message}</p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="
                flex-shrink-0 p-1 rounded-lg
                glass-subtle hover:glass
                hover:border-white/30 transition-all
              "
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Notification container
interface NotificationContainerProps {
  notifications: NotificationProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose?: (id: string) => void;
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function GlassNotificationContainer({
  notifications,
  position = 'top-right',
  onClose,
}: NotificationContainerProps) {
  return (
    <div className={`fixed z-50 ${positionClasses[position]}`}>
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((notification) => (
            <GlassNotification
              key={notification.id}
              {...notification}
              onClose={onClose}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Hook for managing notifications
export function useGlassNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    const notification: NotificationProps = {
      id,
      type,
      title,
      message,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const notify = {
    success: (title: string, message?: string, duration?: number) =>
      addNotification('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      addNotification('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      addNotification('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      addNotification('info', title, message, duration),
  };

  return {
    notifications,
    notify,
    removeNotification,
  };
}