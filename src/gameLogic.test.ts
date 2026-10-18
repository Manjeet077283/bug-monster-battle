import { describe, expect, it } from 'vitest'
import {
  applyBossDamage,
  calculateBossHp,
  calculateMissionXp,
  didWinCampaign,
  explainMission,
  isMissionUnlocked,
  missions,
  runChallenge,
} from './gameLogic'

describe('nine-mission campaign', () => {
  it('covers the three learning worlds with distinct lessons', () => {
    expect(missions).toHaveLength(9)
    expect(missions.map((mission) => mission.world)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3])
    expect(new Set(missions.map((mission) => mission.concept)).size).toBe(9)
  })

  it('accepts each mission solution only after all its tests pass', () => {
    for (const [index, mission] of missions.entries()) {
      const solution = mission.solutionCode
      const result = runChallenge(solution, missions[index])
      expect(result.passed, `mission ${index + 1}: ${result.diagnostic}`).toBe(true)
      expect(result.tests.every((test) => test.passed)).toBe(true)
    }
  })

  it('reports the starting bug and expected/actual feedback on every level', () => {
    for (const mission of missions) {
      const result = runChallenge(mission.initialCode, mission)
      expect(result.passed, `mission ${mission.id} starter should contain a bug`).toBe(false)
      expect(result.tests).toHaveLength(3)
      expect(result.diagnostic.length).toBeGreaterThan(0)
      expect(result.tests.some((test) => test.actual !== null)).toBe(true)
    }
  })

  it('shows a beginner-friendly expected/actual report for the original treasure bug', () => {
    const result = runChallenge(missions[0].initialCode, missions[0])
    expect(result.tests[0]).toMatchObject({ expected: 5, actual: 23, passed: false })
    expect(result.diagnostic).toContain('expected 5 but got 23')
  })

  it('explains each programming concept after the solve', () => {
    for (const mission of missions) {
      const lesson = explainMission(mission)
      expect(lesson.concept).toBeTruthy()
      expect(lesson.explanation.length).toBeGreaterThan(30)
    }
  })
})

describe('safe checker behavior', () => {
  it('does not execute unsupported source or report it as passing', () => {
    const result = runChallenge(
      'def calculate_treasure(level, bonus):\n    return __import__("os").system("whoami")',
      missions[0],
    )

    expect(result.passed).toBe(false)
    expect(result.tests.every((test) => test.actual === null)).toBe(true)
  })

  it('rejects a missing function with an actionable diagnostic', () => {
    const result = runChallenge('print("hello")', missions[0])
    expect(result.passed).toBe(false)
    expect(result.diagnostic).toContain('function name')
  })
})

describe('campaign rewards and retry safety', () => {
  it('requires all nine missions for campaign victory', () => {
    expect(didWinCampaign(missions.slice(0, 8).map((mission) => mission.id))).toBe(false)
    expect(didWinCampaign(missions.map((mission) => mission.id))).toBe(true)
  })

  it('unlocks missions one at a time and keeps cleared levels replayable', () => {
    for (let completedCount = 0; completedCount < missions.length; completedCount += 1) {
      const completed = missions.slice(0, completedCount).map((mission) => mission.id)
      expect(missions.every((mission) =>
        isMissionUnlocked(mission.id, completed) === (mission.id <= completedCount + 1),
      )).toBe(true)
    }
    expect(isMissionUnlocked(1, missions.map((mission) => mission.id))).toBe(true)
  })

  it('only defeats a boss when the complete challenge passes', () => {
    expect(calculateBossHp(true, 0)).toBe(0)
    expect(calculateBossHp(false, 0)).toBe(100)
    expect(calculateBossHp(false, 1)).toBe(82)
    expect(calculateBossHp(false, 2)).toBe(64)
    expect(calculateBossHp(false, 3)).toBe(46)
  })

  it('applies boss damage and clamps health at zero for recovery', () => {
    expect(applyBossDamage(100)).toBe(85)
    expect(applyBossDamage(10)).toBe(0)
  })

  it('gives a modest first-attempt no-hint bonus and no repeat-farm XP', () => {
    expect(calculateMissionXp(false, false, true)).toBe(150)
    expect(calculateMissionXp(true, false, true)).toBe(125)
    expect(calculateMissionXp(false, false, false)).toBe(125)
    expect(calculateMissionXp(false, true)).toBe(0)
  })
})
