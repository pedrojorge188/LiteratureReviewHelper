import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

type Props = {
  label: string;
  values: string[];
  setValues: (v: string[]) => void;
  placeholder?: string;
};

export function ChipInput({
  label,
  values,
  setValues,
  placeholder = "",
}: Props) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={values}
      onChange={(_e, newValue) => setValues(newValue as string[])}
      filterSelectedOptions
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={`${option}-${index}`}
            label={option}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          fullWidth
          label={label}
          placeholder={values.length ? "" : placeholder}
          onBlur={() => {
            const raw = params.inputProps.value?.toString().trim();

            if (raw) {
              const updated = Array.from(new Set([...values, raw]));
              setValues(updated);
            }

            params.inputProps.value = "";
          }}
        />
      )}
      sx={{
        width: "100%",
        "& .MuiChip-root": { m: "4px 4px 0 0" },
      }}
    />
  );
}
