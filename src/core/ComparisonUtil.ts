// Create function to check if an element is in a specified set.
export function isIn<T>(s: Set<T>) { return (elt: T) => s.has(elt); }

// Check if one set contains another (all members of s2 are in s1).
export function contains<T>(s1: Set<T>, s2: Set<T>) { return [...s2].every(isIn(s1)); }

// Alternative, check size first
export function eqSet<T>(a: Set<T>, b: Set<T>) { return a.size === b.size && contains(a, b); }
