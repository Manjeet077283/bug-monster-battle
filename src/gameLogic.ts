export type ChallengeValue =
  | number
  | string
  | boolean
  | ChallengeValue[]
  | { [key: string]: ChallengeValue }
export type ChallengeInput = Record<string, ChallengeValue>

export type ChallengeTest = {
  input: ChallengeInput
  expected: ChallengeValue
}

export type MissionKind =
  | 'expression'
  | 'conditional'
  | 'loop-sum'
  | 'dict-get'
  | 'max-value'
  | 'filtered-count'

export type Mission = {
  id: number
  world: number
  worldName: string
  name: string
  title: string
  story: string
  objective: string
  description: string
  difficulty: string
  boss: string
  functionName: string
  parameters: string
  initialCode: string
  solutionCode: string
  hints: [string, string, string]
  explanation: string
  concept: string
  formula: string
  kind: MissionKind
  tests: ChallengeTest[]
}

export type TestResult = ChallengeTest & {
  actual: ChallengeValue | null
  passed: boolean
}

export type ChallengeResult = {
  passed: boolean
  message: string
  diagnostic: string
  tests: TestResult[]
}

export const BOSS_DAMAGE = 15
const MISSION_XP = 100
const NO_HINT_XP_BONUS = 25

export function applyBossDamage(currentHp: number): number {
  return Math.max(0, currentHp - BOSS_DAMAGE)
}

export function calculateBossHp(challengePassed: boolean, validatedTestCount: number): number {
  if (challengePassed) return 0
  return Math.max(10, 100 - validatedTestCount * 18)
}

export function isMissionUnlocked(missionId: number, completedMissionIds: number[]): boolean {
  if (completedMissionIds.includes(missionId)) return true
  const firstUncleared = missions.find((mission) => !completedMissionIds.includes(mission.id))?.id ?? missions.length + 1
  return missionId <= firstUncleared
}

export function calculateMissionXp(
  hintUsed: boolean,
  alreadyCompleted: boolean,
  firstAttempt = true,
): number {
  if (alreadyCompleted) return 0
  const firstAttemptBonus = firstAttempt ? 25 : 0
  const noHintBonus = hintUsed ? 0 : NO_HINT_XP_BONUS
  return MISSION_XP + firstAttemptBonus + noHintBonus
}

export function didWinCampaign(completedMissionIds: number[]): boolean {
  return missions.every((mission) => completedMissionIds.includes(mission.id))
}

