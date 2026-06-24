export const TOPICS = [
  { id: 'closures', label: 'Closures', icon: '🔒' },
  { id: 'event-loop', label: 'Event Loop', icon: '🔄' },
  { id: 'promises', label: 'Promises & Async', icon: '⚡' },
  { id: 'this', label: 'this Keyword', icon: '🎯' },
  { id: 'call-apply-bind', label: 'Call / Apply / Bind', icon: '🔗' },
  { id: 'hoisting', label: 'Hoisting & TDZ', icon: '🏗️' },
  { id: 'scope', label: 'Scope & Execution Context', icon: '🌐' },
  { id: 'types-coercion', label: 'Types & Coercion', icon: '🔀' },
  { id: 'functions', label: 'Functions & HOF', icon: '⚙️' },
  { id: 'error-handling', label: 'Error Handling', icon: '🛡️' },
  { id: 'generators', label: 'Generators & Iterators', icon: '🔁' },
  { id: 'weakmap-weakset', label: 'WeakMap & WeakSet', icon: '🗑️' },
  { id: 'symbols', label: 'Symbols', icon: '💎' },
  { id: 'var-let-const', label: 'var / let / const', icon: '📦' },
  { id: 'prototypes', label: 'Prototypes & Inheritance', icon: '🧬' },
  { id: 'arrays', label: 'Array Methods', icon: '📋' },
  { id: 'es6', label: 'ES6+ Features', icon: '✨' },
  { id: 'performance', label: 'Performance & Memory', icon: '🚀' },
]

// level: 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert
// type: 'theory' | 'output' | 'implementation' | 'quiz'

