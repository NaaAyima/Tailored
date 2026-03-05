import { Platform } from 'react-native';
import type { BaseAnimationBuilder } from 'react-native-reanimated';

/**
 * Returns the animation builder only on native platforms.
 * On web, returns undefined to avoid the reanimated crash.
 */
export function nativeEntering(animation: BaseAnimationBuilder | typeof BaseAnimationBuilder | undefined) {
  return Platform.OS === 'web' ? undefined : animation;
}
