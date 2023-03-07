import { type Context } from 'telegraf';
import type { Update } from 'telegraf/types';

interface IDream {
  dreamId: number;
  text: string;
}

export interface ISessionData {
  isUserStartedBot: boolean;
  allUserDreams?: IDream[];
  userDream: string;
  currentDreamPage: number;
  step: number;
}

export interface DreamBotContext<U extends Update = Update> extends Context<U> {
  match: any;
  session: ISessionData;
}