export const QUESTIONS = [

// ─── CLOSURES ───────────────────────────────────────────────────────────────

{
  id: 'cl-001', topic: 'closures', level: 1, type: 'theory',
  companies: ['Google', 'Meta', 'Amazon'],
  question: 'What is a closure in JavaScript? Define it in your own words.',
  answer: `A <strong>closure</strong> is a function bundled together with references to its surrounding <strong>lexical environment</strong>. It remembers the variables from the scope where it was <em>created</em>, even after that outer scope has exited the call stack.<br><br>
When an inner function is returned or passed elsewhere, it carries a live reference to every variable in its enclosing scopes — this is the closure. Those variables are moved from the call stack to the <strong>heap</strong> so they persist as long as the closure is reachable by the garbage collector.`,
  code: `function outer() {
  let count = 0;         // "closed over" — lives on heap, not stack

  function inner() {
    count++;
    console.log(count);
  }

  return inner;          // outer finishes, but count survives
}

const counter = outer();
counter(); // 1
counter(); // 2  ← count persists across calls!`,
  tip: 'Key interview points: mention <em>lexical environment</em>, <em>scope chain</em>, and that closed-over variables are moved to the heap (not garbage collected while the closure is alive).',
  followUps: ['How does the JS engine decide NOT to GC a closed-over variable?', 'Is every function in JS a closure?']
},

{
  id: 'cl-002', topic: 'closures', level: 1, type: 'theory',
  companies: ['Flipkart', 'Atlassian'],
  question: 'What is lexical scoping and how does it relate to closures?',
  answer: `<strong>Lexical scoping</strong> means a variable's scope is determined by where it is <em>written</em> in the source code (at author time), not by where it is called at runtime.<br><br>
Closures are <em>built on top of</em> lexical scoping: a function always has access to variables in the scope where it was <strong>defined</strong>, regardless of where it is eventually called. The scope chain is fixed at definition time.`,
  code: `let x = 'global';

function outer() {
  let x = 'outer';

  function inner() {
    console.log(x); // 'outer' — uses DEFINITION site, not CALL site
  }

  return inner;
}

const fn = outer();
fn(); // 'outer'  ← NOT 'global', even though called from global scope`,
  tip: 'Lexical = "at the place of writing". Contrast with dynamic scope (used by Bash) where variable lookup follows the call stack.',
  followUps: ['What is the [[Environment]] internal slot?', 'How does eval affect lexical scope?']
},

{
  id: 'cl-003', topic: 'closures', level: 1, type: 'theory',
  companies: ['Amazon', 'Wipro'],
  question: 'Give a real-world use case for closures.',
  answer: `The most common use cases are:<br><br>
<strong>1. Counter factory</strong> — private state that persists across calls<br>
<strong>2. Memoization</strong> — cache keyed by input, private to the function<br>
<strong>3. Module pattern</strong> — hide internals, expose a public API<br>
<strong>4. Partial application / currying</strong> — pre-fill arguments<br>
<strong>5. Event handlers</strong> — capture loop index or config at registration time`,
  code: `// Counter factory — each instance has independent private state
function makeCounter(start = 0) {
  let count = start;

  return {
    increment: () => ++count,
    decrement: () => --count,
    reset:     () => { count = start; },
    value:     () => count,
  };
}

const c1 = makeCounter(10);
const c2 = makeCounter(0);

c1.increment(); // 11
c1.increment(); // 12
c2.increment(); // 1   ← completely independent`
},

{
  id: 'cl-004', topic: 'closures', level: 2, type: 'output',
  companies: ['Google', 'Meta', 'Amazon'],
  question: "Classic var-in-loop bug: What does this print and why? How do you fix it?",
  answer: `<strong>Output: 3, 3, 3</strong><br><br>
<code>var</code> is function-scoped, so all three closures share the <em>same</em> <code>i</code>. By the time any setTimeout fires (100ms later), the loop has completed and <code>i === 3</code>.<br><br>
<strong>Fix 1:</strong> Use <code>let</code> — creates a new binding per iteration (block-scoped).<br>
<strong>Fix 2:</strong> IIFE that captures <code>i</code> by value.<br>
<strong>Fix 3:</strong> Pass <code>i</code> as a third argument to setTimeout.`,
  code: `// THE BUG — prints 3, 3, 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// FIX 1: let (each iteration gets its own i)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2 ✓
}

// FIX 2: IIFE captures i by value
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i); // 0, 1, 2 ✓
}

// FIX 3: setTimeout third argument
for (var i = 0; i < 3; i++) {
  setTimeout(console.log, 100, i); // 0, 1, 2 ✓
}`,
  tip: 'Always ask: "Is this var or let?" — the answer changes completely. This is the #1 closure question at MAANG.',
  followUps: ['How does let create a new binding per iteration?', 'What if you use const instead of let in the for loop?']
},

{
  id: 'cl-005', topic: 'closures', level: 2, type: 'theory',
  companies: ['Meta', 'Netflix'],
  question: 'What is an IIFE and how does it relate to closures?',
  answer: `An <strong>IIFE</strong> (Immediately Invoked Function Expression) is a function defined and called at the same time. Before ES6's <code>let</code>/<code>const</code>, IIFEs were the only way to create a new scope for variables, using closure to create private state that doesn't pollute the global scope.`,
  code: `// Syntax (two equivalent forms):
(function() { /* ... */ })();
(() => { /* ... */ })();

// Module pattern using IIFE + closure:
const myModule = (function() {
  let _secret = 0;        // truly private

  return {
    getSecret: () => _secret,
    setSecret: (val) => { _secret = val; }
  };
})();

myModule.setSecret(99);
myModule.getSecret(); // 99
myModule._secret;     // undefined — truly private!`,
  tip: 'Modern ES modules have largely replaced IIFEs for code organisation, but IIFEs are still used to avoid polluting global scope in scripts and for immediately run setup code.'
},

{
  id: 'cl-006', topic: 'closures', level: 2, type: 'theory',
  companies: ['Google', 'Meta'],
  question: 'How do closures simulate private variables in JavaScript?',
  answer: `JavaScript does not have private class fields in classical patterns (ES2022 added <code>#field</code>, but it requires classes). Closures allow truly private state: variables declared inside a function are unreachable from outside — they can only be accessed/modified through the methods the function exposes.`,
  code: `function BankAccount(initialBalance) {
  let balance = initialBalance;    // PRIVATE — no direct external access

  return {
    deposit(amount) {
      if (amount > 0) balance += amount;
    },
    withdraw(amount) {
      if (amount > 0 && amount <= balance) balance -= amount;
      else throw new Error('Insufficient funds');
    },
    getBalance() { return balance; }
  };
}

const acc = BankAccount(1000);
acc.deposit(500);       // balance = 1500
acc.withdraw(200);      // balance = 1300
acc.getBalance();       // 1300
acc.balance;            // undefined — truly private!`,
  tip: 'Compare with ES2022 private class fields (<code>#balance</code>). Closure-based privacy works in all environments; class fields require transpilation for older targets.'
},

{
  id: 'cl-007', topic: 'closures', level: 3, type: 'implementation',
  companies: ['Meta', 'Google', 'Netflix'],
  question: 'How does memoization use closures? Implement a memoize function.',
  answer: `Memoization caches the results of expensive function calls. The closure captures the <code>cache</code> Map — it persists between calls but is entirely private to the memoized function. JSON.stringify is used as a composite key for multi-argument functions.`,
  code: `function memoize(fn) {
  const cache = new Map();    // closed over — private, persistent

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('Cache hit!');
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

fib(40);  // Computed once
fib(40);  // Cache hit! — instant`,
  tip: 'JSON.stringify as a key fails for functions, Symbols, and circular objects. Production memoize libraries use WeakMap or custom serialisers for complex cases.'
},

{
  id: 'cl-008', topic: 'closures', level: 3, type: 'implementation',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'Implement debounce using closures. Explain each closed-over variable.',
  answer: `Debounce delays a function call until after a quiet period. The closure captures <code>timer</code> (pending setTimeout ID) and the outer <code>fn</code> and <code>delay</code> — all persist between calls while staying private.`,
  code: `function debounce(fn, delay) {
  let timer = null;   // ← closed over: tracks pending call

  return function(...args) {
    clearTimeout(timer);         // cancel previous scheduled call

    timer = setTimeout(() => {
      fn.apply(this, args);      // correct context + latest args
      timer = null;
    }, delay);
  };
}

// Usage — only fires after 300ms of silence
const onSearch = debounce((query) => {
  fetch('/api/search?q=' + query);
}, 300);

// User types fast — only last call fires:
onSearch('j');    // cancelled
onSearch('ja');   // cancelled
onSearch('jav');  // cancelled
onSearch('java'); // fires after 300ms ✓

// Closed-over variables:
// timer — setTimeout ID shared across all calls
// fn    — original function (from outer parameter)
// delay — wait time (from outer parameter)`,
  tip: 'Debounce fires AFTER quiet. Throttle fires at most ONCE per interval. Both are closure implementations — the key difference is the timing strategy.',
  followUps: ['How would you add a leading-edge option?', 'What is the difference between debounce and throttle?']
},

{
  id: 'cl-009', topic: 'closures', level: 3, type: 'implementation',
  companies: ['Meta', 'Netflix', 'Stripe'],
  question: 'Implement throttle using closures.',
  answer: `Throttle ensures a function fires at most once every N milliseconds. The closure captures <code>lastCall</code> — the timestamp of the last successful invocation.`,
  code: `function throttle(fn, limit) {
  let lastCall = 0;       // closed over: timestamp of last invocation

  return function(...args) {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      return fn.apply(this, args);
    }
    // else: silently drop this call
  };
}

// Usage — fires at most once per 100ms
window.addEventListener('scroll', throttle(() => {
  console.log('scroll:', window.scrollY);
}, 100));`,
},

{
  id: 'cl-010', topic: 'closures', level: 3, type: 'implementation',
  companies: ['Google', 'Meta'],
  question: "Implement a 'once' function — a function that can only be called once.",
  answer: `The closure captures two variables: <code>called</code> (a flag) and <code>result</code> (the cached first return value). All subsequent calls silently return the cached result.`,
  code: `function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result; // always returns first call's result
  };
}

const initDB = once(function() {
  console.log('DB initialised!');
  return { connected: true };
});

initDB(); // "DB initialised!" → { connected: true }
initDB(); // (silent)           → { connected: true }
initDB(); // (silent)           → { connected: true }`,
},

{
  id: 'cl-011', topic: 'closures', level: 3, type: 'theory',
  companies: ['Meta', 'Netflix'],
  question: 'Can closures cause memory leaks? How would you prevent them?',
  answer: `Yes. Closures hold <strong>live references</strong> to outer scope variables. If a closure is attached to a long-lived object (e.g., a DOM event listener) and is never removed, it prevents the garbage collector from freeing those variables — even if you never actually use them in the closure body.<br><br>
The classic trap: capturing a large array in a closure that's registered as an event listener and never cleaned up.`,
  code: `// MEMORY LEAK
function setup() {
  const bigData = new Array(1_000_000).fill('data'); // 8MB+

  document.getElementById('btn').addEventListener('click', () => {
    console.log('clicked'); // bigData is captured — never freed!
  });
}

// FIX 1: Extract only what you need, null the rest
function setup() {
  const bigData = new Array(1_000_000).fill('data');
  const label = bigData[0];   // only keep what the closure needs
  // bigData goes out of scope — eligible for GC

  document.getElementById('btn').addEventListener('click', () => {
    console.log(label);
  });
}

// FIX 2: Remove the listener when no longer needed
function setup() {
  const handler = () => console.log('click');
  btn.addEventListener('click', handler);
  return () => btn.removeEventListener('click', handler); // cleanup
}`,
  tip: 'Chrome DevTools Memory Profiler → Heap Snapshot is the best way to detect closure-related leaks. Look for detached DOM trees holding closures.'
},

{
  id: 'cl-012', topic: 'closures', level: 4, type: 'output',
  companies: ['Google', 'Meta', 'Netflix'],
  question: 'Explain how React hooks use closures internally. What is a stale closure?',
  answer: `React hooks rely heavily on closures. Each component render creates a new closure that captures the current state values. A <strong>stale closure</strong> occurs when a closure captures an old value of state and is never updated because the dependency array is wrong (usually empty []).`,
  code: `// STALE CLOSURE BUG
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // This closure captured count=0 at mount time.
      // Even as count updates, this closure still sees 0!
      console.log(count); // Always 0 — stale!
    }, 1000);
    return () => clearInterval(timer);
  }, []); // empty deps = closure frozen at initial render
}

// FIX 1: Functional update (no need to read stale count)
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1); // reads from React's internal state
  }, 1000);
  return () => clearInterval(timer);
}, []);

// FIX 2: useRef to hold latest value
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);`,
  tip: 'Stale closures are the #1 hooks pitfall at MAANG interviews. Always mention the dependency array and the functional update pattern as solutions.',
  followUps: ['What does useCallback do and how does it relate to closures?', 'Why does React need dependency arrays for hooks?']
},

{
  id: 'cl-013', topic: 'closures', level: 2, type: 'theory',
  companies: ['Flipkart', 'Uber'],
  question: 'What is partial application and how do closures enable it?',
  answer: `<strong>Partial application</strong> is pre-filling some arguments of a function and returning a new function waiting for the rest. Closures make this possible by capturing the pre-filled arguments in the enclosing scope.`,
  code: `function partial(fn, ...presetArgs) {
  return function(...laterArgs) {       // closes over presetArgs
    return fn(...presetArgs, ...laterArgs);
  };
}

const multiply = (a, b) => a * b;

const double = partial(multiply, 2);
const triple = partial(multiply, 3);

double(5); // 10
triple(5); // 15

// Currying — returns a chain of unary functions:
const curry = fn => a => b => fn(a, b);

const curriedMultiply = curry(multiply);
curriedMultiply(2)(5);        // 10
const double2 = curriedMultiply(2);
double2(7);                    // 14`,
},

// ─── EVENT LOOP ─────────────────────────────────────────────────────────────

{
  id: 'el-001', topic: 'event-loop', level: 1, type: 'theory',
  companies: ['Amazon', 'Flipkart', 'Walmart'],
  question: 'What is the JavaScript event loop? Walk through the exact order of execution.',
  answer: `JS is <strong>single-threaded</strong> — one call stack. The event loop continuously checks: if the call stack is empty, pull in the next task.<br><br>
<strong>Precise order per tick:</strong><br>
1. Run all synchronous code (call stack drains)<br>
2. Drain the entire <strong>microtask queue</strong> (Promises .then/.catch, queueMicrotask, MutationObserver)<br>
3. Run <strong>one</strong> macrotask (setTimeout, setInterval, I/O, UI events)<br>
4. Drain microtask queue again<br>
5. Render (browser only — paint + layout)<br>
6. Repeat`,
  code: `console.log('A');                         // sync
setTimeout(() => console.log('B'), 0);    // macrotask
Promise.resolve().then(() => console.log('C')); // microtask
console.log('D');                         // sync

// Output: A → D → C → B
// Sync runs. Then ALL microtasks. Then one macrotask.`,
  tip: 'The key insight: ALL microtasks drain before ANY next macrotask. This trips up most candidates.',
  followUps: ['Can microtasks starve the event loop?', 'Where does requestAnimationFrame fit?']
},

{
  id: 'el-002', topic: 'event-loop', level: 2, type: 'output',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'What is the output of this event loop puzzle?',
  code: `console.log('start');
setTimeout(() => console.log('timeout1'), 0);
Promise.resolve()
  .then(() => {
    console.log('p1');
    setTimeout(() => console.log('timeout2'), 0);
  })
  .then(() => console.log('p2'));
setTimeout(() => console.log('timeout3'), 0);
console.log('end');`,
  answer: `<strong>Output: start → end → p1 → p2 → timeout1 → timeout3 → timeout2</strong><br><br>
Sync: "start", "end".<br>
Microtask queue drains: p1 runs (queues timeout2 as macrotask), then p2 runs (chained .then).<br>
Macrotask 1: timeout1.<br>
Macrotask 2: timeout3.<br>
Macrotask 3: timeout2 — was queued <em>after</em> timeout1 and timeout3 were already in the queue.`,
  followUps: ['Why does timeout2 come after timeout3?', 'What if p1 threw an error?']
},

{
  id: 'el-003', topic: 'event-loop', level: 2, type: 'output',
  companies: ['Netflix', 'Atlassian'],
  question: 'What does this async/await code print and why?',
  code: `async function main() {
  console.log('1');
  await Promise.resolve();
  console.log('2');
}
console.log('3');
main();
console.log('4');`,
  answer: `<strong>Output: 3 → 1 → 4 → 2</strong><br><br>
Sync: '3' logs. main() called → '1' logs. <code>await</code> suspends main and schedules resume as a microtask. '4' logs (sync resumes).<br>
Microtask drains: main resumes → '2' logs.<br><br>
<code>await x</code> is essentially <code>Promise.resolve(x).then(resume)</code> — everything after await is a microtask callback.`,
  followUps: ['How many microtasks does a single await create?', 'What if you await a non-Promise?']
},

{
  id: 'el-004', topic: 'event-loop', level: 3, type: 'theory',
  companies: ['Google', 'Netflix'],
  question: 'How does the Node.js event loop differ from the browser? What are process.nextTick and setImmediate?',
  answer: `<strong>Browser</strong>: Sync → microtasks → one macrotask → microtasks → render → repeat.<br><br>
<strong>Node.js (libuv phases):</strong><br>
1. Timers (setTimeout/setInterval callbacks)<br>
2. Pending callbacks (I/O errors from last tick)<br>
3. Idle / prepare (internal)<br>
4. Poll (wait for new I/O events)<br>
5. Check (setImmediate callbacks)<br>
6. Close callbacks<br><br>
<strong>process.nextTick</strong>: Runs BEFORE the next event loop phase — even before Promise microtasks. Highest priority.<br>
<strong>setImmediate</strong>: Runs in the Check phase (after I/O). Like setTimeout(fn,0) but more predictable in I/O contexts.`,
  code: `setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));

// Node.js output: nextTick → promise → setImmediate`,
  tip: 'process.nextTick > Promise microtasks > setImmediate. This priority order is asked directly in Node.js interviews.',
},

{
  id: 'el-005', topic: 'event-loop', level: 3, type: 'output',
  companies: ['Uber', 'Stripe'],
  question: 'What is the output in Node.js?',
  code: `process.nextTick(() => console.log('nextTick 1'));
Promise.resolve().then(() => console.log('promise 1'));
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick 2'));
Promise.resolve().then(() => console.log('promise 2'));
console.log('sync');`,
  answer: `<strong>Output: sync → nextTick 1 → nextTick 2 → promise 1 → promise 2 → immediate</strong><br><br>
Sync code runs first. Then the nextTick queue drains completely (both nextTicks run before any Promise). Then Promise microtasks drain. Then the Check phase: setImmediate fires.`,
},

// ─── PROMISES & ASYNC ────────────────────────────────────────────────────────

{
  id: 'pr-001', topic: 'promises', level: 1, type: 'theory',
  companies: ['Amazon', 'TCS', 'Wipro'],
  question: "What are the three states of a Promise? What does 'settled' mean?",
  answer: `<strong>Pending</strong>: Initial state — neither fulfilled nor rejected.<br>
<strong>Fulfilled</strong>: Operation succeeded. Value accessible via .then().<br>
<strong>Rejected</strong>: Operation failed. Reason accessible via .catch().<br><br>
<strong>Settled</strong> = fulfilled OR rejected. Once settled, a Promise is <strong>immutable</strong> — calling resolve() or reject() a second time has no effect.<br><br>
A Promise is <strong>resolved</strong> when it is either settled itself OR "locked in" to follow another Promise (it can be resolved-but-still-pending if locked to a pending Promise).`,
  code: `const p = new Promise((resolve, reject) => {
  resolve(1);
  resolve(2); // silently ignored — already settled
  reject(3);  // silently ignored
});
p.then(v => console.log(v)); // 1`,
  tip: "The distinction between 'settled' and 'resolved' is subtle — a resolved Promise can still be pending (if it follows another pending Promise).",
},

{
  id: 'pr-002', topic: 'promises', level: 2, type: 'output',
  companies: ['Google', 'Stripe'],
  question: 'What is the output of this promise chain?',
  code: `Promise.resolve(1)
  .then(v => { console.log(v); return 2; })
  .then(v => { console.log(v); throw new Error('oops'); })
  .then(v => console.log('never:', v))
  .catch(e => { console.log('caught:', e.message); return 3; })
  .then(v => console.log('after catch:', v));`,
  answer: `<strong>Output: 1 → 2 → "caught: oops" → "after catch: 3"</strong><br><br>
.then(v=>2): logs 1, returns 2.<br>
.then(throw): logs 2, throws → skips next .then, caught by .catch.<br>
.catch returns 3 → new <em>fulfilled</em> Promise.<br>
.then(log): logs "after catch: 3".<br><br>
Key: .catch() that doesn't re-throw returns a <strong>resolved</strong> Promise — the chain continues normally after it.`,
},

{
  id: 'pr-003', topic: 'promises', level: 2, type: 'output',
  companies: ['Meta', 'Netflix', 'Airbnb'],
  question: 'What does this print? Explain Promise.all vs Promise.allSettled.',
  code: `const p1 = Promise.resolve('a');
const p2 = Promise.reject('err');
const p3 = Promise.resolve('c');

Promise.all([p1, p2, p3])
  .then(v => console.log('all:', v))
  .catch(e => console.log('fail:', e));

Promise.allSettled([p1, p2, p3])
  .then(results => results.forEach(r => console.log(r.status)));`,
  answer: `<strong>Output: "fail: err" → "fulfilled" → "rejected" → "fulfilled"</strong><br><br>
<strong>Promise.all</strong>: Fails fast — the first rejection (p2) causes immediate rejection with 'err'. p3 is ignored for the result.<br><br>
<strong>Promise.allSettled</strong>: Waits for ALL — logs each result's status regardless of success or failure. Always resolves.`,
  followUps: ['Does Promise.all cancel the other promises on failure?', 'What does Promise.any do differently?']
},

{
  id: 'pr-004', topic: 'promises', level: 3, type: 'output',
  companies: ['Google', 'Shopify'],
  question: 'What is the output? Nested async/await execution order.',
  code: `async function a() {
  console.log('a start');
  await b();
  console.log('a end');
}
async function b() {
  console.log('b start');
  await Promise.resolve();
  console.log('b end');
}
console.log('before');
a();
console.log('after');`,
  answer: `<strong>Output: before → a start → b start → after → b end → a end</strong><br><br>
Sync: 'before'. a() called → 'a start'. b() called sync → 'b start'. b hits await — suspends b, suspends a. Sync continues: 'after'.<br>
Microtask 1: b resumes → 'b end'. b's Promise resolves → schedules a's resume.<br>
Microtask 2: a resumes → 'a end'.<br><br>
Each await adds at least one microtask hop. Two nested awaits = two checkpoints.`,
},

{
  id: 'pr-005', topic: 'promises', level: 3, type: 'implementation',
  companies: ['Meta', 'Google', 'Netflix'],
  question: 'Implement Promise.all, Promise.race, and Promise.any from scratch.',
  answer: `These are direct implementations of the core Promise combinators.<br><br>
<strong>Promise.all</strong>: Collects results by index, resolves when all done, rejects on first failure.<br>
<strong>Promise.race</strong>: First settled Promise (either resolve or reject) wins.<br>
<strong>Promise.any</strong>: First <em>fulfilled</em> wins; rejects with AggregateError only if all fail.`,
  code: `// Promise.all
function myAll(promises) {
  return new Promise((resolve, reject) => {
    if (!promises.length) return resolve([]);
    const results = [];
    let count = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(val => {
        results[i] = val;
        if (++count === promises.length) resolve(results);
      }).catch(reject); // first rejection wins
    });
  });
}

// Promise.race
function myRace(promises) {
  return new Promise((resolve, reject) =>
    promises.forEach(p => Promise.resolve(p).then(resolve, reject))
  );
}

// Promise.any
function myAny(promises) {
  return new Promise((resolve, reject) => {
    if (!promises.length)
      return reject(new AggregateError([], 'All promises were rejected'));
    const errors = [];
    let rejCount = 0;
    promises.forEach((p, i) =>
      Promise.resolve(p)
        .then(resolve)
        .catch(e => {
          errors[i] = e;
          if (++rejCount === promises.length)
            reject(new AggregateError(errors, 'All promises were rejected'));
        })
    );
  });
}`,
  tip: 'The index-based result collection in myAll (results[i] instead of results.push) is critical — it preserves insertion order despite async completion order.',
},

{
  id: 'pr-006', topic: 'promises', level: 2, type: 'theory',
  companies: ['Amazon', 'Flipkart'],
  question: 'What is the difference between return and return await inside an async function?',
  answer: `<strong>return value</strong>: The async function's Promise resolves with the value. If value is a rejected Promise, it bypasses the function's own try/catch — the rejection propagates directly to the caller.<br><br>
<strong>return await value</strong>: Awaits the value first. If it rejects, the rejection IS caught by the surrounding try/catch before the function's Promise rejects.`,
  code: `// return (NO await) — rejection escapes the try/catch
async function returnNoAwait() {
  try {
    return Promise.reject('error'); // try/catch does NOT catch this
  } catch(e) {
    console.log('caught:', e); // never runs
  }
}

// return await — rejection IS caught
async function returnWithAwait() {
  try {
    return await Promise.reject('error'); // caught here ✓
  } catch(e) {
    console.log('caught:', e); // "caught: error"
  }
}`,
  tip: 'ESLint rule no-return-await is controversial — disable it if you actually need the try/catch behaviour.',
},

// ─── THIS KEYWORD ───────────────────────────────────────────────────────────

{
  id: 'th-001', topic: 'this', level: 1, type: 'theory',
  companies: ['Amazon', 'Infosys', 'HCL'],
  question: "Explain the four rules that determine 'this' in JavaScript and their precedence.",
  answer: `<strong>1. new binding</strong> (highest): Called with <code>new</code> → this = newly created object.<br>
<strong>2. Explicit binding</strong>: .call(ctx), .apply(ctx), .bind(ctx) → this = ctx.<br>
<strong>3. Implicit binding</strong>: Called as a method — obj.fn() → this = obj.<br>
<strong>4. Default binding</strong> (lowest): Standalone call → this = global (sloppy) or undefined (strict).<br><br>
<strong>Arrow functions</strong> are the exception — they have NO own this. They inherit this <em>lexically</em> from the enclosing scope at definition time. None of the four rules apply to them.`,
  code: `function fn() { console.log(this.x); }
const obj = { x: 42, fn };

fn();              // undefined (strict) / global.x (sloppy)
obj.fn();          // 42 — implicit binding
fn.call({ x: 99 }); // 99 — explicit binding
new fn();          // undefined — new creates {} with no x`,
  tip: 'Precedence: new > explicit > implicit > default. Memorise this order — it is tested directly at all levels.',
},

{
  id: 'th-002', topic: 'this', level: 2, type: 'output',
  companies: ['Google', 'Meta', 'Microsoft'],
  question: "What does this output? Trace each value of 'this'.",
  code: `const obj = {
  name: 'obj',
  regular: function() { return this.name; },
  arrow: () => this.name,
  nested: function() {
    const inner = () => this.name;
    return inner();
  }
};
console.log(obj.regular());
console.log(obj.arrow());
console.log(obj.nested());`,
  answer: `<strong>Output: "obj" → undefined (or '') → "obj"</strong><br><br>
<strong>regular()</strong>: called as method → this = obj → "obj".<br>
<strong>arrow()</strong>: defined at object-literal level (not inside a function), so this = outer scope (global/module) → undefined.<br>
<strong>nested()</strong>: regular function → this = obj. inner is an arrow that captures this from nested's scope = obj → "obj".<br><br>
The pattern "arrow inside a method" is useful and intentional — it inherits the method's this.`,
},

{
  id: 'th-003', topic: 'this', level: 2, type: 'output',
  companies: ['Flipkart', 'Uber'],
  question: "Classic 'this' loss inside setInterval. What prints?",
  code: `function Timer() {
  this.count = 0;
}
Timer.prototype.start = function() {
  setInterval(function() {
    this.count++;
    console.log(this.count);
  }, 100);
};

const t = new Timer();
t.start();`,
  answer: `<strong>Output: NaN (repeating)</strong><br><br>
setInterval's callback is called as a plain function (not a method). In sloppy mode this = global, which has no <code>count</code> → undefined++  = NaN. NaN++ = NaN forever.<br><br>
<strong>Fixes:</strong><br>
1. Arrow function: <code>setInterval(() => { this.count++; ... }, 100)</code> — inherits this from start().<br>
2. <code>const self = this; ... self.count++</code><br>
3. <code>.bind(this)</code> on the callback.`,
},

{
  id: 'th-004', topic: 'this', level: 3, type: 'output',
  companies: ['Google', 'Stripe'],
  question: "What is the output of this chained 'this' puzzle?",
  code: `function foo() {
  console.log(this.bar);
}
var bar = 'global';
const obj1 = { bar: 'obj1', foo };
const obj2 = { bar: 'obj2', foo };

obj1.foo();
obj2.foo();
const f = obj1.foo;
f();
obj1.foo.call(obj2);`,
  answer: `<strong>Output: "obj1" → "obj2" → "global" → "obj2"</strong><br><br>
obj1.foo(): implicit → this = obj1 → "obj1".<br>
obj2.foo(): implicit → this = obj2 → "obj2".<br>
f(): method extracted, called standalone → default → this = global → "global" (var leaks to global).<br>
.call(obj2): explicit overrides implicit → this = obj2 → "obj2".`,
  tip: 'var declarations leak to global — that is why f() sees "global". With let/const bar, f() would log undefined.',
},

// ─── CALL / APPLY / BIND ────────────────────────────────────────────────────

{
  id: 'cb-001', topic: 'call-apply-bind', level: 1, type: 'theory',
  companies: ['Amazon', 'Wipro', 'TCS'],
  question: 'What is the difference between call(), apply(), and bind()?',
  answer: `All three explicitly set <code>this</code>, but differ in invocation:<br><br>
<strong>call(ctx, arg1, arg2, ...)</strong>: Invokes immediately. Arguments passed individually.<br>
<strong>apply(ctx, [arg1, arg2])</strong>: Invokes immediately. Arguments as an array.<br>
<strong>bind(ctx, arg1, ...)</strong>: Returns a NEW function with this permanently bound. Does NOT invoke. Can also partially apply arguments.<br><br>
<strong>When to use each:</strong><br>
call — borrowing a method, known argument count.<br>
apply — arguments already in an array (mostly replaced by spread in modern JS).<br>
bind — event handlers, callbacks, anywhere the function needs a fixed this later.`,
  code: `function greet(greeting, punct) {
  return greeting + ', ' + this.name + punct;
}
const user = { name: 'Alice' };

greet.call(user, 'Hello', '!');       // "Hello, Alice!"
greet.apply(user, ['Hi', '?']);       // "Hi, Alice?"
const hi = greet.bind(user, 'Hey');
hi('.');                              // "Hey, Alice."`,
},

{
  id: 'cb-002', topic: 'call-apply-bind', level: 2, type: 'output',
  companies: ['Flipkart', 'Razorpay'],
  question: 'What prints? Classic bind vs call precedence.',
  code: `function sayHi() {
  console.log('Hi', this.name);
}
const alice = { name: 'Alice' };
const bob   = { name: 'Bob' };

const boundToAlice = sayHi.bind(alice);
boundToAlice();
boundToAlice.call(bob);
new boundToAlice();`,
  answer: `<strong>Output: "Hi Alice" → "Hi Alice" → "Hi undefined"</strong><br><br>
<code>boundToAlice()</code>: bound to alice → "Hi Alice".<br>
<code>boundToAlice.call(bob)</code>: .call tries to set this = bob, but <strong>bind is permanent</strong> — this remains alice → "Hi Alice". Bind cannot be overridden by call/apply.<br>
<code>new boundToAlice()</code>: <em>new</em> has highest precedence — overrides bind. this = fresh object with no name → "Hi undefined".`,
  tip: 'bind-cannot-be-overridden-by-call is directly asked at Flipkart and Razorpay. The one exception is new, which always wins.',
},

{
  id: 'cb-003', topic: 'call-apply-bind', level: 3, type: 'implementation',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'Implement Function.prototype.bind from scratch.',
  answer: `A correct polyfill must handle: partial application of arguments, correct this binding, and the new operator exception (new has higher precedence than bind).`,
  code: `Function.prototype.myBind = function(thisArg, ...presetArgs) {
  const fn = this;

  if (typeof fn !== 'function') throw new TypeError('Not a function');

  function BoundFn(...laterArgs) {
    const allArgs = [...presetArgs, ...laterArgs];
    // If called with 'new', ignore the bound this
    if (this instanceof BoundFn) {
      return new fn(...allArgs);
    }
    return fn.apply(thisArg, allArgs);
  }

  // Preserve prototype chain for instanceof to work correctly
  if (fn.prototype) {
    BoundFn.prototype = Object.create(fn.prototype);
  }

  return BoundFn;
};

function greet(greeting) {
  return greeting + ' ' + this.name;
}
const hi = greet.myBind({ name: 'Alice' }, 'Hello');
hi(); // "Hello Alice"`,
  tip: 'The new compatibility check (instanceof BoundFn) is what separates great implementations from mediocre ones. Interviewers at Google/Meta look for this.',
},

{
  id: 'cb-004', topic: 'call-apply-bind', level: 2, type: 'output',
  companies: ['Google', 'Atlassian'],
  question: 'What is the output? Tests bind partial application chaining.',
  code: `function add(a, b, c) {
  return a + b + c;
}
const add5 = add.bind(null, 5);
const add5and10 = add5.bind(null, 10);

console.log(add5(1, 2));
console.log(add5and10(3));
console.log(add.bind(null, 1).bind(null, 2)(3));`,
  answer: `<strong>Output: 8 → 18 → 6</strong><br><br>
add5 pre-fills a=5. add5(1,2) = 5+1+2 = 8.<br>
add5and10 pre-fills b=10 on top. add5and10(3) = 5+10+3 = 18.<br>
Chained binds: a=1, b=2, c=3 → 6.<br><br>
Note: chained bind for argument pre-filling (partial application) works fine. Chained bind to change <em>this</em> does NOT — the first bound this wins.`,
},

// ─── HOISTING ───────────────────────────────────────────────────────────────

{
  id: 'ho-001', topic: 'hoisting', level: 1, type: 'theory',
  companies: ['Infosys', 'HCL', 'Accenture'],
  question: 'What gets hoisted in JavaScript? What is the Temporal Dead Zone?',
  answer: `<strong>Fully hoisted</strong>: Function <em>declarations</em> — both name AND body. Callable before they appear in source.<br>
<strong>Partially hoisted</strong>: <code>var</code> — declaration moves to top of function scope, initialised to <code>undefined</code>. Assignment stays in place.<br>
<strong>Hoisted but not initialised (TDZ)</strong>: <code>let</code>, <code>const</code>, <code>class</code> — hoisted into scope but uninitialisable until the declaration line. Any access before that throws <code>ReferenceError</code>.<br>
<strong>Not hoisted meaningfully</strong>: Function expressions / arrow functions (only the var container is hoisted).`,
  code: `// Function declaration — hoisted completely
hello(); // "hi" ✓
function hello() { console.log('hi'); }

// var — hoisted as undefined
console.log(a); // undefined (NOT ReferenceError)
var a = 1;

// let/const — TDZ
console.log(b); // ReferenceError ✗
let b = 2;

// typeof quirk: var in TDZ is undefined, let in TDZ throws
console.log(typeof a); // 'undefined' (hoisted var, not yet assigned)
console.log(typeof b); // ReferenceError — even typeof hits TDZ`,
  tip: 'The two-phase model (creation phase → execution phase) is the internal reason hoisting exists. Mentioning this impresses interviewers.',
},

{
  id: 'ho-002', topic: 'hoisting', level: 2, type: 'output',
  companies: ['Amazon', 'Microsoft', 'Google'],
  question: 'What is the output? Classic var hoisting trap.',
  code: `var x = 1;
function test() {
  console.log(x);
  var x = 2;
  console.log(x);
}
test();
console.log(x);`,
  answer: `<strong>Output: undefined → 2 → 1</strong><br><br>
Inside test(), the local var x is hoisted to the top of <em>that function</em>. The first log sees the hoisted (but uninitialised) local x → undefined — it shadows the global x=1 from the very start of the function body.<br>
After x=2: second log → 2.<br>
After test(): global x is still 1.`,
},

{
  id: 'ho-003', topic: 'hoisting', level: 2, type: 'output',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'What does this print? Function declaration vs expression hoisting.',
  code: `console.log(typeof foo);  // ?
console.log(typeof bar);  // ?

var foo = function() { return 'foo expression'; };
function bar() { return 'bar declaration'; }`,
  answer: `<strong>Output: "undefined" → "function"</strong><br><br>
At the top of the scope:<br>
- <code>bar</code> is a function declaration → fully hoisted, typeof = "function".<br>
- <code>foo</code> is a var → hoisted as undefined, typeof = "undefined". The function value is NOT yet assigned at this point.`,
},

// ─── SCOPE & EXECUTION CONTEXT ──────────────────────────────────────────────

{
  id: 'sc-001', topic: 'scope', level: 1, type: 'theory',
  companies: ['Amazon', 'Flipkart'],
  question: 'What is an execution context? Describe its components.',
  answer: `An <strong>execution context</strong> is an internal data structure created every time code executes. It stores everything needed to run that code.<br><br>
<strong>Components:</strong><br>
1. <strong>Variable Environment</strong>: Stores var bindings and function declarations (hoisting happens here).<br>
2. <strong>Lexical Environment</strong>: Stores let/const. Has an outer reference → parent environment (forms the scope chain).<br>
3. <strong>this binding</strong>: The value of this in this context.<br><br>
<strong>Types:</strong> Global (1 total), Function (1 per call), Eval.<br><br>
<strong>Lifecycle:</strong><br>
Phase 1 — Creation: Variables/functions are set up (hoisting happens here).<br>
Phase 2 — Execution: Code runs line by line.`,
},

{
  id: 'sc-002', topic: 'scope', level: 3, type: 'theory',
  companies: ['Google', 'Netflix', 'Stripe'],
  question: 'What is lexical scope vs dynamic scope? Why does JS use lexical scope?',
  answer: `<strong>Lexical scope</strong>: Scope chain determined by where the function is <em>written</em> in source — fixed at author time. JavaScript uses this.<br><br>
<strong>Dynamic scope</strong>: Scope chain determined by the call stack at runtime — depends on who called the function. (Used by Bash, some Lisp dialects.)<br><br>
<strong>Why lexical scope matters:</strong> Code is predictable — you can understand what a function can access just by reading it, without tracing the runtime call chain. This enables closures, module patterns, and reliable variable capture.`,
  code: `let x = 'global';
function getX() { return x; }

function callGetX() {
  let x = 'local';
  return getX(); // lexical scope → 'global'
                  // dynamic scope would → 'local'
}
callGetX(); // 'global' in JS`,
  tip: "The <code>with</code> statement approximated dynamic scope — it was removed in strict mode because it broke lexical scope guarantees.",
},

// ─── TYPES & COERCION ───────────────────────────────────────────────────────

{
  id: 'tc-001', topic: 'types-coercion', level: 1, type: 'theory',
  companies: ['TCS', 'Infosys', 'Cognizant'],
  question: 'What are the 8 types in JavaScript? Primitives vs objects?',
  answer: `<strong>Primitives (7):</strong> undefined, null, boolean, number, bigint, string, symbol.<br>
— Immutable, compared/passed by <strong>value</strong>.<br><br>
<strong>Object (1):</strong> Everything else — plain objects, arrays, functions, Date, Map, Set, RegExp, etc.<br>
— Mutable, compared/passed by <strong>reference</strong>.<br><br>
<strong>typeof quirks to memorise:</strong><br>
<code>typeof null</code> = 'object' (25-year bug, can never be fixed)<br>
<code>typeof function(){}</code> = 'function' (not 'object')<br>
<code>typeof []</code> = 'object'<br>
<code>typeof undefined</code> = 'undefined'<br>
<code>typeof 42n</code> = 'bigint'`,
  code: `typeof null          // 'object'  ← historical bug
typeof []            // 'object'
typeof function(){}  // 'function' ← special case
typeof Symbol()      // 'symbol'
typeof 42n           // 'bigint'

// The only safe null check:
value === null`,
  tip: "null === null is always the correct null check. typeof null being 'object' is a well-known JavaScript spec bug that will never be fixed for backward compatibility.",
},

{
  id: 'tc-002', topic: 'types-coercion', level: 2, type: 'output',
  companies: ['Google', 'Meta', 'Airbnb'],
  question: 'What is the output? Classic type coercion traps.',
  code: `console.log(0 == false);
console.log('' == false);
console.log(null == undefined);
console.log(null == 0);
console.log([] == false);
console.log([] == ![]);
console.log(typeof NaN);
console.log(NaN === NaN);`,
  answer: `<strong>Output: true → true → true → false → true → true → "number" → false</strong><br><br>
0==false: false→0, 0==0=true.<br>
''==false: false→0, ''→0, 0==0=true.<br>
null==undefined: special spec rule — always true, no coercion.<br>
null==0: null only == undefined (and null) — false.<br>
[]==false: false→0, []→''→0, 0==0=true.<br>
[]==![]: ![]→false→0, []→0, true.<br>
typeof NaN: 'number' (NaN is a numeric type).<br>
NaN===NaN: false — NaN is the only value not equal to itself. Use Number.isNaN().`,
  tip: '[] == ![] being true is the most famous JS coercion trap. Walk through both sides step by step on a whiteboard.',
},

{
  id: 'tc-003', topic: 'types-coercion', level: 2, type: 'output',
  companies: ['Meta', 'Netflix', 'Stripe'],
  question: 'What is the output of these coercion puzzles?',
  code: `console.log(1 + '2');
console.log('3' - 1);
console.log(true + true);
console.log(+[]);
console.log(+{});
console.log('' + null);`,
  answer: `<strong>Output: "12" → 2 → 2 → 0 → NaN → "null"</strong><br><br>
1+'2': + with string → concatenation → "12".<br>
'3'-1: - only works with numbers → '3'→3, 3-1=2.<br>
true+true: true→1, 1+1=2.<br>
+[]: []→''→0.<br>
+{}: {}→'[object Object]'→NaN.<br>
''+null: null→'null' (toString coercion for concatenation).`,
},

// ─── FUNCTIONS & HOF ────────────────────────────────────────────────────────

{
  id: 'fn-001', topic: 'functions', level: 1, type: 'theory',
  companies: ['Amazon', 'Wipro'],
  question: 'What is the difference between function declaration, function expression, named function expression, and arrow function?',
  answer: `<strong>Function declaration</strong>: Fully hoisted. Has own this, arguments, prototype. Can be used as constructor.<br>
<strong>Function expression</strong>: Not hoisted (only the var container is). Otherwise same as declaration.<br>
<strong>Named function expression (NFE)</strong>: The name is scoped only to the function body — useful for recursion and stack traces.<br>
<strong>Arrow function</strong>: Not hoisted. No own this (lexical), no arguments object, no prototype, cannot be used with new.`,
  code: `// NFE — name is self-referential inside only:
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1); // 'fact' visible here
};
factorial(5); // 120
// fact(5);   // ReferenceError — not in outer scope

// Arrow — no own 'arguments':
const fn = (...args) => args; // must use rest params`,
},

{
  id: 'fn-002', topic: 'functions', level: 2, type: 'output',
  companies: ['Google', 'Stripe', 'Atlassian'],
  question: 'What does this print? Tests higher-order function understanding.',
  code: `function compose(...fns) {
  return x => fns.reduceRight((acc, fn) => fn(acc), x);
}
const add1  = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const transform = compose(add1, double, square);
console.log(transform(3));`,
  answer: `<strong>Output: 19</strong><br><br>
compose applies functions <em>right-to-left</em> (reduceRight):<br>
square(3) = 9 → double(9) = 18 → add1(18) = 19.<br><br>
<em>pipe</em> would apply left-to-right (reduce): add1(3)=4 → double(4)=8 → square(8)=64.`,
},

{
  id: 'fn-003', topic: 'functions', level: 3, type: 'theory',
  companies: ['Meta', 'Google', 'Netflix'],
  question: 'What are generator functions? How do they implement the iterator protocol?',
  answer: `A <strong>generator function</strong> (<code>function*</code>) returns a generator object that implements the Iterator protocol.<br><br>
Each <code>yield</code> <em>suspends execution</em>, preserving all local variables on the heap. <code>next(value)</code> resumes from the yield, and the passed value becomes the result of the yield expression inside the generator.<br><br>
<strong>Two-way communication:</strong> Values flow OUT via yield, values flow IN via next(val).<br><br>
Generator objects are BOTH iterators AND iterables — their <code>[Symbol.iterator]()</code> returns <code>this</code>.`,
  code: `function* idGen() {
  let id = 1;
  while (true) {
    const reset = yield id++;
    if (reset) id = 1;
  }
}
const gen = idGen();
gen.next().value;       // 1
gen.next().value;       // 2
gen.next(true).value;   // 1 (reset signal)
gen.next().value;       // 2

// As an iterable:
function* range(start, end) {
  for (let i = start; i <= end; i++) yield i;
}
[...range(1, 5)]; // [1, 2, 3, 4, 5]`,
},

// ─── ERROR HANDLING ─────────────────────────────────────────────────────────

{
  id: 'eh-001', topic: 'error-handling', level: 1, type: 'theory',
  companies: ['Amazon', 'Flipkart'],
  question: 'How does error handling differ between synchronous and asynchronous code?',
  answer: `<strong>Sync</strong>: try/catch works perfectly — errors bubble up the call stack synchronously.<br><br>
<strong>setTimeout/setInterval callbacks</strong>: try/catch does NOT catch them — the callback runs in a new event loop turn with an empty call stack. Errors become uncaught exceptions (window.onerror / process.on('uncaughtException')).<br><br>
<strong>Promises</strong>: Errors become rejections. Use .catch() or the second argument to .then(). Uncaught rejections fire <code>unhandledRejection</code>.<br><br>
<strong>async/await</strong>: try/catch works within the async function. But only if the rejected value is awaited.`,
  code: `// PITFALL — try/catch doesn't catch async callback errors:
try {
  setTimeout(() => { throw new Error('async'); }, 0);
} catch(e) { console.log('never'); } // error UNCAUGHT

// Promise — must chain .catch:
Promise.reject('fail').catch(e => console.log('caught:', e));

// async/await — try/catch works:
async function run() {
  try { await Promise.reject('fail'); }
  catch(e) { console.log('caught:', e); } // "caught: fail"
}`,
},

{
  id: 'eh-002', topic: 'error-handling', level: 3, type: 'output',
  companies: ['Stripe', 'Shopify'],
  question: 'What is the output? Tests Promise error propagation.',
  code: `Promise.resolve()
  .then(() => { throw 1; })
  .then(() => console.log('a'))
  .catch(e => { console.log('b', e); })
  .then(() => { throw 2; })
  .catch(e => console.log('c', e))
  .then(() => console.log('d'));`,
  answer: `<strong>Output: "b 1" → "c 2" → "d"</strong><br><br>
throw 1 → rejection, skips .then(log a), caught by .catch(b) → logs "b 1", returns <em>resolved</em> Promise.<br>
.then(throw 2) → new rejection. Caught by .catch(c) → logs "c 2".<br>
.then(log d) → logs "d".<br><br>
Key: .catch() that doesn't re-throw returns a <strong>resolved</strong> Promise — the chain recovers and continues.`,
},

// ─── GENERATORS & ITERATORS ─────────────────────────────────────────────────

{
  id: 'gi-001', topic: 'generators', level: 2, type: 'theory',
  companies: ['Google', 'Netflix', 'Stripe'],
  question: 'What is the iterator protocol? What is the iterable protocol?',
  answer: `<strong>Iterator protocol</strong>: An object is an iterator if it has a <code>next()</code> method returning <code>{value, done}</code>.<br><br>
<strong>Iterable protocol</strong>: An object is iterable if it has a <code>[Symbol.iterator]()</code> method that returns an iterator.<br><br>
Built-ins implementing both: Array, String, Map, Set, generator objects.<br><br>
<code>for...of</code>, spread, destructuring all require the iterable protocol.<br><br>
A <strong>generator object</strong> is BOTH an iterator AND an iterable (its [Symbol.iterator]() returns itself).`,
  code: `// Custom iterable + iterator:
const range = {
  [Symbol.iterator]() {       // iterable protocol
    let i = 0;
    return {
      next() {                // iterator protocol
        return i < 3
          ? { value: i++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

[...range];               // [0, 1, 2]
for (const n of range) console.log(n); // 0, 1, 2`,
},

{
  id: 'gi-002', topic: 'generators', level: 3, type: 'output',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'What is the output? Tricky generator execution flow.',
  code: `function* gen() {
  console.log('start');
  const x = yield 1;
  console.log('x is', x);
  const y = yield 2;
  console.log('y is', y);
  return 3;
}
const g = gen();
console.log(g.next());
console.log(g.next(10));
console.log(g.next(20));`,
  answer: `<strong>Output:</strong><br>
"start" → {value:1,done:false} → "x is 10" → {value:2,done:false} → "y is 20" → {value:3,done:true}<br><br>
g.next(): runs until yield 1 → logs 'start', pauses, returns {value:1}.<br>
g.next(10): resumes, 10 = result of yield expression → x=10, logs 'x is 10', pauses → {value:2}.<br>
g.next(20): resumes, y=20, logs 'y is 20', hits return 3 → {value:3, done:true}.`,
},

// ─── WEAKMAP & WEAKSET ──────────────────────────────────────────────────────

{
  id: 'wm-001', topic: 'weakmap-weakset', level: 2, type: 'theory',
  companies: ['Google', 'Meta', 'Netflix'],
  question: 'What are WeakMap and WeakSet? Why are they not iterable?',
  answer: `<strong>WeakMap</strong>: A Map where keys must be objects. The key reference is <em>weak</em> — if no other strong references to the key exist, it can be garbage collected and the entry is automatically removed. No .size property, not iterable.<br><br>
<strong>WeakSet</strong>: A Set of objects with weak references. Same GC semantics.<br><br>
<strong>Why not iterable?</strong> GC is non-deterministic — an entry might be collected at any moment. If you could iterate, results would be unpredictable across different GC runs or JS engines. Non-iterability is a <em>deliberate design decision</em>.`,
  code: `let obj = { name: 'Alice' };
const wm = new WeakMap();
wm.set(obj, 'private data');

wm.get(obj);  // 'private data'
obj = null;   // obj eligible for GC
// wm entry automatically cleaned up — no memory leak!

// Use case: private instance data (pre-class fields)
const _private = new WeakMap();
class Person {
  constructor(name, secret) {
    _private.set(this, { secret });
    this.name = name;
  }
  getSecret() { return _private.get(this).secret; }
}`,
},

// ─── SYMBOLS ────────────────────────────────────────────────────────────────

{
  id: 'sy-001', topic: 'symbols', level: 1, type: 'theory',
  companies: ['Google', 'Stripe'],
  question: 'What is a Symbol? What problem does it solve?',
  answer: `A <strong>Symbol</strong> is a primitive type that produces a guaranteed unique value every time — even with the same description. Introduced in ES6 to solve the <strong>name collision problem</strong>: you can add properties to objects without risk of overwriting existing properties.<br><br>
<strong>Key properties:</strong><br>
— Always unique: Symbol('x') !== Symbol('x')<br>
— Cannot be auto-converted to string (must use .toString() or .description)<br>
— Hidden from Object.keys(), JSON.stringify(), for...in<br>
— Can be used as computed property keys`,
  code: `const id = Symbol('id');
const user = { name: 'Alice', [id]: 123 };

user[id];             // 123
Object.keys(user);    // ['name'] — Symbol excluded
JSON.stringify(user); // {"name":"Alice"} — Symbol excluded

// Uniqueness:
Symbol('x') === Symbol('x');     // false
Symbol.for('x') === Symbol.for('x'); // true — global registry`,
  tip: 'Symbol.for() uses a cross-realm global registry — useful when multiple modules or iframes need to share the same symbol key.',
},

{
  id: 'sy-002', topic: 'symbols', level: 3, type: 'theory',
  companies: ['Google', 'Netflix'],
  question: 'What are well-known Symbols? Give examples of Symbol.iterator and Symbol.toPrimitive.',
  answer: `<strong>Well-known Symbols</strong> are built-in Symbols that customise JS language behaviour:<br><br>
<strong>Symbol.iterator</strong>: Defines how an object is iterated (for...of, spread, destructuring).<br>
<strong>Symbol.toPrimitive</strong>: Controls type coercion with a hint ('number', 'string', 'default').<br>
<strong>Symbol.hasInstance</strong>: Customises the instanceof operator.<br>
Others: Symbol.asyncIterator, Symbol.species, Symbol.toStringTag.`,
  code: `// Symbol.iterator — make any object iterable:
class NumberRange {
  constructor(start, end) { this.start = start; this.end = end; }
  [Symbol.iterator]() {
    let cur = this.start, end = this.end;
    return { next: () => cur <= end
      ? { value: cur++, done: false }
      : { done: true } };
  }
}
[...new NumberRange(1, 3)]; // [1, 2, 3]

// Symbol.toPrimitive — custom type coercion:
const money = {
  amount: 100, currency: 'USD',
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.amount;
    if (hint === 'string') return \`\${this.amount} \${this.currency}\`;
    return this.amount;
  }
};
+money;       // 100
\`\${money}\`;   // "100 USD"
money + 5;    // 105`,
},

// ─── VAR / LET / CONST ──────────────────────────────────────────────────────

{
  id: 'vl-001', topic: 'var-let-const', level: 1, type: 'theory',
  companies: ['Amazon', 'Google', 'TCS'],
  question: 'What are the differences between var, let, and const?',
  answer: `<table style="width:100%;border-collapse:collapse;font-size:12px">
<tr><th style="text-align:left;padding:4px 8px">Feature</th><th>var</th><th>let</th><th>const</th></tr>
<tr><td style="padding:4px 8px">Scope</td><td>Function</td><td>Block</td><td>Block</td></tr>
<tr><td style="padding:4px 8px">Hoisting</td><td>Yes (undefined)</td><td>TDZ</td><td>TDZ</td></tr>
<tr><td style="padding:4px 8px">Re-declare</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td style="padding:4px 8px">Re-assign</td><td>Yes</td><td>Yes</td><td>No</td></tr>
<tr><td style="padding:4px 8px">Global prop</td><td>Yes</td><td>No</td><td>No</td></tr>
</table><br>
<strong>const does NOT make objects immutable</strong> — it only prevents re-assignment of the binding. Object properties can still be mutated. Use Object.freeze() for shallow immutability.`,
  code: `const obj = { x: 1 };
obj.x = 2;    // ✓ — mutation is fine
obj = {};     // ✗ — TypeError: Assignment to constant variable

// For immutability:
const frozen = Object.freeze({ x: 1 });
frozen.x = 2; // silently ignored (or throws in strict mode)`,
},

{
  id: 'vl-002', topic: 'var-let-const', level: 1, type: 'output',
  companies: ['Amazon', 'Microsoft'],
  question: 'What does this print? var leaks out of blocks.',
  code: `for (var i = 0; i < 4; i++) {}
console.log(i);

for (let j = 0; j < 4; j++) {}
console.log(j);`,
  answer: `<strong>Output: 4 → ReferenceError</strong><br><br>
var is function-scoped (or global-scoped here), NOT block-scoped. After the loop, i = 4 (the value that failed the condition). It leaks out of the block.<br>
let is block-scoped — j ceases to exist after the for block. Accessing it throws ReferenceError.`,
},

// ─── PROTOTYPES & INHERITANCE ───────────────────────────────────────────────

{
  id: 'pt-001', topic: 'prototypes', level: 1, type: 'theory',
  companies: ['Google', 'Meta', 'Amazon'],
  question: 'How does prototypal inheritance work in JavaScript?',
  answer: `Every JavaScript object has an internal <code>[[Prototype]]</code> link to another object (or null). When you access a property, the engine first checks the object itself, then walks up the <strong>prototype chain</strong> until it finds the property or reaches null.<br><br>
Functions have a <code>.prototype</code> property. When you call a function with <code>new</code>, the created object's [[Prototype]] is set to that function's .prototype.`,
  code: `function Animal(name) { this.name = name; }
Animal.prototype.speak = function() {
  return this.name + ' makes a sound.';
};

function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() { return 'Woof!'; };

const d = new Dog('Rex');
d.bark();    // 'Woof!'  (own prototype)
d.speak();   // 'Rex makes a sound.' (inherited from Animal.prototype)

// ES6 class syntax does the same thing underneath:
class Cat extends Animal {
  meow() { return 'Meow!'; }
}`,
  tip: "Classes in JavaScript are syntactic sugar over prototype-based inheritance — they don't change the underlying mechanism.",
},

{
  id: 'pt-002', topic: 'prototypes', level: 2, type: 'theory',
  companies: ['Meta', 'Netflix', 'Stripe'],
  question: 'What does Object.create() do? How is it different from new?',
  answer: `<code>Object.create(proto)</code> creates a new object whose [[Prototype]] is set to <code>proto</code>. Unlike <code>new Constructor()</code>, it does NOT run a constructor function — it purely sets up the prototype link.<br><br>
This is useful for creating objects that inherit from another without needing a constructor.`,
  code: `const animal = {
  speak() { return this.name + ' speaks'; }
};

const dog = Object.create(animal);
dog.name = 'Rex';
dog.speak(); // 'Rex speaks' — inherited from animal

// Equivalent to:
const dog2 = { __proto__: animal, name: 'Rex' };

// Object.create(null) creates a "pure" object with NO prototype:
const dict = Object.create(null);
// dict has no .toString, .hasOwnProperty, etc. — safe as a dictionary`,
},

{
  id: 'pt-003', topic: 'prototypes', level: 3, type: 'output',
  companies: ['Google', 'Shopify'],
  question: 'What is the output? Tests prototype chain and property shadowing.',
  code: `function Foo() { this.x = 1; }
Foo.prototype.x = 2;
Foo.prototype.y = 3;

const f = new Foo();
console.log(f.x);
console.log(f.y);
delete f.x;
console.log(f.x);`,
  answer: `<strong>Output: 1 → 3 → 2</strong><br><br>
f.x = 1: own property shadows prototype's x=2.<br>
f.y = 3: not on instance, found on prototype.<br>
delete f.x: removes the own property. Now f.x climbs the chain → Foo.prototype.x = 2.`,
},

// ─── ARRAY METHODS ──────────────────────────────────────────────────────────

{
  id: 'ar-001', topic: 'arrays', level: 1, type: 'theory',
  companies: ['Amazon', 'TCS', 'Infosys'],
  question: 'What is the difference between map, filter, reduce, and forEach?',
  answer: `<strong>map(fn)</strong>: Transforms each element; returns a NEW array of the same length.<br>
<strong>filter(fn)</strong>: Keeps elements for which fn returns truthy; returns a NEW array (shorter or equal).<br>
<strong>reduce(fn, init)</strong>: Accumulates elements into a single value; returns the accumulator.<br>
<strong>forEach(fn)</strong>: Iterates for side effects; always returns undefined. Cannot be chained.`,
  code: `const nums = [1, 2, 3, 4, 5];

// map — transform
nums.map(x => x * 2);           // [2, 4, 6, 8, 10]

// filter — select
nums.filter(x => x % 2 === 0);  // [2, 4]

// reduce — accumulate
nums.reduce((sum, x) => sum + x, 0); // 15

// Chained:
nums
  .filter(x => x % 2 !== 0)   // [1, 3, 5]
  .map(x => x ** 2)            // [1, 9, 25]
  .reduce((s, x) => s + x, 0); // 35`,
},

{
  id: 'ar-002', topic: 'arrays', level: 2, type: 'implementation',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'Implement Array.prototype.flat from scratch.',
  answer: `flat(depth) recursively flattens nested arrays up to the given depth. The key is handling the depth counter correctly for recursive calls.`,
  code: `Array.prototype.myFlat = function(depth = 1) {
  return this.reduce((acc, val) => {
    if (Array.isArray(val) && depth > 0) {
      acc.push(...val.myFlat(depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
};

[1, [2, [3, [4]]]].myFlat();    // [1, 2, [3, [4]]]
[1, [2, [3, [4]]]].myFlat(2);   // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].myFlat(Infinity); // [1, 2, 3, 4]`,
},

{
  id: 'ar-003', topic: 'arrays', level: 2, type: 'output',
  companies: ['Amazon', 'Flipkart'],
  question: 'What is the difference between splice and slice?',
  answer: `<strong>slice(start, end)</strong>: Returns a shallow copy of a portion. Does NOT modify the original.<br>
<strong>splice(start, deleteCount, ...items)</strong>: Mutates the original — removes and/or inserts elements in-place. Returns the removed elements.`,
  code: `const a = [1, 2, 3, 4, 5];

// slice — non-mutating
const s = a.slice(1, 3);
console.log(s); // [2, 3]
console.log(a); // [1, 2, 3, 4, 5] — unchanged

// splice — mutating
const removed = a.splice(1, 2, 10, 20);
console.log(removed); // [2, 3] — removed elements
console.log(a);       // [1, 10, 20, 4, 5] — mutated!`,
  tip: '"slice has no side effects, splice does." Mnemonic: sp-LICE vs sp-LICE + mutate. slice returns a slice, splice changes the array in place.'
},

// ─── ES6+ FEATURES ──────────────────────────────────────────────────────────

{
  id: 'es-001', topic: 'es6', level: 1, type: 'theory',
  companies: ['Amazon', 'Google', 'Meta'],
  question: 'Explain destructuring, rest, and spread operators.',
  answer: `<strong>Destructuring</strong>: Extract values from arrays/objects into variables.<br>
<strong>Rest (...)</strong>: Collect remaining arguments/items into an array.<br>
<strong>Spread (...)</strong>: Expand an iterable into individual elements.`,
  code: `// Destructuring
const [a, b, ...rest] = [1, 2, 3, 4, 5];
// a=1, b=2, rest=[3,4,5]

const { name, age = 25 } = { name: 'Alice' };
// name='Alice', age=25 (default)

// Spread — clone, merge, call
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1,2,3,4,5]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // {a:1, b:2}

Math.max(...arr1); // 3

// Rest in function params
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10`,
},

{
  id: 'es-002', topic: 'es6', level: 2, type: 'theory',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'What are Proxy and Reflect in JavaScript?',
  answer: `<strong>Proxy</strong>: Wraps an object and intercepts fundamental operations on it (get, set, has, deleteProperty, apply, construct, etc.) using handler "traps".<br><br>
<strong>Reflect</strong>: Provides the same fundamental operations as methods (Reflect.get, Reflect.set, etc.) — useful inside Proxy traps to invoke the default behaviour.`,
  code: `const handler = {
  get(target, key) {
    console.log(\`Getting \${String(key)}\`);
    return Reflect.get(target, key); // default behaviour
  },
  set(target, key, value) {
    if (typeof value !== 'number') throw new TypeError('Must be number');
    return Reflect.set(target, key, value);
  }
};

const obj = new Proxy({}, handler);
obj.x = 42;       // sets fine
obj.y = 'hello';  // TypeError!
obj.x;            // logs "Getting x" → 42

// Common use cases: validation, logging, reactive data (Vue 3 uses Proxy)`,
  tip: 'Vue 3 replaced Object.defineProperty with Proxy for reactivity — enabling tracking of property additions, deletions, and array index changes.',
},

{
  id: 'es-003', topic: 'es6', level: 2, type: 'theory',
  companies: ['Amazon', 'Google'],
  question: 'What is optional chaining (?.) and nullish coalescing (??)?',
  answer: `<strong>Optional chaining (?.):</strong> Short-circuits to <code>undefined</code> if any part of the chain is null or undefined, instead of throwing a TypeError.<br><br>
<strong>Nullish coalescing (??):</strong> Returns the right operand only if the left is <code>null</code> or <code>undefined</code> (not 0, '', false).`,
  code: `const user = { profile: { name: 'Alice' } };

// Optional chaining
user?.profile?.name;     // 'Alice'
user?.address?.city;     // undefined (no throw)
user?.greet?.();         // undefined (method call)
user?.items?.[0];        // undefined (array access)

// Nullish coalescing vs OR
const a = 0;
a || 'default';   // 'default' — 0 is falsy
a ?? 'default';   // 0 — 0 is NOT null/undefined

// Combined
const city = user?.address?.city ?? 'Unknown';`,
},

// ─── PERFORMANCE & MEMORY ───────────────────────────────────────────────────

{
  id: 'pf-001', topic: 'performance', level: 2, type: 'theory',
  companies: ['Google', 'Meta', 'Netflix'],
  question: 'What is the difference between shallow copy and deep copy? When does each matter?',
  answer: `<strong>Shallow copy</strong>: Copies only the top-level properties. Nested objects are still shared references — mutating them in the copy affects the original.<br><br>
<strong>Deep copy</strong>: Recursively copies all nested objects. The copy is fully independent.`,
  code: `const original = { a: 1, nested: { b: 2 } };

// Shallow copy methods:
const shallow1 = { ...original };
const shallow2 = Object.assign({}, original);
shallow1.nested.b = 99; // MUTATES original.nested.b!
console.log(original.nested.b); // 99

// Deep copy options:
// 1. structuredClone (modern, handles most types)
const deep1 = structuredClone(original);
deep1.nested.b = 42;
console.log(original.nested.b); // 99 — unaffected ✓

// 2. JSON roundtrip (loses Date, undefined, functions, etc.)
const deep2 = JSON.parse(JSON.stringify(original));

// 3. Recursive manual copy for full control`,
},

{
  id: 'pf-002', topic: 'performance', level: 3, type: 'theory',
  companies: ['Google', 'Meta'],
  question: 'What is garbage collection in JavaScript? What is the mark-and-sweep algorithm?',
  answer: `JavaScript uses <strong>automatic garbage collection</strong> — memory is automatically freed when objects are no longer <em>reachable</em> from the root (global scope, call stack, etc.).<br><br>
<strong>Mark-and-sweep:</strong><br>
1. Mark phase: GC starts from roots and marks every reachable object.<br>
2. Sweep phase: Any unmarked object is unreachable — its memory is freed.<br><br>
<strong>What causes memory leaks:</strong><br>
— Global variables that grow indefinitely<br>
— Closures holding large data unnecessarily<br>
— Event listeners never removed<br>
— Circular references (handled by mark-and-sweep, not by older reference counting)`,
  code: `// Not a leak in modern JS (mark-and-sweep handles cycles):
let obj1 = {};
let obj2 = { ref: obj1 };
obj1.ref = obj2;
obj1 = null; obj2 = null; // both eligible for GC despite cycle

// IS a memory leak:
let cache = {};
function leak() {
  cache[Date.now()] = new Array(10000); // grows forever
}
setInterval(leak, 100); // cache holds a strong reference → never GC'd`,
},

// ─── FROM PDF / ADDITIONAL INTERVIEW QUESTIONS ──────────────────────────────

{
  id: 'add-001', topic: 'functions', level: 2, type: 'implementation',
  companies: ['Google', 'Amazon', 'Meta'],
  question: 'Implement a function that flattens a deeply nested object.',
  answer: `Flatten a nested object into a single-level object with dot-notation keys. Uses recursion — when a value is a plain object (not array), recurse with the accumulated key prefix.`,
  code: `function flattenObject(obj, prefix = '', result = {}) {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
    const val = obj[key];

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      flattenObject(val, fullKey, result); // recurse
    } else {
      result[fullKey] = val; // leaf node
    }
  }
  return result;
}

flattenObject({
  a: 1,
  b: { c: 2, d: { e: 3 } },
  f: [1, 2]
});
// { 'a': 1, 'b.c': 2, 'b.d.e': 3, 'f': [1,2] }`,
},

{
  id: 'add-002', topic: 'functions', level: 2, type: 'implementation',
  companies: ['Google', 'Meta', 'Stripe'],
  question: 'Implement a deep equality check between two values.',
  answer: `Structural equality — two objects are deep equal if they have the same keys and recursively deep-equal values. Arrays are treated as ordered sequences.`,
  code: `function deepEqual(a, b) {
  if (a === b) return true;

  // Handle null (typeof null === 'object')
  if (a === null || b === null) return false;

  // Must be same type
  if (typeof a !== typeof b) return false;

  // Handle arrays
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  // Handle objects
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(k => deepEqual(a[k], b[k]));
  }

  return false; // primitives already handled by a === b
}

deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }); // true
deepEqual({ a: 1 }, { a: 2 });                         // false`,
},

{
  id: 'add-003', topic: 'functions', level: 3, type: 'implementation',
  companies: ['Meta', 'Netflix'],
  question: 'Implement a curry function that supports both curried and normal invocation.',
  answer: `A variadic curry that works with functions of any arity. If enough arguments are supplied, invoke immediately; otherwise return a new function waiting for more.`,
  code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args); // enough args — invoke
    }
    return function(...moreArgs) {
      return curried.apply(this, [...args, ...moreArgs]);
    };
  };
}

