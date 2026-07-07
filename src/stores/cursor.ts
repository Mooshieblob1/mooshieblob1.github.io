// Shared cursor state. CursorFollower writes the eased position of its ring
// here every frame; other effects (GravityGrid) read it so they track the
// visible ring rather than the raw pointer. Plain object, not reactive —
// it's mutated per animation frame and only ever read inside rAF loops.
export const followerPos = { x: -9999, y: -9999 };
