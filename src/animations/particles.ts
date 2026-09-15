import confetti from 'canvas-confetti';

export function triggerMissionClearParticles(originX = 0.5, originY = 0.6) {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x: originX, y: originY },
      colors: ['#8B5CF6', '#A855F7', '#06B6D4', '#38BDF8', '#FFFFFF'],
      ticks: 160,
      gravity: 1.1,
      scalar: 0.85,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true,
    });
  } catch {
    // Confetti fallback
  }
}

export function triggerLevelUpExplosion() {
  try {
    // Stage 1: Central shockwave
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#00F5FF', '#A855F7', '#F59E0B', '#F43F5E', '#FFFFFF'],
      ticks: 240,
      gravity: 0.9,
      scalar: 1.1,
      shapes: ['star', 'circle'],
    });

    // Stage 2: Left and right ascending sparks
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.15, y: 0.7 },
        colors: ['#8B5CF6', '#06B6D4', '#F59E0B'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.85, y: 0.7 },
        colors: ['#8B5CF6', '#06B6D4', '#F59E0B'],
      });
    }, 200);
  } catch {
    // Confetti fallback
  }
}

export function triggerAchievementSparkle() {
  try {
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { x: 0.5, y: 0.35 },
      colors: ['#F59E0B', '#FBBF24', '#06B6D4', '#FFFFFF'],
      ticks: 180,
      gravity: 0.8,
      scalar: 0.9,
      shapes: ['star', 'circle'],
    });
  } catch {
    // Confetti fallback
  }
}