const add = curry((a, b, c) => a + b + c);

add(1)(2)(3);   // 6 — fully curried
add(1, 2)(3);   // 6 — mixed
add(1)(2, 3);   // 6 — mixed
add(1, 2, 3);   // 6 — normal call`,
},

{
  id: 'add-004', topic: 'event-loop', level: 3, type: 'implementation',
  companies: ['Amazon', 'Google'],
  question: 'Implement a task scheduler that runs tasks with priorities and delays.',
  answer: `Demonstrates understanding of event loop, Promise chaining, and priority queues.`,
  code: `class TaskScheduler {
  constructor() {
    this.queue = []; // { fn, priority, delay }
    this.running = false;
  }

  add(fn, { priority = 0, delay = 0 } = {}) {
    this.queue.push({ fn, priority, delay });
    this.queue.sort((a, b) => b.priority - a.priority); // sort by priority
    if (!this.running) this._run();
  }

  async _run() {
    this.running = true;
    while (this.queue.length) {
      const { fn, delay } = this.queue.shift();
      if (delay > 0) await new Promise(r => setTimeout(r, delay));
      await fn();
    }
    this.running = false;
  }
}

const scheduler = new TaskScheduler();
scheduler.add(() => console.log('low'), { priority: 0 });
scheduler.add(() => console.log('high'), { priority: 10 });
scheduler.add(() => console.log('medium'), { priority: 5 });
// Output: high → medium → low`,
},

