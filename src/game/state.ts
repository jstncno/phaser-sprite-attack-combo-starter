import { writable } from 'svelte/store';

export interface PlayerAnimationState {
  animation: 'idle'|'run'|'attack';
  direction: 'left'|'right';
}
const DEFAULT_PLAYER_ANIMATION_STATE: PlayerAnimationState = {
  animation: 'idle',
  direction: 'right',
};
export const playerAnimationState = writable<PlayerAnimationState>(DEFAULT_PLAYER_ANIMATION_STATE);
