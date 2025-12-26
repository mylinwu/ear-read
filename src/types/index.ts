/**
 * 节目资源（单个课时）的类型定义
 */
export interface CourseResource {
  /** 资源唯一ID */
  id: string;
  /** 资源/课时标题 */
  title: string;
  /** 音频文件路径 */
  audio_file?: string;
  /** 内容文件路径, 是一个 Markdown 文件地址 */
  content_file?: string;
  /** 是否已学过 */
  isLearned?: boolean;
  /** 上次播放停止的时间点（秒） */
  currentTime?: number;
}

/**
 * 课程的类型定义
 */
export interface Course {
  /** 课程唯一ID */
  id: string;
  /** 课程总标题 */
  title: string;
  /** 封面图 (可选) */
  cover?: string;
  /** 课程下的资源/课时列表 */
  resources: CourseResource[];
  /** 最近学习的节目ID */
  lastResourceId?: string;
}

/**
 * 订阅信息定义
 */
export interface Subscription {
  url: string;
  lastUpdatedAt: string;
  courses: Course[];
}

/**
 * 课程数据列表的类型定义
 */
export type CourseData = Course[];

/**
 * 播放器状态定义
 */
export interface PlayerState {
  currentCourseId?: string;
  currentResourceId?: string;
  isPlaying: boolean;
  playbackRate: number;
  playlist: CourseResource[];
  currentTime: number;
  duration: number;
  isLoading: boolean;
}

/**
 * 阅读设置定义
 */
export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
}
