---
name: rn-orbit-animation
description: Build a glowing cosmic energy orb with rotating orbital rings as a React Native screen or component, using react-native-svg and react-native-reanimated. Use this skill whenever the user wants an animated orbit/atom/energy-core/glowing-sphere visual in a React Native or Expo app — including requests like "orbit animation", "spinning rings around a glowing center", "atom loader", "cosmic/galaxy splash screen", "AI assistant orb", or "pulsing energy sphere". Trigger even if the user only describes the look ("blue glowing ball with circles spinning around it") without naming the technique. Produces a self-contained, dependency-light component with smooth 60fps native-driver animations.
---

# React Native Orbit Animation

Build a glowing energy-orb screen for React Native / Expo: a pulsing radial-glow core, a multi-point starburst, and several elliptical orbital rings rotating at different speeds and angles. Runs natively at 60fps via Reanimated (no WebView).

## When to reach for this

Any "orbit / atom / energy core / glowing sphere / AI assistant orb / cosmic loader" visual in RN. The look: a bright center fading outward into a colored sphere, thin elliptical rings tilted at varying angles spinning slowly in alternating directions, with a few sparkle dots.

## Dependencies

Two libraries. Both are standard in Expo (SDK 50+) and bare RN.

```bash
# Expo
npx expo install react-native-svg react-native-reanimated

# Bare React Native
npm install react-native-svg react-native-reanimated
cd ios && pod install && cd ..
```

Reanimated requires its Babel plugin. In `babel.config.js`, the plugin MUST be the **last** entry in the plugins array:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // must be last
  };
};
```

After editing babel config, restart the bundler with cache cleared: `npx expo start -c` (or `npm start -- --reset-cache`).

## How the animation works

The whole thing is built from SVG primitives animated by shared values:

1. **Background** — a dark radial gradient (`RadialGradient` in `Defs`) fills the screen.
2. **Glow core** — stacked `Circle`s with radial gradients (`coreGlow`, `sphereGrad`) create the soft falloff. No blur filter needed — overlapping translucent gradient circles read as glow and are far cheaper than `feGaussianBlur` (which RN-SVG supports poorly).
3. **Rings** — each ring is an `Ellipse` with `fill="none"`, given a fixed tilt via a static `rotation` on its group, then the whole group is spun by an animated `rotate` transform. Different `rx`/`ry` + tilt + speed + direction gives the interwoven look.
4. **Starburst** — eight `Polygon` rays (4 long cardinal + 4 short diagonal) plus a white center dot, scaled up and down to pulse.
5. **Sparkles** — small `Circle`s whose opacity oscillates on independent timers.

All motion uses `useSharedValue` + `withRepeat(withTiming(...))`, driven on the UI thread, so it stays smooth even when JS is busy.

### Key technique: animating SVG transforms

`Animated` (Reanimated) can animate SVG props directly when you wrap the SVG element with `Animated.createAnimatedComponent`. The cleanest approach: create an `AnimatedG` (animated `<G>`) and feed it an animated `transform` array via `useAnimatedProps`.

```jsx
const AnimatedG = Animated.createAnimatedComponent(G);

const spin = useSharedValue(0);
useEffect(() => {
  spin.value = withRepeat(withTiming(360, { duration: 26000, easing: Easing.linear }), -1);
}, []);

const ringProps = useAnimatedProps(() => ({
  // rotate around the orb center (cx, cy)
  transform: [{ translateX: CX }, { translateY: CY }, { rotate: `${spin.value}deg` }, { translateX: -CX }, { translateY: -CY }],
}));

<AnimatedG animatedProps={ringProps}>
  {/* ellipses tilted with their own static transform */}
</AnimatedG>
```

For the pulsing starburst, animate a `scale` the same way (a shared value going `0.92 → 1.08 → 0.92` with `withRepeat` + reversing). For sparkles, animate `opacity` via `useAnimatedProps` on `AnimatedCircle`.

## Build steps

1. Confirm `react-native-svg` and `react-native-reanimated` are installed and the Babel plugin is last in the array.
2. Copy `assets/OrbitAnimation.tsx` into the project (e.g. `src/components/OrbitAnimation.tsx`). It's a drop-in component — no props required, but it accepts optional `size`, `hue`, and `style`.
3. Render it on a screen. For a full-screen splash/background, wrap it in a `View` with a dark `backgroundColor` matching the gradient edge.
4. If colors look off, tune the gradient stop colors (see "Customizing color" below) — the reference file uses a blue palette matching the original design.

```jsx
import OrbitAnimation from './components/OrbitAnimation';

export default function Screen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#02030f', alignItems: 'center', justifyContent: 'center' }}>
      <OrbitAnimation />
    </View>
  );
}
```

## Customizing

- **Size**: pass `size={320}` (default fills available width up to a sensible cap). The component scales all coordinates from a base viewBox, so everything stays proportional.
- **Color / hue**: the component exposes a small palette object. To shift between blue and purple, change the gradient stop hexes. Blue set (matches original): core `#cfe0fb`, sphere `#5a6ef0`, rings `#5c7ce0`. Purple set: core `#f0d2fb`, sphere `#9a4cf0`, rings `#7a5ce0`.
- **Speed**: each ring has its own `duration` (ms). Larger = slower. Keep them non-multiples of each other (26000 / 32000 / 40000) so the pattern never visually repeats.
- **Ring count / tilt**: add or remove `<Ellipse>` entries; vary the static `rotation` (degrees) and `rx`/`ry` for more or fewer interwoven orbits.

## Performance notes

- Avoid SVG blur filters (`feGaussianBlur`) on Android — they're slow and inconsistent. The glow here is gradient-only by design.
- All animations run on the UI thread (Reanimated worklets), so JS-thread work (navigation, data fetching) won't stutter the orb.
- If you mount many of these at once, drop the sparkle count and ring count; the rings are the cheapest part, gradients the most expensive fill.
- On low-end Android, reduce overlapping translucent circles from 3 to 2 to cut overdraw.

## Common pitfalls

- **Nothing animates** → Babel plugin missing or not last; restart with `-c` to clear cache.
- **`transform` jumps / rotates off-center** → you must translate to center, rotate, translate back (see the transform array above). Rotating without recentering spins the ring around the origin (top-left).
- **Gradients render as solid black** → `Defs` with `RadialGradient` must be a child of the `<Svg>`, and each gradient `id` referenced exactly via `fill="url(#id)"`. IDs must be unique if you render multiple instances on one screen — suffix them per-instance.
- **Ellipse fills instead of drawing a ring** → set `fill="none"` and use `stroke` + `strokeWidth`.

See `assets/OrbitAnimation.tsx` for the complete, ready-to-paste component.
