// Custom field input for `theme.palette`: variant, photo candidates and the stored palette's state.
// Writes `seed_color` (a candidate or the preview's colour) and `variant`.
import * as React from "react";
import { Box, Button, Field, Flex, Typography } from "@strapi/design-system";
import { useForm } from "@strapi/strapi/admin";
import {
  DEFAULT_VARIANT,
  THEME_CHOICE_EVENT,
  clearStoredChoice,
  isVariant,
  normalizeHex,
  parseStoredSource,
  readStoredChoice,
  type ThemeChoice,
} from "./palette";
import { TEXT, VARIANT_INFO } from "./texts";

interface PaletteInputProps {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  labelAction?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: unknown;
}

// Sibling fields of the `theme` single type
const FIELDS = {
  sourceType: "source_type",
  seed: "seed_color",
  image: "source_image",
  variant: "variant",
  candidates: "image_candidates",
} as const;

const getValue = (values: object, path: string): unknown =>
  (values as Record<string, unknown>)[path];

const mediaId = (value: unknown): unknown => {
  const media = Array.isArray(value) ? value[0] : value;
  return typeof media === "object" && media !== null ? (media as { id?: unknown }).id : null;
};

const PaletteInput = React.forwardRef<HTMLDivElement, PaletteInputProps>(
  ({ name, label, hint, labelAction, required, disabled, error, value }, ref) => {
    const sourceType = useForm("M3PaletteInput", (s) => getValue(s.values, FIELDS.sourceType));
    const seedValue = useForm("M3PaletteInput", (s) => getValue(s.values, FIELDS.seed));
    const variantValue = useForm("M3PaletteInput", (s) => getValue(s.values, FIELDS.variant));
    const candidatesValue = useForm("M3PaletteInput", (s) => getValue(s.values, FIELDS.candidates));
    const imageId = useForm("M3PaletteInput", (s) => mediaId(getValue(s.values, FIELDS.image)));
    const initialImageId = useForm("M3PaletteInput", (s) =>
      mediaId(getValue(s.initialValues, FIELDS.image)),
    );
    const onChange = useForm("M3PaletteInput", (s) => s.onChange);

    // The colour last sent from the preview bar (kept by app.tsx), until applied or dismissed
    const [choice, setChoice] = React.useState<ThemeChoice | null>(readStoredChoice);
    React.useEffect(() => {
      const update = () => setChoice(readStoredChoice());
      window.addEventListener(THEME_CHOICE_EVENT, update);
      return () => window.removeEventListener(THEME_CHOICE_EVENT, update);
    }, []);

    const isImageSource = sourceType === "image";
    const candidates = React.useMemo(
      () =>
        Array.isArray(candidatesValue)
          ? candidatesValue.map(normalizeHex).filter((hex): hex is string => hex !== null)
          : [],
      [candidatesValue],
    );
    const variant = isVariant(variantValue) ? variantValue : DEFAULT_VARIANT;
    // Like the server: an image source without a seed falls back to the first candidate.
    const seed = normalizeHex(seedValue) ?? (isImageSource ? (candidates[0] ?? null) : null);
    const stored = React.useMemo(() => parseStoredSource(value), [value]);

    let status: string | null = null;
    if (!seed) status = TEXT.noSeed;
    else if (!stored) status = TEXT.notGenerated;
    else if (stored.seed !== seed || stored.variant !== variant) status = TEXT.unsaved;

    const pendingChoice =
      choice && (choice.seed !== seed || choice.variant !== variant) ? choice : null;
    const closeChoice = () => {
      clearStoredChoice();
      setChoice(null);
    };

    return (
      <Field.Root ref={ref} name={name} id={name} error={error} hint={hint} required={required}>
        <Flex direction="column" alignItems="stretch" gap={3}>
          <Field.Label action={labelAction}>{label}</Field.Label>

          {pendingChoice && (
            <Box background="primary100" padding={3} hasRadius>
              <Flex gap={3} wrap="wrap" alignItems="center">
                <span
                  aria-hidden
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: pendingChoice.seed,
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Typography variant="omega">
                  {TEXT.choiceTitle}:{" "}
                  <span style={{ fontFamily: "monospace", textTransform: "uppercase" }}>
                    {pendingChoice.seed}
                  </span>{" "}
                  · {VARIANT_INFO[pendingChoice.variant].name}
                </Typography>
                <Button
                  type="button"
                  size="S"
                  disabled={disabled}
                  onClick={() => {
                    onChange(FIELDS.seed, pendingChoice.seed);
                    onChange(FIELDS.variant, pendingChoice.variant);
                    closeChoice();
                  }}
                >
                  {TEXT.choiceApply}
                </Button>
                <Button type="button" size="S" variant="tertiary" onClick={closeChoice}>
                  {TEXT.choiceDismiss}
                </Button>
              </Flex>
            </Box>
          )}

          <Box background="neutral100" padding={3} hasRadius>
            <Typography variant="omega" fontWeight="bold">
              {TEXT.variant}: {VARIANT_INFO[variant].name}
            </Typography>
            <Typography variant="omega" textColor="neutral700" tag="p">
              {VARIANT_INFO[variant].description}
            </Typography>
          </Box>

          {isImageSource && (
            <CandidatePicker
              candidates={candidates}
              selected={seed}
              stale={imageId !== initialImageId}
              disabled={disabled}
              onPick={(hex) => onChange(FIELDS.seed, hex)}
            />
          )}

          {status && (
            <Typography variant="pi" textColor="warning600">
              {status}
            </Typography>
          )}

          <Typography variant="pi" textColor="neutral600">
            {TEXT.previewNote} {TEXT.saveNote}
          </Typography>
          <Field.Hint />
          <Field.Error />
        </Flex>
      </Field.Root>
    );
  },
);

interface CandidatePickerProps {
  candidates: string[];
  selected: string | null;
  stale: boolean;
  disabled?: boolean;
  onPick: (hex: string) => void;
}

const CandidatePicker = ({
  candidates,
  selected,
  stale,
  disabled,
  onPick,
}: CandidatePickerProps) => (
  <Flex direction="column" alignItems="stretch" gap={2}>
    <Typography variant="sigma" textColor="neutral600">
      {TEXT.candidatesTitle}
    </Typography>
    {candidates.length > 0 ? (
      <>
        <Flex gap={2} wrap="wrap">
          {candidates.map((hex) => {
            const isSelected = hex === selected;
            return (
              <button
                key={hex}
                type="button"
                disabled={disabled}
                aria-pressed={isSelected}
                onClick={() => onPick(hex)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 999,
                  border: isSelected ? "2px solid #4945ff" : "1px solid #dcdce4",
                  background: "#ffffff",
                  color: "#32324d",
                  cursor: disabled ? "not-allowed" : "pointer",
                  font: "inherit",
                  fontSize: 13,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: hex,
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                />
                <span style={{ fontFamily: "monospace", textTransform: "uppercase" }}>{hex}</span>
                {isSelected && <span>({TEXT.candidateSelected})</span>}
              </button>
            );
          })}
        </Flex>
        <Typography variant="pi" textColor="neutral600">
          {TEXT.candidatesHint}
        </Typography>
      </>
    ) : (
      <Typography variant="pi" textColor="neutral600">
        {TEXT.candidatesEmpty}
      </Typography>
    )}
    {stale && (
      <Typography variant="pi" textColor="warning600">
        {TEXT.candidatesStale}
      </Typography>
    )}
  </Flex>
);

export { PaletteInput };
