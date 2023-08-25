export interface UserData {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  flags: number
  banner: string
  accent_color: number
  global_name: string
  avatar_decoration: any
  banner_color: string
  mfa_enabled: boolean
  locale: string
  premium_type: PremiumType
  email: string
  verified: boolean
  rt: string
}
export interface UserDataDTO extends UserData {
  guilds: Guild[], 
}

export interface Guild {
  id: string
  name: string
  icon: string
  owner: boolean
  permissions: number
  permissions_new: string
  features: string[]
}

export enum BackgroundSelection {
  DiscordBanner,
  OverwatchBanner, 
  NotSelected,
}

export interface UserPreferences {
  bgMode: BackgroundSelection, 
  color: string,
  bannerSelection?: number,
}

export enum PremiumType {
  None, 
  NitroClassic,
  Nitro, 
  NitroBasic,
}