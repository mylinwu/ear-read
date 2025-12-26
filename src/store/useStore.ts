import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CourseResource, PlayerState, ReadingSettings, Subscription } from '../types';

interface AppState extends PlayerState {
  // 订阅相关
  subscription?: Subscription;
  setSubscription: (sub: Subscription) => void;
  clearSubscription: () => void;

  // 播放器操作
  setCurrentResource: (courseId: string, resourceId: string, playlist: CourseResource[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  
  // 播放列表操作
  removeFromPlaylist: (id: string) => void;
  clearPlaylist: () => void;
  
  // 学习记录更新
  markAsLearned: (courseId: string, resourceId: string) => void;
  updateProgress: (courseId: string, resourceId: string, time: number) => void;

  // 阅读设置
  readingSettings: ReadingSettings;
  setReadingSettings: (settings: ReadingSettings) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始状态
      isPlaying: false,
      playbackRate: 1,
      playlist: [],
      currentTime: 0,
      duration: 0,
      isLoading: false,
      
      subscription: undefined,

      setSubscription: (sub) => set({ subscription: sub }),
      clearSubscription: () => set({ subscription: undefined }),

      readingSettings: {
        fontSize: 16,
        lineHeight: 1.8
      },
      setReadingSettings: (settings) => set({ readingSettings: settings }),

      setCurrentResource: (courseId, resourceId, playlist) => 
        set({ 
          currentCourseId: courseId, 
          currentResourceId: resourceId, 
          playlist,
          isPlaying: true // 切换时通常直接播放
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

      markAsLearned: (courseId, resourceId) => set((state) => {
        if (!state.subscription) return state;
        const newCourses = state.subscription.courses.map(course => {
          if (course.id === courseId) {
            return {
              ...course,
              resources: course.resources.map(res => 
                res.id === resourceId ? { ...res, isLearned: true, currentTime: 0 } : res
              )
            };
          }
          return course;
        });
        return { subscription: { ...state.subscription, courses: newCourses } };
      }),

      updateProgress: (courseId, resourceId, time) => set((state) => {
        if (!state.subscription) return state;
        const newCourses = state.subscription.courses.map(course => {
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
        });
        return { subscription: { ...state.subscription, courses: newCourses } };
      }),
    }),
    {
      name: 'ear-read-storage',
      partialize: (state) => ({ 
        subscription: state.subscription,
        playbackRate: state.playbackRate,
        currentCourseId: state.currentCourseId,
        currentResourceId: state.currentResourceId,
        playlist: state.playlist,
        readingSettings: state.readingSettings
      }),
    }
  )
);
