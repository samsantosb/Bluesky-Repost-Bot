export interface ResponseListNotifications {
  cursor: string;
  notifications: Notification[];
  priority: boolean;
  seenAt: string;
}

export interface Notification {
  uri: string;
  cid: string;
  author: Author;
  reason: string;
  reasonSubject: string;
  record: {};
  isRead: boolean;
  indexedAt: string;
}

export interface Author {
  did: string;
  handle: string;
  displayName: string;
  description: string;
  avatar: string;
  indexedAt: string;
  createdAt: string;
}




