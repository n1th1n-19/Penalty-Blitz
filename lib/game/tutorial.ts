import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function createTutorial(onComplete: () => void, isMobile = false) {
  const steps = isMobile
    ? [
        {
          element: '#mobile-aim-zone',
          popover: {
            title:       'DRAG TO AIM',
            description: 'Slide your finger inside the goal area to move the crosshair to where you want to shoot.',
            side:        'bottom' as const,
          },
        },
        {
          element: '#mobile-power-bar',
          popover: {
            title:       'TAP TO SHOOT',
            description: 'Tap anywhere on the screen to lock your power. Time it in the green sweet-spot zone!',
            side:        'top' as const,
          },
        },
        {
          element: '#keeper',
          popover: {
            title:       'THE KEEPER LEARNS',
            description: 'On harder difficulties they read your patterns and predict your next shot. Mix it up!',
            side:        'top' as const,
          },
        },
        {
          element: '#score-display',
          popover: {
            title:       '5 ROUNDS',
            description: 'Score as many goals as you can in 5 rounds. Harder difficulty = more XP.',
            side:        'bottom' as const,
          },
        },
      ]
    : [
        {
          element: '#aim-zone',
          popover: {
            title:       'AIM YOUR SHOT',
            description: 'Use arrow keys or drag to position where you want to shoot inside the goal.',
            side:        'bottom' as const,
          },
        },
        {
          element: '#power-bar',
          popover: {
            title:       'TIME YOUR POWER',
            description: 'Press Space to start the power bar. Press Space again at the right moment to lock power. Higher is not always better.',
            side:        'right' as const,
          },
        },
        {
          element: '#keeper',
          popover: {
            title:       'THE KEEPER LEARNS',
            description: 'Watch the keeper lean — they read your patterns on harder difficulties. Mix up your shots.',
            side:        'top' as const,
          },
        },
        {
          element: '#score-display',
          popover: {
            title:       '5 ROUNDS',
            description: 'Score as many goals as you can in 5 rounds. Harder difficulty earns more XP.',
            side:        'bottom' as const,
          },
        },
      ]

  const d = driver({
    animate:          true,
    showProgress:     false,
    allowClose:       true,
    overlayOpacity:   0.6,
    popoverClass:     'pblitz-tutorial',
    onDestroyStarted: () => { onComplete(); d.destroy() },
    steps,
  })
  return d
}
