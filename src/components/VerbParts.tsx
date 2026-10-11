// A verb form split into its component parts — stem · tense sign · personal ending —
// e.g. vocā·ba·nt. Shared by the Learn callouts and verb-parse feedback.

export interface Segments {
  stem: string;
  sign?: string;
  ending?: string;
}

export function VerbParts({ stem, sign, ending }: Segments) {
  return (
    <span className="latin verb-parts">
      <span className="vp-stem">{stem}</span>
      {sign && <span className="vp-sign">{sign}</span>}
      {ending && <span className="vp-ending">{ending}</span>}
    </span>
  );
}