{
  id: 'add-005', topic: 'prototypes', level: 3, type: 'implementation',
  companies: ['Google', 'Meta'],
  question: 'What does the new operator do step by step? Implement your own new.',
  answer: `The <code>new</code> operator performs exactly 4 steps:<br>
1. Creates a new empty object.<br>
2. Sets the new object's [[Prototype]] to Constructor.prototype.<br>
3. Calls the constructor with <code>this</code> = the new object.<br>
4. Returns the new object, UNLESS the constructor explicitly returns another object.`,
  code: `function myNew(Constructor, ...args) {
  // 1. Create object with correct prototype
  const obj = Object.create(Constructor.prototype);

  // 2. Call constructor with the new object as 'this'
  const result = Constructor.apply(obj, args);

  // 3. If constructor returns an object, use that instead
  return (result !== null && typeof result === 'object') ? result : obj;
}

function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() { return 'Hi, ' + this.name; };

const alice = myNew(Person, 'Alice');
alice.greet();            // 'Hi, Alice'
alice instanceof Person;  // true`,
},

{
  id: 'add-006', topic: 'var-let-const', level: 2, type: 'output',
  companies: ['Google', 'Amazon'],
  question: 'What prints? var vs let in closures inside a block.',
  code: `var x = 'outer';
{
  var x = 'inner'; // same variable — var is function-scoped
  console.log(x);
}
console.log(x);

let y = 'outer';
{
  let y = 'inner'; // new variable — let is block-scoped
  console.log(y);
}
console.log(y);`,
  answer: `<strong>Output: "inner" → "inner" → "inner" → "outer"</strong><br><br>
var: the block's var x is the SAME variable as the outer var x (function scope). The inner declaration overwrites it globally.<br>
let: the block's let y is a completely new binding scoped to the block. The outer y is untouched.`,
},

