import React from 'react';
import {
  BriefcaseIcon,
  DumbbellIcon,
  GraduationCapIcon,
  HeartIcon,
  LuggageIcon,
  PartyPopperIcon,
  SparklesIcon,
  TreePalmIcon,
  UserCheckIcon,
  UsersIcon,
} from '@assets/icons';
import { AgendaMotive } from './types';

/**
 * Agenda plan motives, in the order zena's picker shows them
 * (`src/constants/agendaMotives.ts` + `src/components/MotiveIcon.tsx`).
 * Colours live in the schedule theme (`schedule.motives[id]`).
 */

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export interface MotiveDefinition {
  id: AgendaMotive;
  labelKey: string;
  Icon: IconComponent;
}

export const AGENDA_MOTIVES: MotiveDefinition[] = [
  { id: 'work', labelKey: 'schedule.motiveWork', Icon: BriefcaseIcon },
  { id: 'interview', labelKey: 'schedule.motiveInterview', Icon: UserCheckIcon },
  { id: 'party', labelKey: 'schedule.motiveParty', Icon: PartyPopperIcon },
  { id: 'date', labelKey: 'schedule.motiveDate', Icon: HeartIcon },
  { id: 'vacation', labelKey: 'schedule.motiveVacation', Icon: TreePalmIcon },
  { id: 'sport', labelKey: 'schedule.motiveSport', Icon: DumbbellIcon },
  { id: 'family', labelKey: 'schedule.motiveFamily', Icon: UsersIcon },
  { id: 'study', labelKey: 'schedule.motiveStudy', Icon: GraduationCapIcon },
  { id: 'other', labelKey: 'schedule.motiveOther', Icon: SparklesIcon },
];

export const AGENDA_MOTIVE_IDS: AgendaMotive[] = AGENDA_MOTIVES.map(m => m.id);

export const DEFAULT_MOTIVE: AgendaMotive = 'work';

/** Plans without a motive (created before motives existed) fall into "Other". */
export function getMotive(motive?: string | null): MotiveDefinition {
  return AGENDA_MOTIVES.find(m => m.id === motive) ?? AGENDA_MOTIVES[AGENDA_MOTIVES.length - 1];
}

/** A plan's icon: the suitcase when it travels, otherwise its motive's. */
export function getPlanIcon(motive: string | null | undefined, travel: boolean): IconComponent {
  return travel ? LuggageIcon : getMotive(motive).Icon;
}
