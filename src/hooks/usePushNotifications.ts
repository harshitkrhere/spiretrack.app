import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// VAPID public key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BMbtVAn0eg28SCJos_dummy_key_replace_in_env';

interface PushState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'unsupported';
  loading: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'unsupported',
    loading: true
  });

  // Check if push is supported and if user is already subscribed
  useEffect(() => {
    const checkSupport = async () => {
      // Check basic browser support
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      
      if (!isSupported) {

        setState(prev => ({ ...prev, isSupported: false, loading: false }));
        return;
      }

      const permission = Notification.permission;
      
      // Register service worker if not already registered (important for page refresh)
      let isSubscribed = false;
      try {
        // First, register the service worker if needed
        let registration = await navigator.serviceWorker.getRegistration('/sw.js');
        
        if (!registration) {

          registration = await navigator.serviceWorker.register('/sw.js');
        }
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        
        // Now check for existing subscription
        const subscription = await registration.pushManager.getSubscription();
        isSubscribed = !!subscription;
        

      } catch (e) {

      }
      

      
      setState({
        isSupported: true,
        isSubscribed,
        permission,
        loading: false
      });
    };

    checkSupport();
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, []);

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user) return false;

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission, loading: false }));
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) throw new Error('Service Worker registration failed');

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Save subscription to database
      const subscriptionJson = subscription.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys?.p256dh,
        auth: subscriptionJson.keys?.auth,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;

      setState({
        isSupported: true,
        isSubscribed: true,
        permission: 'granted',
        loading: false
      });

      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [user, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [user]);

  return {
    ...state,
    subscribe,
    unsubscribe
  };
}
