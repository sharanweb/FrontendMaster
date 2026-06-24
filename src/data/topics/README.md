# Topic JSON Files — How to Add Questions

Each file contains all questions for one JavaScript topic. To add new questions, just append to the `questions` array in the relevant file.

## Files

| File | Topic | Count |
|------|-------|-------|
| `closures.json` | Closure theory — beginner to expert | 21 |
| `closures-quiz.json` | Closure output quizzes (multiple choice) | 18 |
| `event-loop.json` | Event loop, macrotasks, microtasks, Node.js | 8 |
| `promises-async.json` | Promises, async/await, Promise combinators | 8 |
| `this-keyword.json` | this binding rules, arrow functions | 6 |
| `call-apply-bind.json` | call(), apply(), bind(), polyfills | 6 |
| `hoisting.json` | Hoisting, TDZ, declaration types | 5 |
| `scope-execution.json` | Execution context, scope chain, lexical vs dynamic | 5 |
| `types-coercion.json` | JS types, == vs ===, coercion rules | 5 |
| `functions.json` | Function types, HOFs, map/filter/reduce | 5 |
| `error-handling.json` | Sync vs async errors, Promise errors | 4 |
| `generators-iterators.json` | Generators, iterators, iterator protocol | 3 |
| `weakmap-weakset.json` | WeakMap/WeakSet, GC semantics, use cases | 4 |
| `symbols.json` | Symbols, well-known symbols, Symbol.iterator | 4 |
| `var-let-const.json` | var/let/const differences, TDZ, scope | 6 (theory + quiz) |
| `iife-module-pattern.json` | IIFE, module pattern, revealing module | 6 (theory + quiz) |
| `memory-leaks.json` | Memory leak causes, GC algorithms | 5 (theory + quiz) |
| `debounce-throttle.json` | Debounce/throttle theory + implementation + quiz | 5 |
| `currying.json` | Currying, partial application, auto-curry | 6 (theory + quiz) |
| `stale-closures.json` | Stale closures in React, useRef fix | 5 (theory + quiz) |
| `prototype-inheritance.json` | Prototype chain, class vs prototype | 10 (theory + quiz) |

## Question Schema

### Theory / Output / Implementation questions
```json
{
  "id": "topic-001",
  "type": "theory",        // "theory" | "output" | "implementation"
  "level": 1,             // 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert
  "question": "...",
  "answer": "HTML string...",
  "code": "code string...",
  "tip": "Interview tip...",
  "followUps": ["..."],
  "companies": ["Google", "Meta"]
}
```

### Quiz questions (multiple choice)
```json
{
  "id": "topic-quiz-001",
  "type": "quiz",
  "difficulty": "easy",   // "easy" | "medium" | "hard" | "tricky"
  "title": "Short description",
  "code": "code to evaluate...",
  "options": ["A", "B", "C", "D"],
  "answer": 0,            // index into options[]
  "explanation": "HTML explanation...",
  "concept": "Core concept tested"
}
```

## Adding a New Topic

1. Create `src/data/topics/your-topic.json` following the schema above
2. Add the topic to `TOPICS` array in `src/data/questions.js`
3. Import and merge the questions into the QUESTIONS/QUIZ_QUESTIONS arrays