{
  id: 'add-007', topic: 'types-coercion', level: 2, type: 'theory',
  companies: ['Google', 'Meta', 'Amazon'],
  question: 'What is the difference between == and ===? When would you use ==?',
  answer: `<strong>=== (strict equality)</strong>: Compares value AND type. No type coercion. Always use this.<br><br>
<strong>== (loose equality)</strong>: Compares after type coercion using the Abstract Equality Comparison algorithm. Can produce surprising results.<br><br>
<strong>Rare legitimate use of ==:</strong> Checking for both null and undefined simultaneously: <code>x == null</code> is true only when x is null OR undefined.`,
  code: `// The only good use of ==:
function isNullOrUndefined(x) {
  return x == null; // true if null OR undefined
  // Equivalent to: x === null || x === undefined
}

// All the nasty ==:
0 == false   // true
'' == 0      // true
[] == 0      // true
[] == ''     // true
'' == false  // true
null == 0    // false (! null only == undefined/null)
NaN == NaN   // false (NaN is never equal to anything)`,
},

{
  id: 'add-008', topic: 'promises', level: 2, type: 'theory',
  companies: ['Amazon', 'Netflix'],
  question: 'How do you handle multiple concurrent API calls where you need all results?',
  answer: `Use <code>Promise.all</code> for concurrent execution where ALL must succeed, or <code>Promise.allSettled</code> when you need all results regardless of failure.`,
  code: `// Sequential (SLOW — each awaits the previous):
const user = await fetchUser(id);
const posts = await fetchPosts(id);
const comments = await fetchComments(id);

// Concurrent with Promise.all (FAST — all fire simultaneously):
const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id)
]);

// With error isolation (Promise.allSettled):
const results = await Promise.allSettled([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id)
]);
const [userResult, postsResult, commentsResult] = results;
if (userResult.status === 'fulfilled') {
  console.log(userResult.value);
} else {
  console.error(userResult.reason);
}`,
  tip: 'Using sequential await when requests are independent is a common performance anti-pattern. Always use Promise.all for truly independent async operations.',
},

