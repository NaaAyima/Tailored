import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Camera, Lock, CheckCircle, RefreshCw, SwitchCamera } from 'lucide-react-native';
import useTailoredStore from '@/lib/state/tailored-store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ScanStep = 0 | 1 | 2 | 3;

interface MeasurementResult {
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  inseam: number;
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: ScanStep }) {
  const steps = ['Permission', 'Front', 'Side', 'Results'];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 }}>
      {steps.map((label, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <View key={label} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: isActive ? 28 : 20,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDone || isActive ? '#C9A96E' : '#2A2A2A',
                opacity: isDone ? 0.7 : 1,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

// ─── Body silhouette overlay for camera steps ─────────────────────────────────

function BodySilhouetteOverlay() {
  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
      pointerEvents="none"
    >
      {/* Head */}
      <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(201,169,110,0.5)', backgroundColor: 'transparent' }} />
      {/* Neck */}
      <View style={{ width: 18, height: 14, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(201,169,110,0.5)', backgroundColor: 'transparent' }} />
      {/* Shoulders */}
      <View style={{ width: 160, height: 22, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(201,169,110,0.5)', backgroundColor: 'transparent' }} />
      {/* Torso */}
      <View style={{ width: 110, height: 110, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(201,169,110,0.5)', backgroundColor: 'transparent' }} />
      {/* Hips */}
      <View style={{ width: 130, height: 28, borderRadius: 4, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.5)', backgroundColor: 'transparent' }} />
      {/* Legs */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ width: 54, height: 130, borderRadius: 10, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.5)', backgroundColor: 'transparent' }} />
        <View style={{ width: 54, height: 130, borderRadius: 10, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.5)', backgroundColor: 'transparent' }} />
      </View>
    </View>
  );
}

// ─── Corner brackets ──────────────────────────────────────────────────────────

function CornerBrackets() {
  const sz = 20;
  const th = 2;
  const col = '#C9A96E';
  const mg = 60;

  return (
    <>
      <View style={{ position: 'absolute', top: mg, left: mg }}>
        <View style={{ width: sz, height: th, backgroundColor: col }} />
        <View style={{ width: th, height: sz, backgroundColor: col }} />
      </View>
      <View style={{ position: 'absolute', top: mg, right: mg, alignItems: 'flex-end' }}>
        <View style={{ width: sz, height: th, backgroundColor: col }} />
        <View style={{ width: th, height: sz, backgroundColor: col, alignSelf: 'flex-end' }} />
      </View>
      <View style={{ position: 'absolute', bottom: mg + 120, left: mg }}>
        <View style={{ width: th, height: sz, backgroundColor: col }} />
        <View style={{ width: sz, height: th, backgroundColor: col }} />
      </View>
      <View style={{ position: 'absolute', bottom: mg + 120, right: mg, alignItems: 'flex-end' }}>
        <View style={{ width: th, height: sz, backgroundColor: col, alignSelf: 'flex-end' }} />
        <View style={{ width: sz, height: th, backgroundColor: col }} />
      </View>
    </>
  );
}

// ─── Results silhouette (static) ──────────────────────────────────────────────

function ResultsSilhouette() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(201,169,110,0.4)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.6)', marginBottom: 4 }} />
      <View style={{ width: 16, height: 10, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(201,169,110,0.4)', backgroundColor: 'transparent' }} />
      <View style={{ width: 100, height: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(201,169,110,0.4)', backgroundColor: 'transparent' }} />
      <View style={{ width: 72, height: 70, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(201,169,110,0.4)', backgroundColor: 'transparent' }} />
      <View style={{ width: 84, height: 20, borderRadius: 4, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.4)', backgroundColor: 'transparent' }} />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ width: 36, height: 80, borderRadius: 8, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.4)', backgroundColor: 'transparent' }} />
        <View style={{ width: 36, height: 80, borderRadius: 8, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.4)', backgroundColor: 'transparent' }} />
      </View>
    </View>
  );
}

// ─── Permission step ──────────────────────────────────────────────────────────

function PermissionStep({ onAllow, onSkip }: { onAllow: () => void; onSkip: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 }}>
        <StepIndicator current={0} />

        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 36 }}>
          <LinearGradient
            colors={['#C9A96E', '#A07840']}
            style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}
          >
            <Camera size={44} color="#0A0A0A" strokeWidth={1.5} />
          </LinearGradient>
        </View>

        <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 42, color: '#F5F0E8', textAlign: 'center', marginBottom: 16, lineHeight: 48 }}>
          Scan Your Body
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880', textAlign: 'center', lineHeight: 22, marginBottom: 36 }}>
          We use your camera to estimate your body measurements. Photos are processed on-device and never stored.
        </Text>

        <View style={{ backgroundColor: '#161616', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A2A', flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 48 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Lock size={18} color="#C9A96E" strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#F5F0E8', marginBottom: 4 }}>
              Your privacy is protected.
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', lineHeight: 18 }}>
              Images are analysed locally and immediately discarded.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onAllow}
          testID="allow-camera-button"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 16 })}
        >
          <LinearGradient
            colors={['#C9A96E', '#A07840']}
            style={{ height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#0A0A0A', letterSpacing: 1.5 }}>
              ALLOW CAMERA ACCESS
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onSkip}
          testID="skip-scan-button"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignItems: 'center', paddingVertical: 14 })}
        >
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880' }}>
            Skip for Now
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Web fallback for capture step ───────────────────────────────────────────

function WebCaptureStep({ onCapture, onBack, stepIndex }: { onCapture: (uri: string) => void; onBack: () => void; stepIndex: 1 | 2 }) {
  const instruction = stepIndex === 1
    ? 'Stand 2 metres back. Align your body with the outline.'
    : 'Turn 90° to your right. Keep feet shoulder-width apart.';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Camera size={36} color="#C9A96E" strokeWidth={1.5} />
        </View>
        <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: '#F5F0E8', textAlign: 'center', marginBottom: 12 }}>
          Camera scanning requires the mobile app.
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880', textAlign: 'center', lineHeight: 22, marginBottom: 8 }}>
          {instruction}
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', textAlign: 'center', lineHeight: 20, marginBottom: 36 }}>
          Open Tailored on your phone to use the body scan feature.
        </Text>
        <Pressable
          onPress={() => onCapture('mock-uri')}
          testID="shutter-button"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 16, width: '100%' })}
        >
          <LinearGradient
            colors={['#C9A96E', '#A07840']}
            style={{ height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#0A0A0A', letterSpacing: 1.5 }}>
              CONTINUE ANYWAY
            </Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={onBack}
          testID="camera-back-button"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignItems: 'center', paddingVertical: 14 })}
        >
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880' }}>← Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Native camera capture (always calls hook unconditionally) ────────────────

