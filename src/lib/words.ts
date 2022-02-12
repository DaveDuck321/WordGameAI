import { WORDS } from '../constants/wordlist'
import { VALIDGUESSES } from '../constants/validGuesses'
import { guessUsesAllClues, getCurrentWordClues } from './statuses'

let remainingWords: Set<string> = new Set(
  WORDS.map((word) => word.toUpperCase())
)

export const isWordInWordList = (word: string) => {
  return (
    WORDS.includes(word.toLowerCase()) ||
    VALIDGUESSES.includes(word.toLowerCase())
  )
}

const getAnyItemFromSet = (set: Set<string>) => {
  for (const item of set) {
    return item
  }
  return undefined
}

const getWordsThatMatchTheGivenSolutionClues = (
  solution: string,
  guesses: string[]
) => {
  const matchingWords = new Set<string>()
  const currentClues = getCurrentWordClues(solution, guesses)

  for (const guess of remainingWords) {
    if (guessUsesAllClues(currentClues, guess)) {
      matchingWords.add(guess)
    }
  }

  // Remove identical matching words
  for (const word of matchingWords) {
    remainingWords.delete(word)
  }
  return matchingWords
}

export const updateWordListFromGuess = (
  guessList: string[],
  nextGuess: string
) => {
  const guesses = [...guessList, nextGuess]

  const worstCaseSolution = {
    wordSet: new Set<string>(),
  }

  while (remainingWords.size > 0) {
    const potentialSolution = getAnyItemFromSet(remainingWords)

    const matchingWords = getWordsThatMatchTheGivenSolutionClues(
      potentialSolution,
      guesses
    )
    if (matchingWords.size >= worstCaseSolution.wordSet.size) {
      worstCaseSolution.wordSet = matchingWords
    }
  }

  remainingWords = worstCaseSolution.wordSet
  console.log(remainingWords)

  if (remainingWords.length === 0) {
    // User managed to win?
    solution = nextGuess
    return
  }

  solution = getCurrentActiveWord()
}

export const isWinningWord = (word: string) => {
  return solution === word
}

const getCurrentActiveWord = () => {
  return getAnyItemFromSet(remainingWords)
}

export let solution = getCurrentActiveWord()

const getDateInformation = () => {
  // January 1, 2022 Game Epoch
  const epochMs = new Date('January 1, 2022 00:00:00').valueOf()
  const now = Date.now()
  const msInDay = 86400000
  const index = Math.floor((now - epochMs) / msInDay)
  const nextday = (index + 1) * msInDay + epochMs

  return {
    solutionIndex: index,
    tomorrow: nextday,
  }
}

export const { solutionIndex, tomorrow } = getDateInformation()
