# Component Specs with Conformance

Each `.md` file in this directory defines:

1. **Contract Spec**  
   - Purpose, responsibilities, inputs, outputs, behavior, and diagnostics.

2. **Conformance Block** (inside ```conformance … ``` fenced section)  
   - Machine-readable test definitions consumed by the Conformance Runner.

---

## Running Conformance Tests

1. Ensure you have an implementation of the component built, exporting:
   ```ts
   export function <ComponentName>(props: ...): JSX.Element;
   export const capabilities = { component: "<ComponentName>", version: "1.0.0" };
   ```

   The implementation should also include `data-testid` attributes as listed in the spec’s `selectors`.

2. Run the Conformance Runner:
   ```bash
   node runner-jsx.mjs --spec ./<ComponentSpec>.md --impl ./<component-path>/Component.js
   ```

   - `--spec` → path to the spec `.md` file.  
   - `--impl` → built implementation to test.

3. The runner will:
   - Parse the spec.
   - Mount the component with fixtures.
   - Drive interactions (click, drag, wheel).
   - Verify callbacks and DOM expectations.

4. Results will be shown as ✔ pass / ✖ fail, with details.

---

## Example

```bash
node runner-jsx.mjs --spec ../Components/NodeRendererSpecs.md --impl .//Components/NodeRenderer.js
```

```
✓ renders node element
✓ click selects node
✓ toggle collapse via chevron
```

---

## Notes
- Specs are versioned (e.g., `/v1` in the import path) so multiple versions can coexist.  
- To update a component contract, create a new spec file (e.g., `NodeRendererSpecs-v2.md`).

