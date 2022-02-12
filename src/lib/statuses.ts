import { MAX_WORD_LENGTH } from '../constants/settings'

export type CharStatus = 'absent' | 'present' | 'correct'

export type CharValue =
  | 'Q'
  | 'W'
  | 'E'
  | 'R'
  | 'T'
  | 'Y'
  | 'U'
  | 'I'
  | 'O'
  | 'P'
  | 'A'
  | 'S'
  | 'D'
  | 'F'
  | 'G'
  | 'H'
  | 'J'
  | 'K'
  | 'L'
  | 'Z'
  | 'X'
  | 'C'
  | 'V'
  | 'B'
  | 'N'
  | 'M'

export type CurrentWordClues = {
  knownLetter: CharValue[]
  invalidLettersPerTile: Set<CharValue>[]
  mustIncludeLetterCount: Map<CharValue, number>
}

export const getStatuses = (
  solution: string,
  guesses: string[]
): { [key: string]: CharStatus } => {
  const charObj: { [key: string]: CharStatus } = {}

  guesses.forEach((word) => {
    word.split('').forEach((letter, i) => {
      if (!solution.includes(letter)) {
        // make status absent
        return (charObj[letter] = 'absent')
      }

      if (letter === solution[i]) {
        //make status correct
        return (charObj[letter] = 'correct')
      }

      if (charObj[letter] !== 'correct') {
        //make status present
        return (charObj[letter] = 'present')
      }
    })
  })

  return charObj
}

export const guessUsesAllClues = (
  clues: CurrentWordClues,
  guess: string
): boolean => {
  let mustIncludeLetterCount = new Map<CharValue, number>(
    clues.mustIncludeLetterCount
  )
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    const guessChar = guess.charAt(i) as CharValue

    // Green letter
    if (clues.knownLetter[i]) {
      if (clues.knownLetter[i] !== guessChar) {
        return false
      }

      console.assert(mustIncludeLetterCount.has(guessChar), 'Illegal guess')
      mustIncludeLetterCount.set(
        guessChar,
        (mustIncludeLetterCount.get(guessChar) as number) - 1
      )
      continue
    }

    // Gray or orange letter means this spot is illegal
    if (clues.invalidLettersPerTile[i].has(guessChar)) {
      return false
    }

    // Ensure double letters are correctly guessed
    if (mustIncludeLetterCount.has(guessChar)) {
      mustIncludeLetterCount.set(
        guessChar,
        (mustIncludeLetterCount.get(guessChar) as number) - 1
      )
    }
  }

  for (const value of mustIncludeLetterCount.values()) {
    if (value > 0) return false
  }
  return true
}

export const getCurrentWordClues = (
  solution: string,
  guesses: string[]
): CurrentWordClues => {
  const clues: CurrentWordClues = {
    knownLetter: Array.from(Array(MAX_WORD_LENGTH)),
    invalidLettersPerTile: Array.from(Array(MAX_WORD_LENGTH)),
    mustIncludeLetterCount: new Map<CharValue, number>(),
  }
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    clues.invalidLettersPerTile[i] = new Set<CharValue>()
  }

  //
  guesses.forEach((guess) => {
    const guessStatus: CharStatus[] = getGuessStatuses(solution, guess)
    const mustIncludeLetterCount = new Map<CharValue, number>()

    guessStatus.forEach((letterStatus, i) => {
      const guessChar = guess.charAt(i) as CharValue
      switch (letterStatus) {
        case 'correct':
          clues.knownLetter[i] = guessChar
          if (mustIncludeLetterCount.has(guessChar)) {
            mustIncludeLetterCount.set(
              guessChar,
              (mustIncludeLetterCount.get(guessChar) as number) + 1
            )
          } else {
            mustIncludeLetterCount.set(guessChar, 1)
          }
          break
        case 'present':
          clues.invalidLettersPerTile[i].add(guessChar)
          if (mustIncludeLetterCount.has(guessChar)) {
            mustIncludeLetterCount.set(
              guessChar,
              (mustIncludeLetterCount.get(guessChar) as number) + 1
            )
          } else {
            mustIncludeLetterCount.set(guessChar, 1)
          }
          break
        case 'absent':
          for (const invalidLetters of clues.invalidLettersPerTile) {
            invalidLetters.add(guessChar)
          }
          break
      }
    })

    // Ensure that clues contain all information from previous guesses even if the user ignores them.
    for (const [char, mustIncludeCount] of mustIncludeLetterCount) {
      if (clues.mustIncludeLetterCount.has(char)) {
        // This information may be made redundant by the previous clues
        const previousCount = clues.mustIncludeLetterCount.get(char) as number
        clues.mustIncludeLetterCount.set(
          char,
          Math.max(mustIncludeCount, previousCount)
        )
      } else {
        // The clue contains new information
        clues.mustIncludeLetterCount.set(char, mustIncludeCount)
      }
    }
  })

  return clues
}

export const getGuessStatuses = (
  solution: string,
  guess: string
): CharStatus[] => {
  const splitSolution = solution.split('')
  const splitGuess = guess.split('')

  const solutionCharsTaken = splitSolution.map((_) => false)

  const statuses: CharStatus[] = Array.from(Array(guess.length))

  // handle all correct cases first
  splitGuess.forEach((letter, i) => {
    if (letter === splitSolution[i]) {
      statuses[i] = 'correct'
      solutionCharsTaken[i] = true
      return
    }
  })

  splitGuess.forEach((letter, i) => {
    if (statuses[i]) return

    if (!splitSolution.includes(letter)) {
      // handles the absent case
      statuses[i] = 'absent'
      return
    }

    // now we are left with "present"s
    const indexOfPresentChar = splitSolution.findIndex(
      (x, index) => x === letter && !solutionCharsTaken[index]
    )

    if (indexOfPresentChar > -1) {
      statuses[i] = 'present'
      solutionCharsTaken[indexOfPresentChar] = true
      return
    } else {
      statuses[i] = 'absent'
      return
    }
  })

  return statuses
}
