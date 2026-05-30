import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PREFIX = 'chat_draft_';

/**
 * Save a draft message for a specific chat
 * @param {string} chatId - Unique identifier for the chat (user ID or room ID)
 * @param {string} draftText - The draft text to save
 * @param {number} timestamp - Timestamp when the draft was saved
 */
export const saveChatDraft = async (chatId, draftText, timestamp = Date.now()) => {
  try {
    if (!chatId) return;
    
    const draftKey = `${DRAFT_PREFIX}${chatId}`;
    const draftData = {
      text: draftText,
      timestamp: timestamp,
      chatId: chatId
    };
    
    await AsyncStorage.setItem(draftKey, JSON.stringify(draftData));
    console.log('Draft saved for chat:', chatId);
  } catch (error) {
    console.error('Error saving chat draft:', error);
  }
};

/**
 * Load a draft message for a specific chat
 * @param {string} chatId - Unique identifier for the chat
 * @returns {Object|null} - Draft data or null if no draft exists
 */
export const loadChatDraft = async (chatId) => {
  try {
    if (!chatId) return null;
    
    const draftKey = `${DRAFT_PREFIX}${chatId}`;
    const draftData = await AsyncStorage.getItem(draftKey);
    
    if (draftData) {
      const parsed = JSON.parse(draftData);
      console.log('Draft loaded for chat:', chatId);
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading chat draft:', error);
    return null;
  }
};

/**
 * Clear a draft message for a specific chat
 * @param {string} chatId - Unique identifier for the chat
 */
export const clearChatDraft = async (chatId) => {
  try {
    if (!chatId) return;
    
    const draftKey = `${DRAFT_PREFIX}${chatId}`;
    await AsyncStorage.removeItem(draftKey);
    console.log('Draft cleared for chat:', chatId);
  } catch (error) {
    console.error('Error clearing chat draft:', error);
  }
};

/**
 * Get all chat drafts (useful for cleanup or debugging)
 * @returns {Array} - Array of all draft objects
 */
export const getAllChatDrafts = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const draftKeys = keys.filter(key => key.startsWith(DRAFT_PREFIX));
    
    if (draftKeys.length === 0) return [];
    
    const drafts = await AsyncStorage.multiGet(draftKeys);
    return drafts
      .map(([key, value]) => {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error('Error parsing draft:', error);
          return null;
        }
      })
      .filter(draft => draft !== null);
  } catch (error) {
    console.error('Error getting all chat drafts:', error);
    return [];
  }
};

/**
 * Clear all chat drafts (useful for cleanup)
 */
export const clearAllChatDrafts = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const draftKeys = keys.filter(key => key.startsWith(DRAFT_PREFIX));
    
    if (draftKeys.length > 0) {
      await AsyncStorage.multiRemove(draftKeys);
      console.log('All chat drafts cleared');
    }
  } catch (error) {
    console.error('Error clearing all chat drafts:', error);
  }
};

/**
 * Clean up old drafts (older than specified days)
 * @param {number} daysOld - Number of days after which drafts should be considered old
 */
export const cleanupOldDrafts = async (daysOld = 7) => {
  try {
    const drafts = await getAllChatDrafts();
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    const oldDrafts = drafts.filter(draft => draft.timestamp < cutoffTime);
    
    for (const draft of oldDrafts) {
      await clearChatDraft(draft.chatId);
    }
    
    console.log(`Cleaned up ${oldDrafts.length} old drafts`);
  } catch (error) {
    console.error('Error cleaning up old drafts:', error);
  }
}; 