'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheck, FiX } from 'react-icons/fi'

export default function PracticeChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [solution, setSolution] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  // Mock challenge data - in production, fetch from database
  const challenge = {
    id: id,
    title: 'JavaScript Basics',
    type: 'coding',
    description: 'Write a function that returns the sum of two numbers',
    problem: `Write a function called 'add' that takes two parameters (a and b) and returns their sum.

Example:
add(2, 3) should return 5
add(-1, 1) should return 0`,
    testCases: [
      { input: [2, 3], expected: 5 },
      { input: [-1, 1], expected: 0 },
      { input: [10, 20], expected: 30 },
    ],
  }

  const handleSubmit = async () => {
    // In production, this would evaluate the code
    // For now, we'll do a simple check
    try {
      // Basic validation
      if (solution.includes('function') && solution.includes('return')) {
        setScore(100)
      } else {
        setScore(50)
      }
      setSubmitted(true)

      // Save submission
      await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          challengeType: challenge.type,
          solution,
        }),
      })
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-primary-600 hover:text-primary-700 mb-6"
      >
        ← Back to Challenges
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{challenge.title}</h1>
        <p className="text-gray-600 mb-6">{challenge.description}</p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Problem</h2>
          <pre className="whitespace-pre-wrap text-gray-700">{challenge.problem}</pre>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Test Cases</h2>
          <div className="space-y-2">
            {challenge.testCases.map((testCase, index) => (
              <div key={index} className="bg-gray-50 rounded p-3">
                <code className="text-sm">
                  Input: {JSON.stringify(testCase.input)} → Expected: {testCase.expected}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-4">Your Solution</h2>
        <textarea
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Write your solution here..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />

        {submitted && score !== null && (
          <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
            score >= 80 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
          }`}>
            {score >= 80 ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiX className="w-5 h-5" />
            )}
            <span>Score: {score}/100</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!solution || submitted}
          className="mt-4 w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitted ? 'Submitted' : 'Submit Solution'}
        </button>
      </div>
    </div>
  )
}
