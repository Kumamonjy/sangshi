// 角色头像配置
export interface CharacterAvatar {
  id: string
  name: string
  path: string
}

export const CHARACTER_AVATARS: CharacterAvatar[] = [
  { id: 'avatar_1', name: '侦察兵1', path: '/static/avatars/侦察兵1.png' },
  { id: 'avatar_2', name: '侦察兵2', path: '/static/avatars/侦察兵2.png' },
  { id: 'avatar_3', name: '保安1', path: '/static/avatars/保安1.png' },
  { id: 'avatar_4', name: '保安2', path: '/static/avatars/保安2.png' },
  { id: 'avatar_5', name: '军人1', path: '/static/avatars/军人1.png' },
  { id: 'avatar_6', name: '军人2', path: '/static/avatars/军人2.png' },
  { id: 'avatar_7', name: '军人5', path: '/static/avatars/军人5.png' },
  { id: 'avatar_8', name: '医生1', path: '/static/avatars/医生1.png' },
  { id: 'avatar_9', name: '医生2', path: '/static/avatars/医生2.png' },
  { id: 'avatar_10', name: '机器师1', path: '/static/avatars/机器师1.png' },
  { id: 'avatar_11', name: '机器师2', path: '/static/avatars/机器师2.png' }
]

// 获取随机头像
export function getRandomAvatar(): CharacterAvatar {
  const index = Math.floor(Math.random() * CHARACTER_AVATARS.length)
  return CHARACTER_AVATARS[index]
}

// 根据ID获取头像
export function getAvatarById(avatarId: string): CharacterAvatar | undefined {
  return CHARACTER_AVATARS.find(avatar => avatar.id === avatarId)
}

// 根据索引获取头像
export function getAvatarByIndex(index: number): CharacterAvatar {
  return CHARACTER_AVATARS[index % CHARACTER_AVATARS.length]
}

// 获取所有头像列表
export function getAllAvatars(): CharacterAvatar[] {
  return CHARACTER_AVATARS
}
