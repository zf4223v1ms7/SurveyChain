# SurveyChain

SurveyChain is a privacy-preserving survey and voting dApp built on Zama's fhEVM.
All cast ballots remain encrypted on-chain while still allowing real-time tally
updates and fine-grained access control over the final results.

The project is composed of:
- A Solidity smart contract (`contracts/SurveyChain.sol`) that enforces survey
  rules, manages viewer permissions, and aggregates encrypted votes.
- A React/Vite front-end (`src/`) for creating surveys and interacting with the
  fhEVM browser wallet.

## Smart Contract Overview

### Key storage
- `euint64` tallies stored per option: `_votes[optionId]`.
- Per-address voting flag: `_hasVoted`.
- Dynamic survey metadata: `title`, `_options`, `votingStart`, `votingEnd`.
- Permission state split into:
  - `canViewResults`: finalized viewers allowed to request decryption.
  - `_queuedViewers` + `_queuedViewerList`: addresses to auto-authorize once finalized.

### Voting flow
1. The constructor initializes encrypted zero tallies and grants the admin
   temporary visibility.
2. `vote(uint256 optionId, externalEuint64 encryptedOne, bytes proof)`
   - Accepts an encrypted ballot with a zk-proof of well-formedness.
   - Uses `FHE.fromExternal` and `FHE.req(FHE.eq(...))` to guarantee that each
     vote contributes exactly one unit (prevents weight inflation).
   - Accumulates the ciphertext into the option tally and refreshes
     `FHE.allowThis` so the contract can keep mutating it.
3. Votes are locked once `votingEnd` passes; the admin calls `finalize()` which:
   - Marks the survey finalized and grants `FHE.allow` permissions to the admin.
   - Auto-authorizes any queued viewers by propagating permissions across
     every encrypted tally.

### Permission management
- `queueViewer` / `queueViewers` allow the admin to stage viewers before the
  survey ends. The shared `_queueViewer` helper deduplicates logic so a batch
  operation simply skips viewers already authorized, while the single-viewer
  variant surfaces mistakes early.
- `removeQueuedViewer` lets the admin clean up staged viewers prior to
  finalization. A `ViewerRemoved` event is emitted for monitoring.
- `grantView` / `grantViewMany` provide post-finalization access, emitting
  `ViewerGranted`.
- `getQueuedViewers()` enumerates pending viewers, while `isQueued(address)`
  offers a constant-time check.

### Time controls
- `extendVoting(uint256 newEndTime)` increases the deadline (capped at
  `MAX_DURATION` from the survey start) while preventing shrinkage or
  indefinite extension.
- `votingStart`, `votingEnd`, and `finalized` are exposed via
  `getSurveyInfo()`.

### Error & Event surface
- Revert reasons capture misuse (`AlreadyVoted`, `VotingClosed`, `InvalidOption`,
  `NotQueued`, etc.) to help the front-end present accurate UX.
- Events (`VoteCast`, `ViewerQueued`, `ViewerRemoved`, `Finalized`, ...) enable
  indexers to build reactive dashboards without leaking encrypted tallies.

## FHE Integration Notes

- All tallies are stored as `euint64`, matching fhEVM's recommended 64-bit
  unsigned container for counting.
- `FHE.fromExternal(..., proof)` must be called with the proof produced by the
  zkVM. The new `FHE.req(FHE.eq(one, FHE.asEuint64(1)))` gate enforces that a
  ballot represents exactly one vote, closing a common vulnerability where
  voters inject larger ciphertexts.
- `FHE.allowThis(ciphertext)` is refreshed after every mutation to keep the
  contract authorized to update the stored ciphertext.
- `FHE.allow(ciphertext, viewer)` is only emitted once the survey is finalized,
  preserving ballot secrecy during the voting window.

## Front-end Integration Tips

- Use `getSurveyInfo()` to drive countdown timers and disable the voting form
  before/after the active window.
- Consume `hasVoted(address)` to prevent duplicate submissions client-side
  (the contract also enforces this).
- When displaying queue state in the admin UI, pair `getQueuedViewers()` with
  `isQueued(viewer)` to keep the list in sync after removals.
- Tally decryption requires access to the fhEVM gateway; front-end callers with
  `canViewResults[viewer] == true` can request plaintext values off-chain
  through the standard fhEVM RPC flow.

## Development & Testing

```sh
# install dependencies
npm install

# start the Vite dev server (frontend)
npm run dev

# run linting
npm run lint
```

Smart-contract tests are not yet included. For new work, consider:
- Using `forge` or `hardhat` to add integration tests that mock encrypted votes.
- Adding property tests ensuring `queueViewers` and `removeQueuedViewer` keep
  the permission state consistent.
- Simulating multi-viewer finalization to validate permission propagation.

## Deployment Checklist

1. Deploy `SurveyChain` with:
   - A descriptive `title`.
   - Between 2 and 32 options.
   - A voting duration within `[1 hour, 30 days]`.
2. Immediately queue authorized auditors before launch (optional) through
   `queueViewer(s)`.
3. Share the survey address with voters; each voter encrypts the value `1`
   using the fhEVM tooling and submits it alongside the generated proof.
4. After `votingEnd`, call `finalize()` to unlock tallies, grant admin access,
   and promote staged viewers.
5. Use `grantViewMany` for any last-minute observers that should decrypt results.

## Changelog

- Enforced single-unit ballots through `FHE.req`.
- Extracted queue management into `_queueViewer` for cleaner reuse.
- Added `removeQueuedViewer`, `isQueued`, and `ViewerRemoved` to manage staged
  viewers safely.
- Replaced the placeholder README with domain-specific documentation.