export const missions: Mission[] = [
  {
    id: 1, world: 1, worldName: 'BUG FOREST', name: 'MOSSY RUINS', title: 'Pack the treasure',
    story: 'A greedy beetle scrambled the scout’s supply count. The forest gate will open when the numbers add up.',
    objective: 'Add the level and its bonus to calculate the treasure total.',
    description: 'Repair the arithmetic so every explorer gets the right amount of treasure.',
    difficulty: 'INITIATE', boss: 'MUDCRAWLER', functionName: 'calculate_treasure', parameters: 'level, bonus',
    initialCode: 'def calculate_treasure(level, bonus):\n    return level + bonus * 10',
    solutionCode: 'def calculate_treasure(level, bonus):\n    return level + bonus',
    hints: ['Try the function with level 3 and bonus 2 by hand.', 'The bonus should be added once, not multiplied by ten.', 'Replace `bonus * 10` with `bonus`.'],
    explanation: 'The `*` operator multiplies before `+` adds. That made the bonus ten times too large. Adding `level + bonus` matches the intended reward.',
    concept: 'Variables & arithmetic', formula: 'level + bonus', kind: 'expression',
    tests: [{ input: { level: 3, bonus: 2 }, expected: 5 }, { input: { level: 7, bonus: 4 }, expected: 11 }, { input: { level: 12, bonus: 0 }, expected: 12 }],
  },
  {
    id: 2, world: 1, worldName: 'BUG FOREST', name: 'GLOWCAP GROVE', title: 'Greet the guild',
    story: 'The friendly Glowcaps only share their map with travelers who greet them by name.',
    objective: 'Return a personalized greeting, including the traveler’s name.',
    description: 'Join two pieces of text with `+` so the greeting changes for each traveler.',
    difficulty: 'INITIATE', boss: 'GLOWCAP MIMIC', functionName: 'greet', parameters: 'name',
    initialCode: 'def greet(name):\n    return "Hello, " + "name"',
    solutionCode: 'def greet(name):\n    return "Hello, " + name',
    hints: ['A name inside quotes is literal text, not the variable.', 'Keep the greeting in quotes, then add the name variable.', 'Use `return "Hello, " + name`.'],
    explanation: 'Quoted text is a string literal. The word `name` without quotes refers to the value passed into the function. The `+` operator joins these strings.',
    concept: 'Strings & output', formula: '"Hello, " + name', kind: 'expression',
    tests: [{ input: { name: 'Ada' }, expected: 'Hello, Ada' }, { input: { name: 'Kai' }, expected: 'Hello, Kai' }, { input: { name: 'Bug Slayer' }, expected: 'Hello, Bug Slayer' }],
  },
  {
    id: 3, world: 1, worldName: 'BUG FOREST', name: 'THORNBRANCH PASS', title: 'Choose the safe path',
    story: 'A thorn gate checks each adventurer’s score. The path opens only when the score meets the requirement.',
    objective: 'Return "pass" when score is at least the threshold, otherwise return "retry".',
    description: 'Complete the if/else branches using a comparison and two clear outcomes.',
    difficulty: 'SCOUT', boss: 'THORNBACK', functionName: 'check_score', parameters: 'score, threshold',
    initialCode: 'def check_score(score, threshold):\n    if score > threshold:\n        return "pass"\n    else:\n        return "retry"',
    solutionCode: 'def check_score(score, threshold):\n    if score >= threshold:\n        return "pass"\n    else:\n        return "retry"',
    hints: ['One test has a score exactly equal to the threshold.', 'The gate opens at the threshold too, so strict `>` is not enough.', 'Change `score > threshold` to `score >= threshold`.'],
    explanation: '`>` means strictly greater. `>=` also accepts equality, which is what “at least the threshold” requires.',
    concept: 'If / else', formula: 'score >= threshold', kind: 'conditional',
    tests: [{ input: { score: 9, threshold: 10 }, expected: 'retry' }, { input: { score: 10, threshold: 10 }, expected: 'pass' }, { input: { score: 14, threshold: 10 }, expected: 'pass' }],
  },
  {
    id: 4, world: 2, worldName: 'NEON DUNGEON', name: 'PIXEL CATACOMBS', title: 'Count the crystals',
    story: 'A tunnel collapses behind you. Count every crystal from the first one through the last to power the exit.',
    objective: 'Use a loop to return the sum of all whole numbers from 1 through n.',
    description: 'The endpoint is inclusive: the loop must reach n before returning the running total.',
    difficulty: 'SCOUT', boss: 'PIXEL DEVOURER', functionName: 'sum_crystals', parameters: 'n',
    initialCode: 'def sum_crystals(n):\n    total = 0\n    for number in range(1, n):\n        total += number\n    return total',
    solutionCode: 'def sum_crystals(n):\n    total = 0\n    for number in range(1, n + 1):\n        total += number\n    return total',
    hints: ['For n = 4, you should add 1 + 2 + 3 + 4.', 'Python’s range stop is excluded, so the stop needs to be one above n.', 'Use `range(1, n + 1)` to include n.'],
    explanation: '`range(start, stop)` includes start but stops just before stop. Adding one to the stop lets the loop include n; the accumulator collects each value.',
    concept: 'Loops & accumulators', formula: 'range(1, n + 1); total += number', kind: 'loop-sum',
    tests: [{ input: { n: 1 }, expected: 1 }, { input: { n: 4 }, expected: 10 }, { input: { n: 8 }, expected: 36 }],
  },
  {
    id: 5, world: 2, worldName: 'NEON DUNGEON', name: 'ECHO FORGE', title: 'Return the strike',
    story: 'The forge scales a weapon’s base force by its rune power. The old smith added the values instead of multiplying.',
    objective: 'Return the damage as base force multiplied by rune power.',
    description: 'Repair the computed value; the function already returns the damage it calculates.',
    difficulty: 'SCOUT', boss: 'IRON ECHO', functionName: 'calculate_damage', parameters: 'base, multiplier',
    initialCode: 'def calculate_damage(base, multiplier):\n    damage = base + multiplier\n    return damage',
    solutionCode: 'def calculate_damage(base, multiplier):\n    damage = base * multiplier\n    return damage',
    hints: ['A multiplier scales a value; it is not an amount to add.', 'Change the calculation for damage, not the return statement.', 'Use `damage = base * multiplier`.'],
    explanation: 'The function already returns `damage`; the bug was in how that variable was calculated. Multiplication scales the base strike by the rune multiplier.',
    concept: 'Functions & return values', formula: 'base * multiplier', kind: 'expression',
    tests: [{ input: { base: 6, multiplier: 2 }, expected: 12 }, { input: { base: 9, multiplier: 3 }, expected: 27 }, { input: { base: 12, multiplier: 1 }, expected: 12 }],
  },
  {
    id: 6, world: 2, worldName: 'NEON DUNGEON', name: 'ARCHIVIST VAULT', title: 'Find the missing key',
    story: 'A sleepy archivist misplaced some stock records. Look up a key safely, even when it is missing from the dictionary.',
    objective: 'Return the inventory count for item, or 0 when the key is missing.',
    description: 'Direct dictionary indexing raises an error for an absent key; the vault has an empty-pack test.',
    difficulty: 'ADEPT', boss: 'THE INDEXER', functionName: 'count_item', parameters: 'inventory, item',
    initialCode: 'def count_item(inventory, item):\n    return inventory[item]',
    solutionCode: 'def count_item(inventory, item):\n    return inventory.get(item, 0)',
    hints: ['Try looking up "key" in an empty dictionary.', 'Python dictionaries have a lookup method that accepts a fallback value.', 'Use `inventory.get(item, 0)` so a missing key returns zero.'],
    explanation: 'Dictionary indexing works for existing keys but raises a KeyError for missing ones. `.get(key, default)` returns the fallback when the key is absent.',
    concept: 'Lists, dictionaries & edge cases', formula: 'inventory.get(item, 0)', kind: 'dict-get',
    tests: [{ input: { inventory: { key: 2, potion: 1 }, item: 'key' }, expected: 2 }, { input: { inventory: { potion: 1 }, item: 'key' }, expected: 0 }, { input: { inventory: {}, item: 'key' }, expected: 0 }],
  },
  {
    id: 7, world: 3, worldName: 'CYBER ABYSS', name: 'FRACTURE BRIDGE', title: 'Read the danger signs',
    story: 'The bridge reacts to your remaining energy: empty means down, low means critical, and otherwise the crossing is ready.',
    objective: 'Classify health as down (0), critical (below 30), or ready.',
    description: 'Order the conditions from most specific to broadest so the right branch wins.',
    difficulty: 'ADEPT', boss: 'FRACTURE WARDEN', functionName: 'health_status', parameters: 'health',
    initialCode: 'def health_status(health):\n    if health < 30:\n        if health <= 0:\n            return "critical"\n        else:\n            return "critical"\n    else:\n        return "ready"',
    solutionCode: 'def health_status(health):\n    if health <= 0:\n        return "down"\n    else:\n        if health < 30:\n            return "critical"\n        else:\n            return "ready"',
    hints: ['A health value of 0 currently matches the first condition.', 'Check the special zero case before checking the wider low-health range.', 'Put `if health <= 0` before `elif health < 30`.'],
    explanation: 'Conditional branches run from top to bottom. Since zero is also less than 30, the broad low-health test hid the down case. Put the most specific case first.',
    concept: 'Nested conditions & order', formula: 'if health <= 0 / elif health < 30 / else', kind: 'conditional',
    tests: [{ input: { health: 0 }, expected: 'down' }, { input: { health: 20 }, expected: 'critical' }, { input: { health: 70 }, expected: 'ready' }],
  },
  {
    id: 8, world: 3, worldName: 'CYBER ABYSS', name: 'ORACLE ENGINE', title: 'Find the strongest signal',
    story: 'Three signal towers disagree. Search the whole reading list to find the strongest signal for the final portal.',
    objective: 'Return the largest value in the signal readings.',
    description: 'Test a tie and negative readings too: sorting or checking only one value can miss the maximum.',
    difficulty: 'ELITE', boss: 'ORACLE-9', functionName: 'strongest_signal', parameters: 'readings',
    initialCode: 'def strongest_signal(readings):\n    return min(readings)',
    solutionCode: 'def strongest_signal(readings):\n    return max(readings)',
    hints: ['A tie does not change the answer: the greatest reading is still valid.', 'Use the built-in that returns the largest item, not the smallest.', 'Return `max(readings)`.'],
    explanation: '`min` finds the smallest value. `max` searches the full list and returns its greatest value; it handles negative values and ties.',
    concept: 'Algorithms & test reasoning', formula: 'max(readings)', kind: 'max-value',
    tests: [{ input: { readings: [3, 11, 7] }, expected: 11 }, { input: { readings: [-8, -2, -5] }, expected: -2 }, { input: { readings: [6, 6, 2] }, expected: 6 }],
  },
  {
    id: 9, world: 3, worldName: 'CYBER ABYSS', name: 'BUG LORD’S CORE', title: 'Break the final loop',
    story: 'The Bug Lord fused the dungeon’s lessons into one last shield. Count only rewards that meet the unlock threshold.',
    objective: 'Loop through rewards and count values greater than or equal to threshold.',
    description: 'Combine a loop, a conditional, and an accumulator. One boundary test lands exactly on the threshold.',
    difficulty: 'BOSS', boss: 'THE BUG LORD', functionName: 'count_unlocks', parameters: 'rewards, threshold',
    initialCode: 'def count_unlocks(rewards, threshold):\n    count = 0\n    for reward in rewards:\n        if reward > threshold:\n            count += 1\n    return count',
    solutionCode: 'def count_unlocks(rewards, threshold):\n    count = 0\n    for reward in rewards:\n        if reward >= threshold:\n            count += 1\n    return count',
    hints: ['The threshold itself should count as an unlock.', 'Your loop and counter work; inspect the comparison boundary.', 'Change `reward > threshold` to `reward >= threshold`.'],
    explanation: 'A loop visits each reward, the if-statement filters them, and the accumulator counts matches. `>=` includes rewards exactly at the threshold.',
    concept: 'Final boss: loops + conditions + tests', formula: 'for reward in rewards: if reward >= threshold: count += 1', kind: 'filtered-count',
    tests: [{ input: { rewards: [2, 5, 7, 3], threshold: 5 }, expected: 2 }, { input: { rewards: [4, 4], threshold: 4 }, expected: 2 }, { input: { rewards: [], threshold: 1 }, expected: 0 }],
  },
]

