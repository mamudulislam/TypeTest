import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sentences = [
    "Typing quickly and accurately is a valuable skill that improves with regular practice and dedication.",
    "Consistent effort helps you increase your speed while maintaining high levels of precision and confidence.",
    "Each sentence you type brings you closer to mastering this essential and practical ability.",
    "Focus on typing each word correctly before moving on, and avoid rushing to prevent mistakes.",
    "With time, patience, and consistent training, you'll become faster and more accurate every day."
]

const getRandomSentence = () =>
    sentences[Math.floor(Math.random() * sentences.length)]

export default function TypingTest() {
    const [targetText, setTargetText] = useState(getRandomSentence())
    const [input, setInput] = useState('')
    const [endTime, setEndTime] = useState(null)
    const [wpm, setWpm] = useState(null)
    const [isFinished, setIsFinished] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [correctChars, setCorrectChars] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60)
    const inputRef = useRef()
    const startTimeRef = useRef(null)
    const timerRef = useRef(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        if (timeLeft === 0 && !isFinished) {
            finishTest()
        }
    }, [timeLeft])

    const calculateWpm = (charCount, elapsedTimeMs) => {
        const wordsTyped = charCount / 5
        const timeInMinutes = elapsedTimeMs / 60000
        return Math.round(wordsTyped / timeInMinutes)
    }

    const handleInputChange = (e) => {
        const value = e.target.value

        if (!startTimeRef.current && value.length > 0) {
            startTimeRef.current = Date.now()
            startCountdown()
        }

        let correctCount = 0
        for (let i = 0; i < value.length; i++) {
            if (value[i] === targetText[i]) {
                correctCount++
            }
        }

        setCorrectChars(correctCount)
        setInput(value)

        if (startTimeRef.current && value.length > 0) {
            const elapsed = Date.now() - startTimeRef.current
            setWpm(calculateWpm(correctCount, elapsed))
        }

        if (value === targetText) {
            finishTest()
        }
    }

    const startCountdown = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                }
                return prev - 1
            })
        }, 1000)
    }

    const finishTest = () => {
        const now = Date.now()
        setEndTime(now)
        setIsFinished(true)
        setShowResult(true)
        clearInterval(timerRef.current)

        if (startTimeRef.current) {
            const elapsed = now - startTimeRef.current
            setWpm(calculateWpm(correctChars, elapsed))
        }
    }

    const resetTest = () => {
        const newSentence = getRandomSentence()
        setTargetText(newSentence)
        setInput('')
        setEndTime(null)
        setWpm(null)
        setIsFinished(false)
        setShowResult(false)
        setCorrectChars(0)
        setTimeLeft(60)
        startTimeRef.current = null
        clearInterval(timerRef.current)
        inputRef.current?.focus()
    }

    const accuracy = input.length > 0
        ? Math.round((correctChars / input.length) * 100)
        : 0

    const progress = Math.min(100, (input.length / targetText.length) * 100)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8 rounded-3xl shadow-xl space-y-6 sm:space-y-8 border border-gray-100"
        >
            <div className="text-center space-y-2">
                <motion.h1
                    className="text-2xl sm:text-3xl font-bold text-gray-800"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                >
                    Typing Speed Test
                </motion.h1>
                <p className="text-sm sm:text-base text-gray-500">You have 60 seconds to type the sentence below.</p>
            </div>

            <div className="text-center text-base sm:text-lg font-semibold text-red-600">
                Time Left: {timeLeft}s
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <motion.div
                className="text-base sm:text-lg md:text-xl text-gray-800 flex flex-wrap gap-1 leading-relaxed p-3 sm:p-4 bg-white rounded-xl shadow-inner border border-gray-200"
                layout
            >
                {targetText.split('').map((char, i) => {
                    const typedChar = input[i]
                    const isCorrect = typedChar === char
                    const isCurrent = i === input.length

                    return (
                        <span
                            key={i}
                            className={`
                                ${typedChar != null
                                    ? isCorrect
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                    : ''}
                                ${isCurrent ? 'bg-blue-100 border-b-2 border-blue-500' : ''}
                            `}
                        >
                            {char}
                        </span>
                    )
                })}
            </motion.div>

            <motion.div layout className="space-y-4">
                <textarea
                    ref={inputRef}
                    className="w-full p-3 sm:p-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-base sm:text-lg"
                    rows={3}
                    placeholder="Start typing here..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={isFinished}
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                    <AnimatePresence>
                        {showResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 w-full sm:w-auto"
                            >
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-500">Speed</p>
                                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{wpm} <span className="text-sm sm:text-lg">WPM</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-500">Accuracy</p>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">{accuracy}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-500">Time</p>
                                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                                        {endTime && startTimeRef.current ? ((endTime - startTimeRef.current) / 1000).toFixed(1) : '0.0'}s
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-md transition-colors"
                        onClick={resetTest}
                    >
                        {isFinished ? 'Try Again' : 'Reset'}
                    </motion.button>
                </div>
            </motion.div>

            {!startTimeRef.current && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4"
                >
                    <p>Start typing when you're ready. You have only 60 seconds!</p>
                </motion.div>
            )}
        </motion.div>
    )
}