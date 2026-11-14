# TOON conformance fixtures

The complete official TOON specification **encode** fixture suite, copied verbatim from
`toon-format/spec` at commit `d6db4b04303bdea132351ce45aed612311c850b2`
(`tests/fixtures/encode/*.json`, 9 files / 179 cases), plus the upstream fixture schema as
`_fixtures.schema.json` (renamed only so it is not mistaken for a case file).

Upstream license: MIT, see `LICENSE` in this directory.

Used by `test/toon-conformance.test.ts`, which runs every one of the 179 cases against the pinned
`@toon-format/toon` encoder with the options each case declares. Conformance of the encoder is
checked separately from the `encodeOutput` format policy (`test/toon-population.test.ts`), so a
shape that `encodeOutput` deliberately emits as JSON is never counted as a conformance result.
