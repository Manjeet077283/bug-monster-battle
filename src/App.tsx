import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Bug,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Code2,
  Crown,
  Flame,
  Heart,
  Lightbulb,
  LockKeyhole,
  Moon,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Terminal,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ChallengeResult, Mission } from './gameLogic'
import { applyBossDamage, BOSS_DAMAGE, calculateBossHp, calculateMissionXp, didWinCampaign, isMissionUnlocked, missions, runChallenge } from './gameLogic'
import './App.css'

const STARTING_HP = 100
const DAILY_BONUS_STORAGE_KEY = 'bug-monster-battle-daily-bonus'
const INITIAL_DAILY_DATE = new Date()
const INITIAL_DAILY_DATE_KEY = localDateKey(INITIAL_DAILY_DATE)
const INITIAL_DAILY_SEED = Math.floor(Date.UTC(INITIAL_DAILY_DATE.getFullYear(), INITIAL_DAILY_DATE.getMonth(), INITIAL_DAILY_DATE.getDate()) / 86_400_000)

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function readDailyBonusState(): { claimedDate: string; notice: string } {
  try {
    return { claimedDate: window.localStorage.getItem(DAILY_BONUS_STORAGE_KEY) ?? '', notice: '' }
  } catch {
    return { claimedDate: '', notice: 'Daily bonus cannot be saved in this browser session.' }
  }
}

function BugLord({ attacking = false, damaged = false, defeated = false, reducedMotion = false, world = 1 }: { attacking?: boolean; damaged?: boolean; defeated?: boolean; reducedMotion?: boolean; world?: number }) {
  const palette = world === 1
    ? { light: '#b9ff80', mid: '#39784c', dark: '#142c2c', glow: '#a8ff7a' }
    : world === 2
      ? { light: '#74faff', mid: '#176e91', dark: '#10283d', glow: '#54e9ff' }
      : { light: '#ff9b82', mid: '#922f68', dark: '#321538', glow: '#ff6289' }
  return (
    <motion.div
      initial={false}
      className={`bug-illustration world-boss-${world}${attacking ? ' bug-attacking' : ''}${damaged ? ' bug-damaged' : ''}${defeated ? ' bug-defeated' : ''}`}
      animate={reducedMotion ? (defeated ? { opacity: 0.25 } : { opacity: 1 }) : defeated ? { y: [0, 28], opacity: 0, scale: 0.8, rotate: [0, -8] } : attacking ? { x: [0, -18, 0], rotate: [0, -5, 0], scale: [1, 1.04, 1], opacity: 1 } : damaged ? { x: [0, -9, 8, 0], rotate: [0, -3, 2, 0], filter: ['brightness(1)', 'brightness(2.1)', 'brightness(1)'], opacity: 1 } : { y: [0, -8, 0], opacity: 1 }}
      transition={
        defeated
          ? { duration: 0.72, ease: 'easeOut' }
          : attacking
          ? { duration: 0.42, ease: 'easeOut' }
          : damaged
          ? { duration: 0.38, ease: 'easeOut' }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      }
      aria-label={`${world === 1 ? 'Bug Forest' : world === 2 ? 'Neon Dungeon' : 'Cyber Abyss'} boss, a huge armored insect`}
      role="img"
    >
      <svg viewBox="0 0 330 300" className="bug-svg" aria-hidden="true">
        <defs>
          <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.light} />
            <stop offset=".52" stopColor={palette.mid} />
            <stop offset="1" stopColor={palette.dark} />
          </linearGradient>
          <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={palette.mid} />
            <stop offset="1" stopColor={palette.dark} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="169" cy="267" rx="108" ry="17" fill="#02030c" opacity=".6" />
        <path d="M120 180 47 221l-30-3 66-76M213 177l75 39 27-9-69-72" fill="none" stroke="#49226d" strokeWidth="18" strokeLinecap="round" />
        <path d="m81 143-53 15-14-10 65-37m171 29 53 15 14-10-65-37" fill="none" stroke="#682dae" strokeWidth="12" strokeLinecap="round" />
        <path d="m113 226-44 20-17-5 45-36m107 21 44 20 17-5-45-36" fill="none" stroke="#562680" strokeWidth="14" strokeLinecap="round" />
        <path d="M128 191c-10-45 5-92 42-104 41 8 59 54 42 104l-20 46h-47z" fill="url(#plate)" stroke="#ba75ff" strokeWidth="3" />
        <path d="M113 101c-17-22-8-49 9-59 20 12 24 35 12 58m77 0c-12-23-8-46 12-58 17 10 26 37 9 59" fill="#25133f" stroke="#a94cff" strokeWidth="4" />
        <path d="M116 123c5-45 23-69 49-75 30 4 48 31 51 75l-18 42h-65z" fill="url(#shell)" stroke="#d2a0ff" strokeWidth="3" />
        <path d="M123 105c12-12 25-14 39-7m13 0c14-7 27-5 39 7" fill="none" stroke="#270c46" strokeWidth="7" strokeLinecap="round" />
        <g filter="url(#glow)">
          <ellipse cx="144" cy="120" rx="10" ry="7" fill={palette.glow} />
          <ellipse cx="192" cy="120" rx="10" ry="7" fill={palette.glow} />
          <circle cx="144" cy="120" r="3" fill="#fff1f6" />
          <circle cx="192" cy="120" r="3" fill="#fff1f6" />
        </g>
        <path d="m151 143 9 7 10-7 10 7 9-7" fill="none" stroke="#f39bb8" strokeWidth="3" strokeLinecap="round" />
        <path d="M164 46V24m0 22-18-18m18 18 18-18" fill="none" stroke={palette.light} strokeWidth="5" strokeLinecap="round" />
        <path d="M103 177 80 198m152-21 23 21" stroke="#d2a0ff" strokeWidth="4" opacity=".7" />
        <path d="M128 185h82" stroke="#7b3dc4" strokeWidth="2" opacity=".9" />
        <path d="M135 202h68m-58 14h48" stroke="#4dcfff" strokeWidth="2" opacity=".45" />
        <circle cx="163" cy="178" r="8" fill="#5deaff" opacity=".9" filter="url(#glow)" />
      </svg>
      <span className="boss-orbit orbit-one" />
      <span className="boss-orbit orbit-two" />
    </motion.div>
  )
}