{
  id: 'add-009', topic: 'es6', level: 2, type: 'theory',
  companies: ['Amazon', 'Google', 'Meta'],
  question: 'What are Map and Set? How do they differ from plain objects and arrays?',
  answer: `<strong>Map</strong>: Key-value collection where keys can be ANY type (including objects, functions). Maintains insertion order. Has .size. Iterable with for...of.<br><br>
<strong>Set</strong>: Collection of unique values of any type. Maintains insertion order. No duplicates. Has .size.<br><br>
<strong>vs plain Object:</strong> Object keys are always strings/Symbols. Object has prototype pollution risk. Map has O(1) lookup with any key type.<br>
<strong>vs Array:</strong> Set has O(1) .has() vs Array's O(n) .includes(). Use Set for deduplication and membership testing.`,
  code: `// Map — any key type
const map = new Map();
const keyObj = {};
map.set(keyObj, 'value');
map.set(42, 'number key');
map.get(keyObj); // 'value'
map.size;        // 2

// Set — unique values
const set = new Set([1, 2, 2, 3, 3]);
set.size;        // 3
set.has(2);      // true

// Common use case: deduplicate array
const dedup = arr => [...new Set(arr)];
dedup([1, 2, 2, 3, 3]); // [1, 2, 3]`,
},

