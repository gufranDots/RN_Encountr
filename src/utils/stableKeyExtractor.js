const CANDIDATE_KEY_FIELDS = [
  'id',
  '_id',
  'uid',
  'user_id',
  'chat_id',
  'chat_room_id',
  'room_id',
  'request_id',
  'message_id',
  'conversation_id',
  'group_id',
  'created_at',
  'updated_at',
  'email',
  'phone',
  'uri',
  'url',
  'name',
  'title',
  'slug',
];

export const stableKeyExtractor = (item, index) => {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item);
  }

  if (!item || typeof item !== 'object') {
    return `item-${index}`;
  }

  for (const field of CANDIDATE_KEY_FIELDS) {
    const value = item[field];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }

  return `item-${index}`;
};