function PlayerSprite({ attacking = false, reducedMotion = false }: { attacking?: boolean; reducedMotion?: boolean }) {
  return (
    <motion.div
      className="player-sprite"
      animate={reducedMotion ? {} : attacking ? { x: [0, 34, 0], rotate: [0, 9, 0] } : { y: [0, -4, 0] }}
      transition={attacking ? { duration: 0.45 } : { duration: 2.7, repeat: Infinity }}
      aria-label="Your CodeQuest hero"
      role="img"
    >
      <span className="player-aura" />
      <span className="player-hood"><span className="player-face"><i /><i /></span></span>
      <span className="player-cape" />
      <span className="player-sword"><Zap size={15} fill="currentColor" /></span>
    </motion.div>
  )
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return 'Unsupported / no output'
  return typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value) ?? '—'
}

function highlightPythonLine(line: string): React.ReactNode[] {
  const pieces = line.split(/(\b(?:def|return|if|elif|else|for|in|and|or)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|(?:>=|<=|==|!=|[+\-*/=<>]))/g)
  return pieces.filter(Boolean).map((piece, index) => {
    const style = /^(?:def|return|if|elif|else|for|in|and|or)$/.test(piece)
      ? 'token-keyword'
      : /^(?:"|'|")/.test(piece)
        ? 'token-string'
        : /^\d/.test(piece)
          ? 'token-number'
          : /^(?:max|min|range|True|False)$/.test(piece)
            ? 'token-builtin'
            : /^(?:>=|<=|==|!=|[+\-*/=<>])$/.test(piece)
              ? 'token-operator'
              : ''
    return <span className={style} key={index}>{piece}</span>
  })
}