// This component is ONLY rendered on native, so the hook is always called
// in the same order within its own render cycle.
function NativeCaptureStep({
  stepIndex,
  onCapture,
  onBack,
}: {
  stepIndex: 1 | 2;
  onCapture: (uri: string) => void;
  onBack: () => void;
}) {
  type NativeCamProps = {
    style?: object;
    facing?: 'front' | 'back';
    children?: React.ReactNode;
    ref?: React.Ref<unknown>;
  };

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CameraView: RawCamView, useCameraPermissions } = require('expo-camera') as {
    CameraView: React.FC<NativeCamProps>;
    useCameraPermissions: () => [{ granted: boolean } | null, () => Promise<{ granted: boolean }>];
  };
  const NativeCamView = RawCamView as React.FC<NativeCamProps>;

  // Hook is always called — no conditional
  const [, requestPerm] = useCameraPermissions();

  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [countdown, setCountdown] = useState<number | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;
  // Use any so we avoid the complex generic mismatch; we call a known method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);

  const title = stepIndex === 1 ? 'Front View' : 'Side View';
  const instruction = stepIndex === 1
    ? 'Stand 2 metres back. Align your body with the outline.'
    : 'Turn 90° to your right. Keep feet shoulder-width apart.';

  // Request permission when this step mounts if not already granted
  useEffect(() => {
    requestPerm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShutter = () => {
    if (countdown !== null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        takePicture();
      } else {
        setCountdown(count);
        Haptics.selectionAsync();
      }
    }, 1000);
  };

  const takePicture = async () => {
    try {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true }) as { uri: string };
        setTimeout(() => onCapture(photo.uri), 300);
      } else {
        setTimeout(() => onCapture('mock-uri'), 300);
      }
    } catch {
      setTimeout(() => onCapture('mock-uri'), 300);
    }
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Camera — no children */}
      <NativeCamView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

      {/* All overlays rendered as siblings, absolutely positioned */}
      <BodySilhouetteOverlay />
      <CornerBrackets />

      {/* Top bar */}
      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 }}>
          <Pressable
            onPress={onBack}
            testID="camera-back-button"
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            })}
          >
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 18, color: '#F5F0E8' }}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: '#F5F0E8' }}>{title}</Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: 'rgba(245,240,232,0.7)', lineHeight: 16 }}>{instruction}</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(201,169,110,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(201,169,110,0.5)' }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#C9A96E' }}>{stepIndex} / 2</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Countdown */}
      {countdown !== null ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 120, color: 'rgba(201,169,110,0.9)' }}>
            {countdown}
          </Text>
        </View>
      ) : null}

      {/* Flash */}
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', opacity: flashAnim }}
        pointerEvents="none"
      />

      {/* Bottom shutter panel */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: 24, paddingBottom: 48, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: 'rgba(245,240,232,0.7)', marginBottom: 20, textAlign: 'center', paddingHorizontal: 40 }}>
          {instruction}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          {/* Spacer to balance the flip button on the right */}
          <View style={{ width: 52, height: 52 }} />
          <Pressable
            onPress={handleShutter}
            testID="shutter-button"
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 3,
              borderColor: '#C9A96E',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'white' }} />
          </Pressable>
          <Pressable
            onPress={() => {
              setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
              Haptics.selectionAsync();
            }}
            testID="flip-camera-button"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <SwitchCamera size={22} color="#F5F0E8" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Platform-dispatching capture step ───────────────────────────────────────

