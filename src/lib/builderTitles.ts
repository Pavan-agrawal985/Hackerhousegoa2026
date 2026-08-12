const PREFIXES = [
  "The Wave Rider",
  "The Midnight Shipper",
  "The Sunset Debugger",
  "The Beach Hacker",
  "The Bug Whisperer",
  "The Terminal Nomad",
  "The Sand & Syntax Coder",
  "The Ocean Deploy Captain",
  "The Palm Tree Architect",
  "The Coconut Committer",
  "The Monsoon Merger",
  "The Salt Water Shipper",
  "The Late Night Launcher",
  "The Tide Break Builder",
  "The Fiber Optic Surfer",
  "The Caffeine Coder",
  "The Goa Ghost in the Shell",
  "The Full Stack Fisherman",
  "The Deploy or Drown Dev",
  "The 4-Day Legend",
];

export function randomBuilderTitle(seed?: string): string {
  if (!seed) {
    return PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  }
  // deterministic-ish pick based on a name/seed so re-clicks feel fresh
  // but repeated identical seeds don't always collide.
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  const idx = (hash + Math.floor(Math.random() * PREFIXES.length)) % PREFIXES.length;
  return PREFIXES[idx];
}

export const STACK_SUGGESTIONS = [
  "Fullstack · Builder",
  "Frontend · Design Engineer",
  "Backend · Infra",
  "ML · GenAI",
  "Product · No-Code",
  "Mobile · Flutter",
  "Web3 · Smart Contracts",
  "DevOps · Cloud",
  "Founder · Everything",
];
