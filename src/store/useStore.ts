"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CourseResource, HistoryItem, PlayerState, ReadingSettings, SubscriptionItem, ThemeMode } from '../types';

// 生成唯一ID的辅助函数
const generateId = () => Math.random().toString(36).substring(2, 15);

interface AppState extends PlayerState {
  // 多订阅相关
  subscriptions: SubscriptionItem[];
  addSubscription: (sub: Omit<SubscriptionItem, 'id'>) => string; // 返回新订阅的ID
  updateSubscription: (id: string, sub: Partial<SubscriptionItem>) => void;
  removeSubscription: (id: string) => void;
  refreshSubscription: (id: string, courses: SubscriptionItem['courses']) => void;

  // 兼容旧版 (deprecated)
  /** @deprecated 使用 subscriptions 代替 */
  subscription?: { url: string; lastUpdatedAt: string; courses: SubscriptionItem['courses'] };
  /** @deprecated 使用 addSubscription 代替 */
  setSubscription: (sub: { url: string; lastUpdatedAt: string; courses: SubscriptionItem['courses'] }) => void;
  /** @deprecated 使用 removeSubscription 代替 */
  clearSubscription: () => void;

  // 播放器操作
  setCurrentResource: (subscriptionId: string, courseId: string, resourceId: string, playlist: CourseResource[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  
  // 播放列表操作
  removeFromPlaylist: (id: string) => void;
  clearPlaylist: () => void;
  
  // 学习记录更新
  markAsLearned: (subscriptionId: string, courseId: string, resourceId: string) => void;
  updateProgress: (subscriptionId: string, courseId: string, resourceId: string, time: number) => void;

  // 阅读设置
  readingSettings: ReadingSettings;
  setReadingSettings: (settings: ReadingSettings) => void;

  // 主题设置
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // 辅助方法
  getAllCourses: () => { subscriptionId: string; subscriptionName: string; course: SubscriptionItem['courses'][0] }[];
  getSubscriptionById: (id: string) => SubscriptionItem | undefined;

  // 播放历史
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'playedAt'>) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isPlaying: false,
      playbackRate: 1,
      playlist: [],
      currentTime: 0,
      duration: 0,
      isLoading: false,
      
      subscriptions: [],
      subscription: undefined, // 兼容旧版
      history: [],

      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),

      readingSettings: {
        fontSize: 16,
        lineHeight: 1.8
      },
      setReadingSettings: (settings) => set({ readingSettings: settings }),

      // 多订阅管理
      addSubscription: (sub) => {
        const id = generateId();
        set((state) => ({
          subscriptions: [...state.subscriptions, { ...sub, id }]
        }));
        return id;
      },

      updateSubscription: (id, updates) => set((state) => ({
        subscriptions: state.subscriptions.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),

      removeSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter(s => s.id !== id)
      })),

      refreshSubscription: (id, courses) => set((state) => ({
        subscriptions: state.subscriptions.map(s => 
          s.id === id ? { ...s, courses, lastUpdatedAt: new Date().toISOString() } : s
        )
      })),

      // 兼容旧版的方法
      setSubscription: (sub) => {
        const state = get();
        // 如果已有订阅，更新它；否则添加新订阅
        const existingSub = state.subscriptions.find(s => s.url === sub.url);
        if (existingSub) {
          set((state) => ({
            subscriptions: state.subscriptions.map(s => 
              s.url === sub.url ? { ...s, courses: sub.courses, lastUpdatedAt: sub.lastUpdatedAt } : s
            ),
            subscription: sub
          }));
        } else {
          const id = generateId();
          set((state) => ({
            subscriptions: [...state.subscriptions, {
              id,
              name: '默认订阅',
              url: sub.url,
              lastUpdatedAt: sub.lastUpdatedAt,
              courses: sub.courses
            }],
            subscription: sub
          }));
        }
      },

      clearSubscription: () => set({ subscription: undefined, subscriptions: [] }),

      // 播放器操作 - 更新为支持多订阅
      setCurrentResource: (subscriptionId, courseId, resourceId, playlist) => 
        set({ 
          currentSubscriptionId: subscriptionId,
          currentCourseId: courseId, 
          currentResourceId: resourceId, 
          playlist,
          isPlaying: true
        }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration: duration }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      removeFromPlaylist: (id) => set((state) => {
        const newList = state.playlist.filter(item => item.id !== id);
        const isRemovingCurrent = state.currentResourceId === id;
        return { 
          playlist: newList,
          ...(isRemovingCurrent ? { currentResourceId: undefined, isPlaying: false } : {})
        };
      }),
      
      clearPlaylist: () => set({ playlist: [], currentResourceId: undefined, isPlaying: false }),

      // 学习记录 - 更新为支持多订阅
      markAsLearned: (subscriptionId, courseId, resourceId) => set((state) => {
        const newSubscriptions = state.subscriptions.map(sub => {
          if (sub.id === subscriptionId) {
            return {
              ...sub,
              courses: sub.courses.map(course => {
                if (course.id === courseId) {
                  return {
                    ...course,
                    resources: course.resources.map(res => 
                      res.id === resourceId ? { ...res, isLearned: true, currentTime: 0 } : res
                    )
                  };
                }
                return course;
              })
            };
          }
          return sub;
        });
        return { subscriptions: newSubscriptions };
      }),

      updateProgress: (subscriptionId, courseId, resourceId, time) => set((state) => {
        const newSubscriptions = state.subscriptions.map(sub => {
          if (sub.id === subscriptionId) {
            return {
              ...sub,
              courses: sub.courses.map(course => {
                if (course.id === courseId) {
                  return {
                    ...course,
                    lastResourceId: resourceId,
                    resources: course.resources.map(res => 
                      res.id === resourceId ? { ...res, currentTime: time } : res
                    )
                  };
                }
                return course;
              })
            };
          }
          return sub;
        });
        return { subscriptions: newSubscriptions };
      }),

      // 辅助方法
      getAllCourses: () => {
        const state = get();
        const result: { subscriptionId: string; subscriptionName: string; course: SubscriptionItem['courses'][0] }[] = [];
        state.subscriptions.forEach(sub => {
          sub.courses.forEach(course => {
            if (course.resources && course.resources.length > 0) {
              result.push({
                subscriptionId: sub.id,
                subscriptionName: sub.name,
                course
              });
            }
          });
        });
        return result;
      },

      getSubscriptionById: (id) => {
        return get().subscriptions.find(s => s.id === id);
      },

      // 播放历史
      addToHistory: (item) => set((state) => {
        // 移除重复项（同一个资源）
        const filtered = state.history.filter(
          h => !(h.subscriptionId === item.subscriptionId && h.courseId === item.courseId && h.resourceId === item.resourceId)
        );
        // 添加新记录到开头，限制最多100条
        const newHistory = [{ ...item, playedAt: new Date().toISOString() }, ...filtered].slice(0, 100);
        return { history: newHistory };
      }),

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'ear-read-storage',
      partialize: (state) => ({ 
        subscriptions: state.subscriptions,
        subscription: state.subscription, // 兼容旧版
        playbackRate: state.playbackRate,
        currentSubscriptionId: state.currentSubscriptionId,
        currentCourseId: state.currentCourseId,
        currentResourceId: state.currentResourceId,
        playlist: state.playlist,
        readingSettings: state.readingSettings,
        themeMode: state.themeMode,
        history: state.history
      }),
    }
  )
);
