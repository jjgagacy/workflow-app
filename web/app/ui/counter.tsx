'use client';

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p className='px-6'>{count} likes</p>
      <button className="flex items-center justify-center px-6 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}