function HealthBar({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: number
  tone: 'player' | 'boss'
  icon: React.ReactNode
}) {
  return (
    <div className={`health-card ${tone}`}>
      <div className="health-heading">
        <span>{icon}{label}</span>
        <strong>{Math.max(0, value)}<small> / 100</small></strong>
      </div>
      <div className="health-track" role="progressbar" aria-label={`${label} health`} aria-valuenow={Math.max(0, value)} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${Math.max(0, value)}%` }} />
      </div>
    </div>
  )
}

function MissionProgress({
  current,
  completed,
  onSelect,
}: {
  current: number
  completed: number[]
  onSelect: (mission: Mission) => void
}) {
  const worlds = [1, 2, 3].map((world) => ({
    id: world,
    name: missions.find((mission) => mission.world === world)?.worldName ?? '',
    missions: missions.filter((mission) => mission.world === world),
  }))
  return (
    <nav className="mission-route" aria-label="Campaign world map">
      <div className="route-label"><span className="route-line" /> THREE WORLDS · NINE MISSIONS <span className="route-line" /></div>
      <div className="world-map">
        {worlds.map((world) => {
          const worldDone = world.missions.every((mission) => completed.includes(mission.id))
          const worldOpen = world.missions.some((mission) => isMissionUnlocked(mission.id, completed))
          return (
            <section className={`world-card ${worldOpen ? 'world-open' : 'world-locked'} ${worldDone ? 'world-done' : ''}`} key={world.id}>
              <header><span className="world-number">{worldDone ? <Check size={12} /> : `0${world.id}`}</span><span><b>{world.name}</b><small>{world.id === 1 ? 'BEGINNER' : world.id === 2 ? 'INTERMEDIATE' : 'ADVANCED'}</small></span><span className="world-progress">{world.missions.filter((mission) => completed.includes(mission.id)).length}/3</span></header>
              <div className="world-missions">
                {world.missions.map((mission) => {
                  const index = mission.id - 1
                  const isDone = completed.includes(mission.id)
                  const isCurrent = current === index
                  const locked = !isMissionUnlocked(mission.id, completed)
                  return (
                    <button type="button" key={mission.id} className={`map-mission ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''} ${locked ? 'is-locked' : ''}`} onClick={() => !locked && onSelect(mission)} disabled={locked} aria-current={isCurrent ? 'step' : undefined} aria-label={`Level ${mission.id}: ${mission.title}, ${isDone ? 'completed' : locked ? 'locked' : isCurrent ? 'current' : 'unlocked'}`}>
                      <span className="map-mission-id">{isDone ? <Check size={11} /> : locked ? <LockKeyhole size={10} /> : `0${mission.id}`}</span>
                      <span className="map-mission-title">{mission.title}</span>
                      {isCurrent && <span className="map-current-dot" />}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </nav>
  )
}

function App() {
  const [missionIndex, setMissionIndex] = useState(0)
  const [source, setSource] = useState(missions[0].initialCode)
  const [playerHp, setPlayerHp] = useState(STARTING_HP)
  const [bossHp, setBossHp] = useState(STARTING_HP)
  const [xp, setXp] = useState(240)
  const [combo, setCombo] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [hintUsedThisMission, setHintUsedThisMission] = useState(false)
  const [hintTier, setHintTier] = useState(0)
  const [missionAttempts, setMissionAttempts] = useState(0)
  const [validatedTests, setValidatedTests] = useState<number[]>([])
  const [bossAttacking, setBossAttacking] = useState(false)
  const [bossDamaged, setBossDamaged] = useState(false)
  const [bossDamageLabel, setBossDamageLabel] = useState('')
  const [heroDamageLabel, setHeroDamageLabel] = useState('')
  const [attackFlight, setAttackFlight] = useState(false)
  const [attackSequence, setAttackSequence] = useState(0)
  const [attackDistance, setAttackDistance] = useState(220)
  const [completed, setCompleted] = useState<number[]>([])
  const [noHintCompleted, setNoHintCompleted] = useState<number[]>([])
  const [result, setResult] = useState<ChallengeResult | null>(null)
  const [telegraph, setTelegraph] = useState(false)
  const [isAttacking, setIsAttacking] = useState(false)
  const [rewardReveal, setRewardReveal] = useState<{ xp: number; streak: number; critical: boolean; firstClear: boolean } | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [victory, setVictory] = useState(false)
  const [treasureOpened, setTreasureOpened] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [showFix, setShowFix] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false)
  const [dailyPractice, setDailyPractice] = useState(false)
  const [dailyDateKey] = useState(INITIAL_DAILY_DATE_KEY)
  const [dailyClaim, setDailyClaim] = useState(readDailyBonusState)
  const dailyClaimedDate = dailyClaim.claimedDate
  const dailySeed = INITIAL_DAILY_SEED
  const [promptMode, setPromptMode] = useState<'explain' | 'tests' | 'review'>('explain')
  const [notice, setNotice] = useState(dailyClaim.notice)
  const mission = missions[missionIndex]
  const systemPrefersReducedMotion = useReducedMotion()
  const reducedMotion = reducedMotionEnabled || Boolean(systemPrefersReducedMotion)

  const noHintAchievement = noHintCompleted.length > 0
  const victoryAchieved = didWinCampaign(completed)
  const dailyMission = missions[dailySeed % Math.min(completed.length + 1, missions.length)]
  const prompt = useMemo(
    () => {
      const instruction = promptMode === 'tests'
        ? 'Suggest three useful edge-case tests and explain what each one checks. Do not write the solution.'
        : promptMode === 'review'
          ? 'Review this code for bugs, explain the first issue you notice, and give me one small hint without solving it.'
          : 'Explain the programming concept and why a failing test differs from its expected output. Give me a small clue without directly solving it.'
      return `I'm learning Python in CodeQuest Bug Monster Battle, World ${mission.world}: ${mission.title}. Objective: ${mission.objective} ${instruction} The game checks a restricted Python subset locally and never executes arbitrary code.\n\n${source}`
    },
    [mission, promptMode, source],
  )

  function playSound(frequency: number) {
    if (!soundOn || typeof window === 'undefined') return
    try {
      const audioContext = new window.AudioContext()
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gain.gain.setValueAtTime(0.045, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.16)
      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.16)
      oscillator.onended = () => void audioContext.close()
    } catch {
      setNotice('Audio is unavailable in this browser.')
    }
  }

  function chooseMission(selected: Mission, isDailyPractice = false) {
    if (!isMissionUnlocked(selected.id, completed)) return
    const index = selected.id - 1
    setMissionIndex(index)
    setSource(selected.initialCode)
    setBossHp(STARTING_HP)
    setBossDamaged(false)
    setBossDamageLabel('')
    setHeroDamageLabel('')
    setAttackFlight(false)
    setRewardReveal(null)
    setResult(null)
    setBossAttacking(false)
    setIsAttacking(false)
    setShowHint(false)
    setShowFix(false)
    setHintUsedThisMission(false)
    setHintTier(0)
    setMissionAttempts(0)
    setValidatedTests([])
    setGameOver(false)
    setVictory(false)
    setTreasureOpened(false)
    setTelegraph(false)
    setDailyPractice(isDailyPractice)
  }

  function runTests() {
    if (gameOver || victory) return
    const firstClear = !completed.includes(mission.id)
    const firstAttempt = missionAttempts === 0
    const challengeResult = runChallenge(source, mission)
    setResult(challengeResult)
    setShowHint(false)
    setMissionAttempts((current) => current + 1)
    const newlyValidated = challengeResult.tests.flatMap((test, index) =>
      test.passed && !validatedTests.includes(index) ? [index] : [],
    )
    const nextValidated = [...validatedTests, ...newlyValidated]
    setValidatedTests(nextValidated)
    setBossHp(calculateBossHp(challengeResult.passed, nextValidated.length))

    if (challengeResult.passed) {
      setTelegraph(false)
      setIsAttacking(true)
      setBossAttacking(false)
      setBossDamaged(true)
      setBossDamageLabel('−100 HP')
      setHeroDamageLabel('')
      setAttackDistance(Math.max(105, (document.querySelector('.arena-scene')?.getBoundingClientRect().width ?? window.innerWidth) * 0.36))
      setAttackSequence((sequence) => sequence + 1)
      setAttackFlight(true)
      playSound(680)
      window.setTimeout(() => {
        setIsAttacking(false)
        setAttackFlight(false)
        setBossDamaged(false)
      }, 620)
      window.setTimeout(() => setBossDamageLabel(''), 1050)
      const reward = calculateMissionXp(hintUsedThisMission, !firstClear, firstAttempt)
      const dailyReward = dailyPractice && dailyDateKey && dailyClaimedDate !== dailyDateKey ? 25 : 0
      setRewardReveal({
        xp: reward + dailyReward,
        streak: firstClear ? combo + 1 : combo,
        critical: firstAttempt && !hintUsedThisMission,
        firstClear,
      })
      if (reward || dailyReward) setXp((current) => current + reward + dailyReward)
      let dailySaveFailed = false
      if (dailyReward) {
        setDailyClaim({ claimedDate: dailyDateKey, notice: '' })
        try {
          window.localStorage.setItem(DAILY_BONUS_STORAGE_KEY, dailyDateKey)
        } catch {
          dailySaveFailed = true
        }
      }
      if (firstClear) {
        setCombo((current) => current + 1)
        const next = [...completed, mission.id]
        setCompleted(next)
        if (didWinCampaign(next)) {
          setVictory(true)
          playSound(880)
        }
      }
      if (!hintUsedThisMission) {
        setNoHintCompleted((current) =>
          current.includes(mission.id) ? current : [...current, mission.id],
        )
      }
      setNotice(
        dailySaveFailed
          ? `+${reward + dailyReward} XP · Daily bonus could not be saved in this browser.`
          : dailyReward
          ? `+${reward + dailyReward} XP · Daily practice bonus claimed!`
          : firstClear
            ? `+${reward} XP · ${firstAttempt && !hintUsedThisMission ? 'First-attempt & no-hint bonus!' : firstAttempt ? 'First-attempt bonus!' : hintUsedThisMission ? 'Mission cleared!' : 'No-hint bonus earned!'}`
            : 'Replay cleared · no repeat XP awarded.',
      )
    } else {
      setCombo(0)
      setRewardReveal(null)
      setTelegraph(true)
      setBossAttacking(true)
      if (newlyValidated.length) {
        setBossDamaged(true)
        setBossDamageLabel(`−${newlyValidated.length * 18} HP`)
        setIsAttacking(true)
        setAttackDistance(Math.max(105, (document.querySelector('.arena-scene')?.getBoundingClientRect().width ?? window.innerWidth) * 0.36))
        setAttackSequence((sequence) => sequence + 1)
        setAttackFlight(true)
      }
      setHeroDamageLabel(`−${BOSS_DAMAGE} HP`)
      window.setTimeout(() => setBossAttacking(false), 520)
      window.setTimeout(() => {
        setIsAttacking(false)
        setAttackFlight(false)
        setBossDamaged(false)
      }, 620)
      window.setTimeout(() => {
        setBossDamageLabel('')
        setHeroDamageLabel('')
      }, 1050)
      playSound(170)
      const nextHp = applyBossDamage(playerHp)
      setPlayerHp(nextHp)
      if (nextHp === 0) setGameOver(true)
    }
  }

  function requestHint() {
    if (!hintsLeft || showHint || hintTier >= mission.hints.length || gameOver || victory) return
    setHintsLeft((count) => count - 1)
    setHintUsedThisMission(true)
    setHintTier((current) => current + 1)
    setShowHint(true)
    setNotice('Hint unlocked · hints never block mission completion.')
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setNotice('Prompt copied. Paste it into Copilot Chat to get help.')
    } catch {
      setNotice('Clipboard access was blocked. Select and copy the prompt manually.')
    }
  }

  function advanceMission() {
    const nextIndex = missions.findIndex((item) => !completed.includes(item.id))
    if (nextIndex === -1) return
    setMissionIndex(nextIndex)
    setSource(missions[nextIndex].initialCode)
    setBossHp(STARTING_HP)
    setBossDamaged(false)
    setBossDamageLabel('')
    setHeroDamageLabel('')
    setAttackFlight(false)
    setRewardReveal(null)
    setResult(null)
    setShowHint(false)
    setShowFix(false)
    setHintUsedThisMission(false)
    setHintTier(0)
    setMissionAttempts(0)
    setValidatedTests([])
    setTelegraph(false)
    setBossAttacking(false)
    setIsAttacking(false)
    setBossDamageLabel('')
    setHeroDamageLabel('')
    setDailyPractice(false)
    setVictory(false)
    setTreasureOpened(false)
  }

  function replay() {
    setMissionIndex(0)
    setSource(missions[0].initialCode)
    setPlayerHp(STARTING_HP)
    setBossHp(STARTING_HP)
    setBossDamaged(false)
    setBossDamageLabel('')
    setHeroDamageLabel('')
    setAttackFlight(false)
    setRewardReveal(null)
    setXp(240)
    setCombo(0)
    setHintsLeft(3)
    setHintUsedThisMission(false)
    setHintTier(0)
    setMissionAttempts(0)
    setValidatedTests([])
    setCompleted([])
    setNoHintCompleted([])
    setResult(null)
    setTelegraph(false)
    setGameOver(false)
    setVictory(false)
    setTreasureOpened(false)
    setShowHint(false)
    setDailyPractice(false)
    setNotice('Campaign reset. Your next run starts now.')
  }

  function applySuggestedFix() {
    setSource(mission.solutionCode)
    setShowFix(false)
    setNotice('Suggested fix added to the editor. Run the tests to verify it.')
  }

  function retryBattle() {
    setPlayerHp(STARTING_HP)
    setBossHp(STARTING_HP)
    setBossDamaged(false)
    setBossDamageLabel('')
    setHeroDamageLabel('')
    setAttackFlight(false)
    setIsAttacking(false)
    setBossAttacking(false)
    setRewardReveal(null)
    setGameOver(false)
    setTelegraph(false)
    setResult(null)
    setMissionAttempts(0)
    setValidatedTests([])
    setNotice('Fresh health restored. Your campaign progress is safe.')
  }

  function startDailyPractice() {
    chooseMission(dailyMission, true)
    setNotice(`Daily practice: ${dailyMission.title}. Solve it for a one-time local bonus.`)
  }

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab') return
    event.preventDefault()
    const textarea = event.currentTarget
    const { selectionStart, selectionEnd } = textarea
    setSource((current) => `${current.slice(0, selectionStart)}    ${current.slice(selectionEnd)}`)
    setResult(null)
    window.requestAnimationFrame(() => textarea.setSelectionRange(selectionStart + 4, selectionStart + 4))
  }

  return (
    <main className={`game-shell ${reducedMotionEnabled ? 'manual-reduced-motion' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#game" aria-label="CodeQuest Bug Monster Battle home">
          <span className="brand-mark"><Bug size={20} /></span>
          <span className="brand-name">CODE<span>QUEST</span><small>ARCADE / 07</small></span>
        </a>
        <div className="topbar-center"><span className="online-dot" /> LIVE CAMPAIGN <span className="topbar-divider" /> SECTOR 07 — {mission.name}</div>
        <div className="topbar-actions">
          <div className="xp-pill"><Sparkles size={14} /><span>{xp.toLocaleString()} <small>XP</small></span></div>
          <button type="button" className="icon-button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'} title={soundOn ? 'Turn sound off' : 'Turn sound on'}>
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button type="button" className={`icon-button settings-button ${reducedMotionEnabled ? 'motion-setting-active' : ''}`} onClick={() => setReducedMotionEnabled((value) => !value)} aria-pressed={reducedMotionEnabled || Boolean(systemPrefersReducedMotion)} aria-label={reducedMotion ? 'Turn on animations' : 'Reduce animations'} title={reducedMotion ? 'Turn on animations' : 'Reduce animations'}>
            <Moon size={16} />
          </button>
        </div>
      </header>

      <div className="campaign-heading">
        <div><span className="eyebrow"><span className="eyebrow-mark" /> CODEQUEST ORIGINAL <span className="heading-slash">/</span> TURN-BASED BATTLE</span><h1>Bug Monster <em>Battle</em></h1></div>
        <div className="campaign-meta"><button type="button" className="daily-button" onClick={startDailyPractice} disabled={Boolean(dailyDateKey && dailyClaimedDate === dailyDateKey)} title="Practice today's local mission for a one-time 25 XP bonus"><CalendarDays size={13} /> {dailyDateKey && dailyClaimedDate === dailyDateKey ? 'DAILY BONUS CLAIMED' : 'DAILY PRACTICE · +25 XP'}</button><span className="live-badge"><Activity size={13} /> {completed.length === missions.length ? 'CAMPAIGN COMPLETE' : 'CAMPAIGN IN PROGRESS'}</span><span className="hero-level"><Shield size={14} /> HERO LV. {Math.floor(xp / 500) + 1}</span></div>
      </div>

      <MissionProgress current={missionIndex} completed={completed} onSelect={chooseMission} />

      <section className="battle-grid" id="game">
        <section className={`arena-panel world-${mission.world}`} aria-label="Battle arena">
          <div className="panel-topline"><span><Swords size={14} /> BATTLE ARENA</span><span className={`arena-state ${telegraph ? 'is-danger' : ''}`}><i /> {telegraph ? 'BOSS ATTACKING' : 'YOU’RE UP NEXT'}</span></div>
          <div className={`arena-scene${telegraph ? ' scene-under-attack' : ''}${bossDamaged ? ' scene-impact' : ''}`}>
            <div className="scene-grid" />
            <div className="scene-stars"><i /><i /><i /><i /><i /><i /></div>
            <div className="arena-aurora" aria-hidden="true" />
            <div className="arena-scanline" aria-hidden="true" />
            <div className="arena-particles" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="boss-level-tag"><span>WORLD 0{mission.world} BOSS</span><b>LV. {mission.id + 3}</b></div>
            <div className="boss-name"><span className="boss-crown"><Crown size={13} /></span><div><b>{mission.boss}</b><small>{mission.worldName} · {mission.difficulty}</small></div></div>
            <BugLord key={mission.id} attacking={bossAttacking} damaged={bossDamaged} defeated={bossHp === 0} reducedMotion={reducedMotion} world={mission.world} />
            <AnimatePresence>
              {attackFlight && <motion.span key={attackSequence} className={`attack-projectile${rewardReveal?.critical ? ' projectile-critical' : ''}`} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 0, scale: 0.5 }} animate={reducedMotion ? { opacity: [0, 1, 0] } : { opacity: [0, 1, 1, 0], x: [0, attackDistance * 0.58, attackDistance, attackDistance], scale: [0.5, 1.15, 1.2, 0.2] }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.3 : 0.58, times: [0, 0.2, 0.78, 1], ease: 'easeOut' }}><Zap size={20} fill="currentColor" /></motion.span>}
              {bossDamageLabel && <motion.span className="floating-damage damage-on-boss" initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.65 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: -21, scale: 1 }} exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -34 }} key={`boss-${bossDamageLabel}`}>{bossDamageLabel}</motion.span>}
              {heroDamageLabel && <motion.span className="floating-damage damage-on-player" initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.65 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: -18, scale: 1 }} exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -30 }} key={`hero-${heroDamageLabel}`}>{heroDamageLabel}</motion.span>}
              {rewardReveal?.critical && result?.passed && <motion.span className="critical-callout" initial={reducedMotion ? false : { opacity: 0, scale: 0.6, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}><Zap size={12} fill="currentColor" /> CRITICAL · FIRST TRY</motion.span>}
            </AnimatePresence>
            <div className="boss-floor" />
            {telegraph && <motion.div className="attack-warning" initial={reducedMotion ? false : { opacity: 0, scale: 0.75 }} animate={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: [0.65, 1, 0.65], scale: 1 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.6, repeat: 2 }}><Zap size={14} fill="currentColor" /> INCOMING STRIKE · −{BOSS_DAMAGE} HP</motion.div>}
            <div className="arena-combatants">
              <div className="hero-name"><span className="hero-status-dot" /> YOU <small>CODE KNIGHT</small></div>
              <PlayerSprite attacking={isAttacking} reducedMotion={reducedMotion} />
            </div>
            <div className="scene-caption"><span>0{mission.world}</span><span className="caption-line" /> {mission.name} <span className="caption-divider">·</span> LEVEL {String(mission.id).padStart(2, '0')}/09</div>
          </div>
          <div className="combat-hud">
            <HealthBar label="HERO" value={playerHp} tone="player" icon={<Heart size={14} />} />
            <div className="combat-status"><span className="turn-chip"><Zap size={12} /> TURN {missionAttempts + 1}</span><span className="combo-chip"><Flame size={13} /> {combo}× STREAK</span></div>
            <HealthBar label="BUG LORD" value={bossHp} tone="boss" icon={<Bug size={14} />} />
          </div>
          <div className="arena-footer">
            <span className="threat-label"><span className="threat-icon"><Zap size={14} /></span><span><b>{telegraph ? 'Counter the strike' : 'Threat detected'}</b><small>{telegraph ? `${mission.boss} hits back when tests fail` : 'Use meaningful tests to land a hit'}</small></span></span>
            <span className="turn-order"><span className={telegraph ? 'turn-active' : ''}>BOSS</span><ArrowRight size={12} /><span className={!telegraph ? 'turn-active' : ''}>HERO</span></span>
          </div>
        </section>

        <section className="challenge-panel" aria-label="Coding challenge">
          <div className="challenge-header">
            <div><span className="challenge-kicker"><Code2 size={13} /> WORLD 0{mission.world} · {mission.worldName} <span>/</span> LEVEL {String(mission.id).padStart(2, '0')}</span><h2>{mission.title}</h2></div>
            <div className="challenge-difficulty"><span className={`difficulty-dots dots-${mission.world}`}><i /><i /><i /></span><small>{mission.difficulty} TIER</small></div>
          </div>

          <motion.aside className={`mission-briefing briefing-world-${mission.world}`} key={`briefing-${mission.id}`} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <span className="briefing-label"><Sparkles size={12} /> MISSION BRIEFING</span>
            <p>{mission.story}</p>
            <small>{mission.description}</small>
          </motion.aside>

          <div className="function-objective"><span className="objective-icon"><Terminal size={15} /></span><span><small>{mission.objective}</small><code>{mission.functionName}({mission.parameters})</code></span><span className="objective-check"><CircleHelp size={15} /></span></div>

          <div className="editor-card">
            <div className="editor-topbar"><div className="editor-file"><span className="python-icon">Py</span><span>{mission.functionName}.py</span><i /></div><span className="editor-mode"><span /> PYTHON 3.12 · SAFE MODE</span></div>
            <div className="editor-body">
              <div className="line-numbers" aria-hidden="true">{source.split('\n').map((_, index) => <span key={index}>{String(index + 1).padStart(2, '0')}</span>)}</div>
              <label className="sr-only" htmlFor="code-editor">Edit the {mission.functionName} Python function</label>
              <div className="editor-code-area">
                <pre className="editor-highlight" aria-hidden="true"><code>{source.split('\n').map((line, index) => <span className="highlight-line" key={index}>{highlightPythonLine(line)}{index < source.split('\n').length - 1 ? '\n' : ''}</span>)}</code></pre>
                <textarea id="code-editor" spellCheck={false} value={source} onKeyDown={handleEditorKeyDown} onChange={(event) => { setSource(event.target.value); setResult(null); setNotice('') }} disabled={gameOver || victory} aria-describedby="editor-safety-note" />
              </div>
            </div>
            <div className="editor-bottom"><span id="editor-safety-note"><Shield size={12} /> SAFE CHALLENGE CHECKER · NO CODE EXECUTION</span><span>{source.split('\n').length} LINES <span className="bottom-divider">·</span> UTF-8</span></div>
          </div>

          <div className="editor-actions">
            <button type="button" className="run-button" onClick={runTests} disabled={gameOver || victory}><span className="run-icon"><Terminal size={15} /></span> Run tests <ArrowRight size={15} /></button>
            <button type="button" className="hint-button" onClick={requestHint} disabled={!hintsLeft || hintTier >= mission.hints.length || showHint || gameOver || victory}><Lightbulb size={15} /> {hintTier ? `Next clue · ${hintTier + 1}/3` : 'Get a hint'} <span className="hint-counter">{hintsLeft}<small> LEFT</small></span></button>
          </div>

          <AnimatePresence>
            {showHint && <motion.div className="hint-card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Lightbulb size={15} /><span><b>CLUE {hintTier} / 3</b>{mission.hints[hintTier - 1]}</span><button type="button" aria-label="Dismiss hint" onClick={() => setShowHint(false)}>×</button></motion.div>}
          </AnimatePresence>

          <div className={`test-results ${result ? (result.passed ? 'tests-passed' : 'tests-failed') : ''}`}>
            <div className="test-results-heading"><span><span className="test-icon">{result?.passed ? <CheckCircle2 size={15} /> : <Terminal size={14} />}</span> TEST RESULTS</span><span className="test-status">{result ? `${result.tests.filter((test) => test.passed).length}/${result.tests.length} PASSED` : 'WAITING FOR RUN'}</span></div>
            {result ? (
              <>
                <div className="test-table">
                  <div className="test-table-head"><span>INPUT</span><span>EXPECTED</span><span>ACTUAL</span><span>STATUS</span></div>
                  {result.tests.map((test, index) => <div className="test-row" key={index}><code>{displayValue(test.input)}</code><code>{displayValue(test.expected)}</code><code>{displayValue(test.actual)}</code><span className={`test-pill ${test.passed ? 'pass' : 'fail'}`}>{test.passed ? <><Check size={10} /> PASS</> : 'FAIL'}</span></div>)}
                </div>
                <p className="result-message">{result.passed ? <CheckCircle2 size={14} /> : <Zap size={14} />}{result.diagnostic}</p>
              </>
            ) : <div className="waiting-tests"><span className="waiting-bullet" /><span>Edit the function and run all {mission.tests.length} predefined test cases.</span><span className="expected-hint">{mission.difficulty}</span></div>}
          </div>
          {result?.passed && <motion.aside className="lesson-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><BookOpen size={15} /><span><b>LESSON UNLOCKED · {mission.concept}</b><small>{mission.explanation}</small></span></motion.aside>}
          {result?.passed && rewardReveal && <motion.aside className="reward-reveal" initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
            <span className="reward-xp"><Sparkles size={14} /> +{rewardReveal.xp} XP</span>
            <span className="reward-streak"><Flame size={14} /> {rewardReveal.streak}× STREAK</span>
            {rewardReveal.firstClear && missions.find((item) => !completed.includes(item.id)) && <span className="reward-unlock"><CheckCircle2 size={13} /> LEVEL {String(missions.find((item) => !completed.includes(item.id))?.id).padStart(2, '0')} UNLOCKED</span>}
          </motion.aside>}
          {result?.passed && !victory && <button type="button" className="next-mission-button" onClick={advanceMission}>Enter next unlocked level <ArrowRight size={15} /></button>}

          <div className={`assistant-panel ${assistantOpen ? 'assistant-expanded' : ''}`}>
            <button type="button" className="assistant-toggle" onClick={() => setAssistantOpen((value) => !value)} aria-expanded={assistantOpen}>
              <span className="assistant-logo"><Sparkles size={15} /></span><span className="assistant-copy"><b>Copilot assistance</b><small>Get a hand from your AI pair programmer</small></span><span className="assistant-tag">OPTIONAL</span><ChevronRight className="assistant-chevron" size={16} />
            </button>
            {assistantOpen && <div className="assistant-content"><p>Copy a learning prompt to GitHub Copilot Chat, or preview a suggested fix. There is no live Copilot API connection and no key is required.</p><div className="prompt-modes"><button type="button" className={promptMode === 'explain' ? 'selected' : ''} aria-pressed={promptMode === 'explain'} onClick={() => setPromptMode('explain')}>Explain</button><button type="button" className={promptMode === 'tests' ? 'selected' : ''} aria-pressed={promptMode === 'tests'} onClick={() => setPromptMode('tests')}>Test ideas</button><button type="button" className={promptMode === 'review' ? 'selected' : ''} aria-pressed={promptMode === 'review'} onClick={() => setPromptMode('review')}>Review code</button></div><div className="assistant-prompt">{prompt}</div><div className="assistant-actions"><button type="button" onClick={copyPrompt}><Clipboard size={13} /> Copy prompt</button><button type="button" onClick={() => setShowFix((value) => !value)}><Code2 size={13} /> {showFix ? 'Hide fix' : 'View proposed fix'}</button></div>{showFix && <div className="suggested-fix"><span>PROPOSED FIX</span><code>{mission.solutionCode}</code><button type="button" onClick={applySuggestedFix}>Use this fix <ArrowRight size={12} /></button></div>}</div>}
          </div>
        </section>
      </section>

      <footer className="bottom-bar">
        <div className="achievement-strip"><span className="achievement-icon"><Award size={15} /></span><span><b>ACHIEVEMENTS</b><small>{completed.length ? `${completed.length} boss${completed.length > 1 ? 'es' : ''} defeated` : 'First boss awaits'}</small></span><span className={`achievement-medal ${completed.length >= 1 ? 'unlocked' : ''}`} title="Bug squasher"><Bug size={13} /></span><span className={`achievement-medal ${noHintAchievement ? 'unlocked' : ''}`} title="No-hint bonus"><Zap size={13} /></span><span className={`achievement-medal ${victoryAchieved ? 'unlocked' : ''}`} title="Campaign complete"><Trophy size={13} /></span></div>
        <div className="progress-copy"><span>CAMPAIGN PROGRESS</span><b>{completed.length}<small> / 9 LEVELS</small></b><div className="progress-track"><span style={{ width: `${(completed.length / missions.length) * 100}%` }} /></div></div>
        <div className="hint-inventory"><Lightbulb size={15} /><span>HINT TOKENS</span><b>{hintsLeft}<small> / 3</small></b></div>
      </footer>

      <AnimatePresence>{notice && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onAnimationComplete={() => { window.setTimeout(() => setNotice(''), 3500) }}><Sparkles size={14} />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></motion.div>}</AnimatePresence>

      <AnimatePresence>
        {(victory || gameOver) && (
          <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className={`end-modal ${gameOver ? 'end-defeat' : 'end-victory'}`} role="dialog" aria-modal="true" aria-labelledby="end-title" initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className={`modal-emblem ${gameOver ? 'defeat-emblem' : ''}`}>{gameOver ? <Heart size={28} /> : treasureOpened ? <Trophy size={28} /> : <Sparkles size={28} />}</div>
              <span className="modal-kicker">{gameOver ? 'SIGNAL LOST' : treasureOpened ? 'LEGENDARY LOOT UNLOCKED' : 'CAMPAIGN COMPLETE'}</span>
              <h2 id="end-title">{gameOver ? 'The Bug Lord prevails.' : treasureOpened ? 'You are a Bug Slayer.' : 'The realm is bug-free.'}</h2>
              <p>{gameOver ? 'Your hero needs a recharge. Retry this level without losing campaign progress.' : treasureOpened ? `You cleared all 9 missions and earned ${xp.toLocaleString()} XP. The CodeQuest realm is safe again.` : 'Nine levels. Three worlds. The treasure chest is yours.'}</p>
              {victory && !treasureOpened && <motion.div className="treasure-chest" initial={reducedMotion ? false : { scale: 0.5, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={reducedMotion ? { duration: 0 } : { type: 'spring', delay: 0.2, stiffness: 180, damping: 12 }}><span className="chest-sparkle"><Sparkles size={16} /></span><div className="chest-lock"><LockKeyhole size={17} /></div><div className="chest-base" /></motion.div>}
              {treasureOpened && <motion.div className="loot-card" initial={reducedMotion ? false : { opacity: 0, scale: 0.88, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}><Crown size={17} /><span><b>BUG SLAYER CROWN</b><small>Legendary achievement · 200 bonus XP</small></span><Sparkles size={16} /></motion.div>}
              <div className="modal-actions">
                {victory && !treasureOpened ? (
                  <button type="button" className="run-button" onClick={() => { setTreasureOpened(true); setXp((value) => value + 200) }}><Sparkles size={15} /> Open treasure <ArrowRight size={15} /></button>
                ) : gameOver ? (
                  <>
                    <button type="button" className="run-button" onClick={retryBattle}><Heart size={15} /> Retry this level <ArrowRight size={15} /></button>
                    <button type="button" className="secondary-modal-button" onClick={replay}>Restart campaign</button>
                  </>
                ) : (
                  <button type="button" className="run-button" onClick={replay}><RotateCcw size={15} /> Play again <ArrowRight size={15} /></button>
                )}
                {!gameOver && treasureOpened && <button type="button" className="secondary-modal-button" onClick={replay}>Run it back</button>}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {victory && <span className="sr-only" aria-live="polite">Campaign complete. All missions passed.</span>}
      <span className="sr-only" aria-live="polite">{result?.message}</span>
    </main>
  )
}

export default App
