import { WORDS } from '../constants/wordlist'
import { VALIDGUESSES } from '../constants/validGuesses'
import { guessUsesAllClues, getCurrentWordClues } from './statuses'

let remainingWords: string[] = WORDS.map((word) => word.toUpperCase())

export const isWordInWordList = (word: string) => {
  return (
    WORDS.includes(word.toLowerCase()) ||
    VALIDGUESSES.includes(word.toLowerCase())
  )
}

const getLengthOfWordListGivenSolution = (
  solution: string,
  guesses: string[]
) => {
  const currentClues = getCurrentWordClues(solution, guesses)
  let lengthOfWordList = 0
  for (const guess of remainingWords) {
    if (guessUsesAllClues(currentClues, guess)) {
      lengthOfWordList++
    }
  }
  return lengthOfWordList
}

export const updateWordListFromGuess = (
  guessList: string[],
  nextGuess: string
) => {
  const guesses = [...guessList, nextGuess]

  const worstCaseSolution = {
    wordListLength: 0,
    solutionWord: solution,
  }

  for (let potentialSolution of remainingWords) {
    if (nextGuess == potentialSolution) {
      continue // Avoid automatically giving the word to the user
    }

    const length = getLengthOfWordListGivenSolution(potentialSolution, guesses)
    if (length > worstCaseSolution.wordListLength) {
      worstCaseSolution.wordListLength = length
      worstCaseSolution.solutionWord = potentialSolution
    }
  }

  const newClues = getCurrentWordClues(worstCaseSolution.solutionWord, guesses)

  remainingWords = remainingWords.filter((word) => {
    return nextGuess !== word && guessUsesAllClues(newClues, word)
  })
  console.log(remainingWords)

  if (remainingWords.length === 0) {
    // User managed to win?
    solution = nextGuess
    return
  }

  solution = worstCaseSolution.solutionWord
}

export const isWinningWord = (word: string) => {
  return solution === word
}

const getCurrentActiveWord = () => {
  console.log(remainingWords[0])
  return remainingWords[0]
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