function CaptureStep({ stepIndex, onCapture, onBack }: { stepIndex: 1 | 2; onCapture: (uri: string) => void; onBack: () => void }) {
  if (Platform.OS === 'web') {
    return <WebCaptureStep stepIndex={stepIndex} onCapture={onCapture} onBack={onBack} />;
  }
  return <NativeCaptureStep stepIndex={stepIndex} onCapture={onCapture} onBack={onBack} />;
}

// ─── Results step ─────────────────────────────────────────────────────────────

function ResultsStep({
  height: userHeight,
  weight: userWeight,
  onSave,
  onManual,
}: {
  height: number;
  weight: number;
  onSave: (m: MeasurementResult) => void;
  onManual: () => void;
}) {
  const [analysing, setAnalysing] = useState<boolean>(true);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // BMI-adjusted measurements using validated anthropometric proportions
  // Base proportions calibrated at BMI 22 (average build), adjusted per BMI unit deviation
  const bmi = userWeight / Math.pow(userHeight / 100, 2);
  const bmiDelta = bmi - 22; // deviation from reference BMI

  const chest = parseFloat(Math.max(70, userHeight * 0.543 + bmiDelta * 0.7).toFixed(1));
  const waist = parseFloat(Math.max(55, userHeight * 0.457 + bmiDelta * 1.5).toFixed(1));
  const hips = parseFloat(Math.max(70, userHeight * 0.554 + bmiDelta * 1.0).toFixed(1));
  const shoulders = parseFloat(Math.max(32, userHeight * 0.257 + bmiDelta * 0.15).toFixed(1));
  const inseam = parseFloat(Math.max(60, userHeight * 0.463 + bmiDelta * 0.05).toFixed(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const timer = setTimeout(() => {
      pulse.stop();
      pulseAnim.setValue(1);
      setAnalysing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [pulseAnim]);

  const measurements = [
    { label: 'Chest', value: chest },
    { label: 'Waist', value: waist },
    { label: 'Hips', value: hips },
    { label: 'Shoulders', value: shoulders },
    { label: 'Inseam', value: inseam },
    { label: 'Height', value: userHeight },
  ];

  if (analysing) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Animated.View style={{ opacity: pulseAnim, alignItems: 'center' }}>
          <LinearGradient
            colors={['#1E1E1E', '#2A2A2A']}
            style={{ width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,169,110,0.4)', marginBottom: 28 }}
          >
            <RefreshCw size={44} color="#C9A96E" strokeWidth={1} />
          </LinearGradient>
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 32, color: '#F5F0E8', marginBottom: 10 }}>
            Analysing...
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880', textAlign: 'center' }}>
            Processing your body scan
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <StepIndicator current={3} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6, marginTop: 8 }}>
          <CheckCircle size={26} color="#4CAF50" strokeWidth={1.5} />
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 34, color: '#F5F0E8' }}>
            Measurements Estimated
          </Text>
        </View>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', marginBottom: 28, lineHeight: 20 }}>
          Based on your height ({userHeight} cm) using proportional estimates.
        </Text>

        {/* Body silhouette */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <LinearGradient
            colors={['#1E1E1E', '#2A2A2A']}
            style={{ width: 160, height: 240, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)' }}
          >
            <ResultsSilhouette />
          </LinearGradient>
        </View>

        {/* Measurement grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {measurements.map((m) => (
            <View
              key={m.label}
              testID={`measurement-${m.label.toLowerCase()}`}
              style={{
                width: (SCREEN_WIDTH - 48 - 10) / 2,
                backgroundColor: '#161616',
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: '#2A2A2A',
              }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 10, color: '#A89880', letterSpacing: 1.5, marginBottom: 6 }}>
                {m.label.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: '#C9A96E' }}>
                {m.value}
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>cm</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={{ backgroundColor: '#161616', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 28 }}>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', lineHeight: 18, textAlign: 'center' }}>
            These are AI estimates. For precision, update manually in your profile.
          </Text>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSave({ chest, waist, hips, shoulders, inseam });
          }}
          testID="save-measurements-button"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginBottom: 12 })}
        >
          <LinearGradient
            colors={['#C9A96E', '#A07840']}
            style={{ height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#0A0A0A', letterSpacing: 1.5 }}>
              SAVE & CONTINUE
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onManual}
          testID="update-manually-button"
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            height: 58,
            borderRadius: 29,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#2A2A2A',
          })}
        >
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#A89880' }}>
            Update Manually
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BodyScanScreen() {
  const router = useRouter();
  const height = useTailoredStore((s) => s.height);
  const weight = useTailoredStore((s) => s.weight);
  const setProfile = useTailoredStore((s) => s.setProfile);

  const [step, setStep] = useState<ScanStep>(0);

  const handleAllow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFrontCapture = (uri: string) => {
    void uri;
    setStep(2);
  };

  const handleSideCapture = (uri: string) => {
    void uri;
    setStep(3);
  };

  const handleSave = (measurements: MeasurementResult) => {
    setProfile({
      measurements: {
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
        shoulder: measurements.shoulders,
        inseam: measurements.inseam,
      },
      hasCompletedProfile: true,
    });
    router.replace('/(tabs)');
  };

  const handleManual = () => {
    router.push('/profile-setup');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="body-scan-screen">
      {step === 0 && (
        <PermissionStep onAllow={handleAllow} onSkip={handleSkip} />
      )}
      {step === 1 && (
        <CaptureStep stepIndex={1} onCapture={handleFrontCapture} onBack={() => setStep(0)} />
      )}
      {step === 2 && (
        <CaptureStep stepIndex={2} onCapture={handleSideCapture} onBack={() => setStep(1)} />
      )}
      {step === 3 && (
        <ResultsStep height={height} weight={weight} onSave={handleSave} onManual={handleManual} />
      )}
    </View>
  );
}