type Token = { kind: 'number' | 'string' | 'name' | 'operator'; value: string }

function tokenize(expression: string): Token[] | null {
  const tokens: Token[] = []
  let cursor = 0

  while (cursor < expression.length) {
    if (/\s/.test(expression[cursor])) {
      cursor += 1
      continue
    }

    const remaining = expression.slice(cursor)
    const match = remaining.match(/^(?:"[^"\n]*"|'[^'\n]*'|\d+(?:\.\d+)?|[A-Za-z_]\w*|>=|<=|==|!=|[()+\-*/<>])/)
    if (!match) return null

    const value = match[0]
    const kind: Token['kind'] = value.startsWith('"') || value.startsWith("'")
      ? 'string'
      : /^\d/.test(value)
        ? 'number'
        : /^[A-Za-z_]/.test(value)
          ? 'name'
          : 'operator'
    tokens.push({ kind, value })
    cursor += value.length
  }

  return tokens
}

function expressionValue(expression: string, variables: ChallengeInput): ChallengeValue | null {
  const tokens = tokenize(expression) ?? []
  if (tokens.length === 0) return null
  let index = 0
  const isNumber = (value: ChallengeValue): value is number => typeof value === 'number'

  function primary(): ChallengeValue | null {
    const token = tokens[index]
    if (!token) return null

    if (token.value === '+' || token.value === '-') {
      index += 1
      const value = primary()
      if (value === null || !isNumber(value)) return null
      return token.value === '-' ? -value : value
    }
    if (token.value === '(') {
      index += 1
      const value = booleanExpression()
      if (tokens[index]?.value !== ')') return null
      index += 1
      return value
    }
    if (token.kind === 'number') {
      index += 1
      return Number(token.value)
    }
    if (token.kind === 'string') {
      index += 1
      return token.value.slice(1, -1)
    }
    if (token.kind === 'name') {
      index += 1
      if (Object.hasOwn(variables, token.value)) return variables[token.value]
      if (token.value === 'True') return true
      if (token.value === 'False') return false
    }
    return null
  }

  function product(): ChallengeValue | null {
    let value = primary()
    if (value === null) return null
    while (tokens[index]?.value === '*' || tokens[index]?.value === '/') {
      const operator = tokens[index++].value
      const right = primary()
      if (right === null || !isNumber(value) || !isNumber(right) || (operator === '/' && right === 0)) return null
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  function sum(): ChallengeValue | null {
    let value = product()
    if (value === null) return null
    while (tokens[index]?.value === '+' || tokens[index]?.value === '-') {
      const operator = tokens[index++].value
      const right = product()
      if (right === null) return null
      if (operator === '+' && typeof value === 'string' && typeof right === 'string') value += right
      else if (isNumber(value) && isNumber(right)) value = operator === '+' ? value + right : value - right
      else return null
    }
    return value
  }

  function comparison(): ChallengeValue | null {
    const left = sum()
    if (left === null) return null
    const operator = tokens[index]?.value
    if (!operator || !['>', '<', '>=', '<=', '==', '!='].includes(operator)) return left
    index += 1
    const right = sum()
    if (right === null) return null
    if (operator === '==') return left === right
    if (operator === '!=') return left !== right
    if (typeof left === 'number' && typeof right === 'number') {
      if (operator === '>') return left > right
      if (operator === '<') return left < right
      if (operator === '>=') return left >= right
      return left <= right
    }
    if (typeof left === 'string' && typeof right === 'string') {
      if (operator === '>') return left > right
      if (operator === '<') return left < right
      if (operator === '>=') return left >= right
      return left <= right
    }
    return null
  }

  function booleanExpression(): ChallengeValue | null {
    let value = comparison()
    while (tokens[index]?.value === 'and' || tokens[index]?.value === 'or') {
      const operator = tokens[index++].value
      const right = comparison()
      if (typeof value !== 'boolean' || typeof right !== 'boolean') return null
      value = operator === 'and' ? value && right : value || right
    }
    return value
  }

  const result = booleanExpression()
  return index === tokens.length ? result : null
}

function functionBody(source: string, mission: Mission): string | null {
  const match = source.match(
    new RegExp(`^\\s*def\\s+${mission.functionName}\\s*\\(\\s*${mission.parameters.replaceAll(', ', '\\s*,\\s*')}\\s*\\)\\s*:[ \\t]*([\\s\\S]*?)(?=\\n\\s*def\\b|$)`),
  )
  return match?.[1] ?? null
}

function returnedExpression(body: string, variables: ChallengeInput): ChallengeValue | null {
  const match = body.match(/^\s*return\s+(.+?)\s*$/m)
  if (!match) return null
  const assignment = body.match(/^\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/m)
  if (!assignment) return expressionValue(match[1], variables)
  const value = expressionValue(assignment[2], variables)
  return value === null
    ? null
    : expressionValue(match[1], { ...variables, [assignment[1]]: value })
}

function evaluateConditional(body: string, variables: ChallengeInput): ChallengeValue | null {
  const lines = body.split(/\r?\n/)
  const evaluateBlock = (block: string): ChallengeValue | null => {
    const firstLine = block.split(/\r?\n/).find((line) => line.trim().length > 0)
    return firstLine?.trim().startsWith('if ')
      ? evaluateConditional(block, variables)
      : returnedExpression(block, variables)
  }

  let index = 0
  while (index < lines.length) {
    while (index < lines.length && lines[index].trim() === '') index += 1
    if (index >= lines.length) break
    const header = lines[index].match(/^(\s*)(if|elif)\s+(.+?)\s*:\s*$/)
    const fallback = lines[index].match(/^(\s*)else\s*:\s*$/)

    if (fallback) {
      const indent = fallback[1].length
      const block = lines.slice(index + 1).filter((line) =>
        line.trim() && (line.match(/^\s*/)?.[0].length ?? 0) > indent,
      )
      return block.length ? evaluateBlock(block.join('\n')) : null
    }
    if (!header) return null

    const indent = header[1].length
    let end = index + 1
    while (end < lines.length) {
      const line = lines[end]
      if (!line.trim()) {
        end += 1
        continue
      }
      const lineIndent = line.match(/^\s*/)?.[0].length ?? 0
      if (lineIndent <= indent && /^(?:elif|else)\b/.test(line.trim())) break
      if (lineIndent < indent) break
      end += 1
    }

    const condition = expressionValue(header[3], variables)
    if (typeof condition !== 'boolean') return null
    if (condition) return evaluateBlock(lines.slice(index + 1, end).join('\n'))
    index = end
  }
  return null
}

function evaluateLoopSum(body: string, input: ChallengeInput): ChallengeValue | null {
  if (typeof input.n !== 'number') return null
  const supported = /^\s*total\s*=\s*0\s*\n\s*for\s+number\s+in\s+range\(\s*1\s*,\s*n(?:\s*\+\s*1)?\s*\)\s*:\s*\n\s*total\s*\+=\s*number\s*\n\s*return\s+total\s*$/m
  if (!supported.test(body)) return null
  return /range\(\s*1\s*,\s*n\s*\+\s*1\s*\)/.test(body)
    ? input.n * (input.n + 1) / 2
    : Math.max(0, input.n - 1) * input.n / 2
}

function evaluateDictionaryGet(body: string, input: ChallengeInput): ChallengeValue | null {
  const safeLookup = /^\s*return\s+inventory\.get\(item\s*,\s*0\)\s*$/m.test(body)
  const directLookup = /^\s*return\s+inventory\[item\]\s*$/m.test(body)
  if (!safeLookup && !directLookup) return null
  const inventory = input.inventory
  if (typeof inventory !== 'object' || inventory === null || Array.isArray(inventory) || typeof input.item !== 'string') return null
  if (Object.hasOwn(inventory, input.item)) return inventory[input.item]
  return safeLookup ? 0 : `KeyError: ${JSON.stringify(input.item)}`
}

function evaluateMaximum(body: string, input: ChallengeInput): ChallengeValue | null {
  const operation = body.match(/^\s*return\s+(max|min)\(readings\)\s*$/m)?.[1]
  if (!operation) return null
  const readings = input.readings
  return Array.isArray(readings) && readings.length > 0 && readings.every((value) => typeof value === 'number')
    ? operation === 'max'
      ? Math.max(...readings as number[])
      : Math.min(...readings as number[])
    : null
}

function evaluateFilteredCount(body: string, input: ChallengeInput): ChallengeValue | null {
  const comparison = body.match(/^\s*count\s*=\s*0\s*\n\s*for\s+reward\s+in\s+rewards\s*:\s*\n\s*if\s+reward\s*(>=|>)\s*threshold\s*:\s*\n\s*count\s*\+=\s*1\s*\n\s*return\s+count\s*$/m)?.[1]
  if (!comparison || typeof input.threshold !== 'number') return null
  const rewards = input.rewards
  if (!Array.isArray(rewards) || !rewards.every((value) => typeof value === 'number')) return null
  const threshold = input.threshold
  if (typeof threshold !== 'number') return null
  return rewards.filter((value) => typeof value === 'number' && (comparison === '>=' ? value >= threshold : value > threshold)).length
}

function formatValue(value: ChallengeValue | null): string {
  if (value === null) return 'Syntax / unsupported code'
  return typeof value === 'string' ? `"${value}"` : String(value)
}

export function runChallenge(source: string, mission: Mission): ChallengeResult {
  const body = functionBody(source, mission)
  if (!body) {
    return {
      passed: false,
      message: `Could not find the supported function \`${mission.functionName}(${mission.parameters})\`.`,
      diagnostic: `Check the function name, parameter order, colon, and indentation. The safe checker accepts only the small Python subset used by this mission.`,
      tests: mission.tests.map((test) => ({ ...test, actual: null, passed: false })),
    }
  }

  const tests = mission.tests.map((test): TestResult => {
    let actual: ChallengeValue | null
    switch (mission.kind) {
      case 'expression': actual = returnedExpression(body, test.input); break
      case 'conditional': actual = evaluateConditional(body, test.input); break
      case 'loop-sum': actual = evaluateLoopSum(body, test.input); break
      case 'dict-get': actual = evaluateDictionaryGet(body, test.input); break
      case 'max-value': actual = evaluateMaximum(body, test.input); break
      case 'filtered-count': actual = evaluateFilteredCount(body, test.input); break
    }
    return { ...test, actual, passed: actual !== null && actual === test.expected }
  })
  const passed = tests.every((test) => test.passed)
  const failed = tests.find((test) => !test.passed)

  return {
    passed,
    message: passed
      ? 'All challenge tests passed. You found the safe solution!'
      : 'The boss found a bug. Use the test output to spot the edge case, then try again.',
    diagnostic: passed
      ? 'Verified locally against every predefined test. Your source was parsed with a restricted grammar; it was not executed.'
      : failed
        ? `For input ${JSON.stringify(failed.input)}, expected ${formatValue(failed.expected)} but got ${formatValue(failed.actual)}.`
        : 'The function did not match the challenge rules.',
    tests,
  }
}

export function explainMission(mission: Mission): { concept: string; explanation: string } {
  return { concept: mission.concept, explanation: mission.explanation }
}