{
  id: 'add-010', topic: 'closures', level: 4, type: 'output',
  companies: ['Google', 'Meta'],
  question: 'What is the output? Multiple closures over shared mutable state.',
  code: `function makeAdder(x) {
  return {
    add: (y) => x + y,
    addAndStore: (y) => { x += y; return x; }
  };
}

const adder = makeAdder(5);
console.log(adder.add(3));
console.log(adder.addAndStore(10));
console.log(adder.add(3));`,
  answer: `<strong>Output: 8 → 15 → 18</strong><br><br>
Both methods close over the SAME <code>x</code> variable. addAndStore(10) mutates x: 5+10=15. Now x=15. add(3) returns 15+3=18.<br><br>
This demonstrates that closures share the same live binding — not a snapshot. All closures created in the same scope reference the same variable.`,
},

]

export const QUIZ_QUESTIONS = [
  {
    id: 'quiz-001', topic: 'closures', level: 1,
    title: 'Basic closure access',
    code: `function outer() {
  let x = 10;
  function inner() { console.log(x); }
  inner();
}
outer();`,
    options: ['10', 'undefined', 'ReferenceError', 'null'],
    answer: 0,
    explanation: '<strong>Output: 10</strong><br>inner() has access to outer\'s lexical scope. x=10 at call time. Classic lexical scoping.',
    concept: 'Lexical scope access'
  },
  {
    id: 'quiz-002', topic: 'closures', level: 2,
    title: 'Closure in loop with var',
    code: `const funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(() => i);
}
console.log(funcs[0](), funcs[1](), funcs[2]());`,
    options: ['0 1 2', '3 3 3', '0 0 0', 'undefined'],
    answer: 1,
    explanation: '<strong>Output: 3 3 3</strong><br>var is function-scoped — all closures share the same i. By the time any is called, the loop is done and i===3.',
    concept: 'var in loop closure trap'
  },
  {
    id: 'quiz-003', topic: 'event-loop', level: 1,
    title: 'Event loop basics',
    code: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
    options: ['1 2 3 4', '1 4 2 3', '1 4 3 2', '1 3 4 2'],
    answer: 2,
    explanation: '<strong>Output: 1 4 3 2</strong><br>Sync first (1,4). Microtask (Promise) before macrotask (setTimeout): 3 then 2.',
    concept: 'Microtask vs macrotask order'
  },
  {
    id: 'quiz-004', topic: 'this', level: 2,
    title: 'Arrow vs regular this',
    code: `const obj = {
  val: 42,
  getVal: function() { return this.val; },
  getValArrow: () => this.val
};
console.log(obj.getVal());
console.log(obj.getValArrow());`,
    options: ['42 42', '42 undefined', 'undefined 42', 'undefined undefined'],
    answer: 1,
    explanation: '<strong>Output: 42 undefined</strong><br>getVal: regular function, called as method → this=obj → 42.<br>getValArrow: arrow, defined at object literal level → this=global/module → undefined.',
    concept: 'Arrow function this binding'
  },
  {
    id: 'quiz-005', topic: 'hoisting', level: 2,
    title: 'Hoisting order',
    code: `console.log(typeof foo);
var foo = 5;
console.log(typeof foo);`,
    options: ['"number" "number"', '"undefined" "number"', 'ReferenceError', '"undefined" "undefined"'],
    answer: 1,
    explanation: '<strong>Output: "undefined" "number"</strong><br>var foo is hoisted (as undefined). First typeof → "undefined". After assignment: typeof → "number".',
    concept: 'var hoisting'
  },
  {
    id: 'quiz-006', topic: 'var-let-const', level: 1,
    title: 'var vs let in block',
    code: `for (var i = 0; i < 4; i++) {}
console.log(i);`,
    options: ['0', '3', '4', 'ReferenceError'],
    answer: 2,
    explanation: '<strong>Output: 4</strong><br>var is function-scoped, not block-scoped. i leaks out of the for block. i=4 (the value that failed the loop condition).',
    concept: 'var scope leak'
  },
  {
    id: 'quiz-007', topic: 'types-coercion', level: 2,
    title: 'Coercion with +',
    code: `console.log(1 + '2' + 3);
console.log(1 + 2 + '3');`,
    options: ['"123" "33"', '"123" "123"', '"33" "33"', '6 "33"'],
    answer: 0,
    explanation: '<strong>Output: "123" "33"</strong><br>Left to right: 1+"2"="12", "12"+3="123".<br>1+2=3 (numeric), 3+"3"="33".',
    concept: 'Left-to-right + coercion'
  },
  {
    id: 'quiz-008', topic: 'closures', level: 3,
    title: 'Closure with let in loop',
    code: `const funcs = [];
for (let i = 0; i < 3; i++) {
  funcs.push(() => i);
}
console.log(funcs[0](), funcs[1](), funcs[2]());`,
    options: ['0 1 2', '3 3 3', '2 2 2', 'undefined'],
    answer: 0,
    explanation: '<strong>Output: 0 1 2</strong><br>let creates a NEW binding per iteration. Each closure captures its own unique i.',
    concept: 'let creates new binding per iteration'
  },
  {
    id: 'quiz-009', topic: 'promises', level: 2,
    title: 'Promise chain return value',
    code: `Promise.resolve(5)
  .then(x => x * 2)
  .then(x => x + 1)
  .then(x => console.log(x));`,
    options: ['5', '10', '11', 'undefined'],
    answer: 2,
    explanation: '<strong>Output: 11</strong><br>5 * 2 = 10. 10 + 1 = 11. Each .then wraps the return value in a resolved Promise.',
    concept: 'Promise chain value passing'
  },
  {
    id: 'quiz-010', topic: 'this', level: 3,
    title: 'Bind precedence',
    code: `function f() { return this.x; }
const bound = f.bind({ x: 1 });
console.log(bound.call({ x: 2 }));`,
    options: ['1', '2', 'undefined', 'TypeError'],
    answer: 0,
    explanation: '<strong>Output: 1</strong><br>bind is permanent — .call() cannot override a bound this. The first bind wins. (Exception: new can override bind.)',
    concept: 'bind is permanent, call cannot override it'
  },
]
