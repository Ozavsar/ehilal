// Custom field input for `theme.palette`: a live preview instead of the raw JSON.
// It only reads the form; the only value it writes is `seed_color` (when a photo candidate is picked).
import * as React from "react";
import { Box, Button, Field, Flex, Grid, Typography } from "@strapi/design-system";
import { useForm } from "@strapi/strapi/admin";
import {
  DEFAULT_VARIANT,
  ROLES,
  generatePreviewSchemes,
  isVariant,
  normalizeHex,
  parseStoredPalette,
  readableTextOn,
  type PreviewSchemes,
  type Role,
  type Scheme,
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

// Sibling fields of the `theme` single type (see the schema).
const FIELDS = {
  sourceType: "source_type",
  seed: "seed_color",
  image: "source_image",
  variant: "variant",
  candidates: "image_candidates",
} as const;

const KEY_PAIRS: [Role, Role][] = [
  ["primary", "onPrimary"],
  ["primaryContainer", "onPrimaryContainer"],
  ["secondary", "onSecondary"],
  ["secondaryContainer", "onSecondaryContainer"],
  ["tertiary", "onTertiary"],
  ["tertiaryContainer", "onTertiaryContainer"],
  ["error", "onError"],
  ["errorContainer", "onErrorContainer"],
  ["surface", "onSurface"],
  ["surfaceContainerLow", "onSurface"],
  ["surfaceContainerHighest", "onSurfaceVariant"],
  ["inverseSurface", "inverseOnSurface"],
  ["outline", "surface"],
  ["outlineVariant", "onSurface"],
];

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

    const [highContrast, setHighContrast] = React.useState(false);
    const [allRoles, setAllRoles] = React.useState(false);

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
    // Keeps the colour picker responsive while the preview recomputes.
    const deferredSeed = React.useDeferredValue(seed);

    const stored = React.useMemo(() => parseStoredPalette(value), [value]);
    const live = React.useMemo(
      () => (deferredSeed ? generatePreviewSchemes(deferredSeed, variant) : null),
      [deferredSeed, variant],
    );
    const schemes = live ?? stored?.schemes ?? null;

    let status: string | null = null;
    if (!live) status = stored ? TEXT.showingStored : TEXT.noSeed;
    else if (!stored) status = TEXT.notGenerated;
    else if (stored.seed !== seed || stored.variant !== variant) status = TEXT.unsaved;

    return (
      <Field.Root ref={ref} name={name} id={name} error={error} hint={hint} required={required}>
        <Flex direction="column" alignItems="stretch" gap={3}>
          <Field.Label action={labelAction}>{label}</Field.Label>

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

          {schemes && (
            <>
              <Flex gap={2} wrap="wrap">
                <Button
                  type="button"
                  size="S"
                  variant={highContrast ? "tertiary" : "secondary"}
                  aria-pressed={!highContrast}
                  onClick={() => setHighContrast(false)}
                >
                  {TEXT.standardContrast}
                </Button>
                <Button
                  type="button"
                  size="S"
                  variant={highContrast ? "secondary" : "tertiary"}
                  aria-pressed={highContrast}
                  onClick={() => setHighContrast(true)}
                >
                  {TEXT.highContrast}
                </Button>
                <Button
                  type="button"
                  size="S"
                  variant="ghost"
                  aria-pressed={allRoles}
                  onClick={() => setAllRoles((v) => !v)}
                >
                  {allRoles ? TEXT.showKeyRoles : TEXT.showAllRoles}
                </Button>
              </Flex>
              <SchemeColumns schemes={schemes} highContrast={highContrast} allRoles={allRoles} />
            </>
          )}

          <Typography variant="pi" textColor="neutral600">
            {TEXT.saveNote}
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

interface SchemeColumnsProps {
  schemes: PreviewSchemes;
  highContrast: boolean;
  allRoles: boolean;
}

const SchemeColumns = ({ schemes, highContrast, allRoles }: SchemeColumnsProps) => {
  const columns = [
    { title: TEXT.light, scheme: highContrast ? schemes["light-high-contrast"] : schemes.light },
    { title: TEXT.dark, scheme: highContrast ? schemes["dark-high-contrast"] : schemes.dark },
  ];
  return (
    <Grid.Root gap={4}>
      {columns.map(({ title, scheme }) => (
        <Grid.Item key={title} col={6} s={12} direction="column" alignItems="stretch" gap={3}>
          <Typography variant="sigma" textColor="neutral600">
            {title}
          </Typography>
          <SampleUi scheme={scheme} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 6,
            }}
          >
            {allRoles
              ? ROLES.map((role) => (
                  <RoleTile
                    key={role}
                    name={role}
                    bg={scheme[role]}
                    fg={readableTextOn(scheme[role])}
                  />
                ))
              : KEY_PAIRS.map(([bg, fg]) => (
                  <RoleTile key={bg} name={bg} bg={scheme[bg]} fg={scheme[fg]} />
                ))}
          </div>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
};

const RoleTile = ({ name, bg, fg }: { name: string; bg: string; fg: string }) => (
  <div
    style={{
      background: bg,
      color: fg,
      padding: 8,
      borderRadius: 8,
      minHeight: 52,
      border: "1px solid rgba(0, 0, 0, 0.08)",
      fontSize: 12,
      lineHeight: 1.4,
      overflowWrap: "anywhere",
    }}
  >
    <div style={{ fontWeight: 600 }}>{name}</div>
    <div style={{ fontFamily: "monospace", textTransform: "uppercase" }}>{bg}</div>
  </div>
);

// A few site-like components drawn with the scheme's roles. Decorative, so hidden from assistive tech.
const SampleUi = ({ scheme: c }: { scheme: Scheme }) => {
  const pill: React.CSSProperties = {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  };
  return (
    <div
      aria-hidden
      style={{
        background: c.surface,
        color: c.onSurface,
        border: `1px solid ${c.outlineVariant}`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontSize: 14,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700 }}>{TEXT.sample.title}</div>
      <div style={{ color: c.onSurfaceVariant }}>
        {TEXT.sample.body}{" "}
        <span style={{ color: c.primary, textDecoration: "underline" }}>{TEXT.sample.link}</span>.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <span style={{ ...pill, background: c.primary, color: c.onPrimary }}>
          {TEXT.sample.filled}
        </span>
        <span style={{ ...pill, background: c.secondaryContainer, color: c.onSecondaryContainer }}>
          {TEXT.sample.tonal}
        </span>
        <span style={{ ...pill, border: `1px solid ${c.outline}`, color: c.primary }}>
          {TEXT.sample.outlined}
        </span>
      </div>
      <div
        style={{
          background: c.surfaceContainerLow,
          border: `1px solid ${c.outlineVariant}`,
          borderRadius: 12,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span
          style={{
            alignSelf: "flex-start",
            background: c.tertiaryContainer,
            color: c.onTertiaryContainer,
            borderRadius: 8,
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {TEXT.sample.chip}
        </span>
        <div style={{ fontWeight: 600 }}>{TEXT.sample.cardTitle}</div>
        <div style={{ color: c.onSurfaceVariant }}>{TEXT.sample.cardBody}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, color: c.error }}>{TEXT.sample.fieldLabel}</span>
        <div style={{ border: `2px solid ${c.error}`, borderRadius: 4, padding: "8px 12px" }}>
          {TEXT.sample.fieldValue}
        </div>
        <span style={{ fontSize: 12, color: c.error }}>{TEXT.sample.fieldError}</span>
      </div>
    </div>
  );
};

export { PaletteInput };
